// inspectData.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Init Admin SDK pointed at your database
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});
const db = admin.firestore();
db.settings({ databaseId: 'dbteacherrating' });

async function inspect() {
  console.log('=== systemAdmins ===');
  const sys = await db.collection('systemAdmins').get();
  sys.forEach(d => console.log(d.id, d.data()));

  console.log('\n=== schools/LTKA3046/users ===');
  const users = await db.collection('schools').doc('LTKA3046').collection('users').get();
  users.forEach(d => console.log(d.id, d.data()));

  console.log('\n=== schools/LTKA3046/tasks ===');
  const tasks = await db.collection('schools').doc('LTKA3046').collection('tasks').get();
  tasks.forEach(d => console.log(d.id, d.data()));
}

inspect().catch(e => {
  console.error('Error inspecting:', e);
  process.exit(1);
});
