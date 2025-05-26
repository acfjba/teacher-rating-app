const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // 🔁 Update if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupInitialFirestoreStructure() {
  const users = [
    { email: 'admin@example.com', role: 'admin', schoolID: 'school1', status: 'loggedOut' },
    { email: 'head@example.com', role: 'headteacher', schoolID: 'school1', status: 'loggedOut' },
    { email: 'teacher@example.com', role: 'teacher', schoolID: 'school1', status: 'loggedOut' },
  ];

  for (const user of users) {
    try {
      const userRecord = await admin.auth().getUserByEmail(user.email);
      const uid = userRecord.uid;

      // Save Firestore user doc with UID
      await db.collection('users').doc(uid).set({
        ...user,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // (Optional) Set custom claims for use in rules
      await admin.auth().setCustomUserClaims(uid, {
        role: user.role,
        schoolID: user.schoolID
      });

      console.log(`✅ Added user: ${user.email} with UID: ${uid}`);
    } catch (err) {
      console.error(`❌ Error for ${user.email}:`, err.message);
    }
  }

  // Add sample invite
  await db.collection('invites').add({
    email: 'newteacher@example.com',
    role: 'teacher',
    schoolID: 'school1',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  // Add sample task
  await db.collection('tasks').add({
    schoolID: 'school1',
    teacherEmail: 'teacher@example.com',
    weekNumber: 1,
    term: 'Term 1',
    task: 'Complete class observations',
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    ratedBy: '',
    rating: null
  });

  // Add KPI assessment
  await db.collection('kpi_assessments').add({
    headteacherEmail: 'head@example.com',
    roleDescription: 'Manage school activities',
    activities: 'Supervision, Evaluation',
    ownComments: 'Need more support staff',
    rating: 7,
    term: 'Term 1',
    submittedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('🔥 Initial Firestore structure created.');
}

setupInitialFirestoreStructure().catch(console.error);
