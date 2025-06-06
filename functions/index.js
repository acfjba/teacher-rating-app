// functions/index.js

const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');

// Initialize the Firebase Admin SDK
initializeApp();
const db = getFirestore();

// Read Gmail credentials from environment variables
// (set these in Firebase Console → Functions → Configuration)
const gmailEmail = process.env.GMAIL_EMAIL;
const gmailPassword = process.env.GMAIL_PASSWORD;

// Create a Nodemailer transporter using Gmail SMTP
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// Helper: ensure caller is authenticated and has "admin" or "superadmin" role
async function verifyAdmin(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must sign in to send bulk email.'
    );
  }
  const uid = context.auth.uid;
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'User record not found.'
    );
  }
  const { role } = userSnap.data();
  if (role !== 'admin' && role !== 'superadmin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can send bulk email.'
    );
  }
  return true;
}

/**
 * sendBulkEmail (callable):
 *
 *   Payload:
 *   {
 *     emails: [ "a@example.com", "b@example.com", … ],
 *     subject: "Your Subject Here",
 *     htmlBody: "<h1>Hello</h1><p>…</p>"
 *   }
 *
 *   Returns:
 *   {
 *     successCount: number,
 *     failureCount: number,
 *     failures: [ { email: string, error: string }, … ]
 *   }
 */
exports.sendBulkEmail = functions
  .runWith({ memory: '256MB', timeoutSeconds: 300 })
  .https.onCall(async (data, context) => {
    // 1) Verify the caller is an admin
    await verifyAdmin(context);

    // 2) Validate inputs
    const { emails, subject, htmlBody } = data || {};
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '`emails` must be a non-empty array.'
      );
    }
    if (!subject || typeof subject !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '`subject` must be a string.'
      );
    }
    if (!htmlBody || typeof htmlBody !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '`htmlBody` must be a string.'
      );
    }

    // 3) Send in batches to avoid Gmail throttling
    let successCount = 0;
    let failureCount = 0;
    const failures = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const sendPromises = batch.map(async (toEmail) => {
        const mailOptions = {
          from: `"Your App" <${gmailEmail}>`,
          to: toEmail,
          subject: subject,
          html: htmlBody
        };
        try {
          await mailTransport.sendMail(mailOptions);
          successCount++;
        } catch (err) {
          failureCount++;
          failures.push({ email: toEmail, error: err.toString() });
        }
      });

      await Promise.all(sendPromises);

      if (i + BATCH_SIZE < emails.length) {
        // Pause 2 seconds between batches
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // 4) Log summary into Firestore under /mailLogs
    await db.collection('mailLogs').add({
      timestamp: FieldValue.serverTimestamp(),
      requestedBy: context.auth.uid,
      subject: subject,
      total: emails.length,
      successCount,
      failureCount
    });

    // 5) Return results
    return { successCount, failureCount, failures };
  });
