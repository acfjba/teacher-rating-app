// seedUsers.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Admin SDK with explicit project and credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});
const auth = admin.auth();
const db   = admin.firestore();
// Target the named Firestore database
db.settings({ databaseId: 'dbteacherrating' });

// Default schoolId for most roles; systemAdmin will override to null
const DEFAULT_SCHOOL = 'LTKA3046';

/**
 * Creates or updates a user in Auth and Firestore.
 * @param {string} email        - User email
 * @param {string} password     - User password
 * @param {string} role         - Role: 'systemAdmin','primaryAdmin','headteacher','teacher'
 * @param {string} path         - Firestore collection path
 * @param {string|null} schoolId - schoolId to claim; null for global users
 */
async function createUserIfNeeded(email, password, role, path, schoolId = DEFAULT_SCHOOL) {
  let user;
  try {
    // Fetch existing Auth user
    user = await auth.getUserByEmail(email);
    console.log(`ℹ User ${email} exists (${user.uid}).`);
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      user = await auth.createUser({ email, password });
      console.log(`✅ Created Auth user ${email} (${user.uid}).`);
    } else {
      throw e;
    }
  }

  // Build custom claims
  const claims = { role };
  if (schoolId) {
    claims.schoolId = schoolId;
  }
  await auth.setCustomUserClaims(user.uid, claims);
  console.log(`   • Set claims: ${JSON.stringify(claims)}`);

  // Write Firestore profile if missing
  const docRef = db.doc(`${path}/${user.uid}`);
  const snap   = await docRef.get();
  if (snap.exists) {
    console.log(`ℹ Profile exists at ${path}/${user.uid}.`);
  } else {
    const profile = {
      email,
      role,
      fullName: email.split('@')[0],
      username: email.split('@')[0],
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: (role === 'systemAdmin') ? 'active' : 'pending'
    };
    if (schoolId) {
      profile.schoolId = schoolId;
    }
    await docRef.set(profile);
    console.log(`   • Wrote profile to ${path}/${user.uid}.`);
  }
}

async function seed() {
  try {
    // Global System Administrator (no schoolId)
    await createUserIfNeeded(
      'admin@school.io',
      '123',                     // admin password changed to 123
      'systemAdmin',
      'systemAdmins',
      null
    );

    // Primary School Admin (scoped to DEFAULT_SCHOOL)
    await createUserIfNeeded(
      'primary@school.io',
      'school123',                // changed to school123
      'primaryAdmin',
      `schools/${DEFAULT_SCHOOL}/users`,
      DEFAULT_SCHOOL
    );

    // Head Teacher (scoped)
    await createUserIfNeeded(
      'headteacher@school.io',
      'school123',                // changed to school123
      'headteacher',
      `schools/${DEFAULT_SCHOOL}/users`,
      DEFAULT_SCHOOL
    );

    // Teacher (scoped)
    await createUserIfNeeded(
      'teacher@school.io',
      'school123',                // changed to school123
      'teacher',
      `schools/${DEFAULT_SCHOOL}/users`,
      DEFAULT_SCHOOL
    );

    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
