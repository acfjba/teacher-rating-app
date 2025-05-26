import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { firebaseConfig } from '../firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const tabSchool = document.getElementById('tab-school');
const tabAdmin  = document.getElementById('tab-admin');
const formSchool= document.getElementById('login-school');
const formAdmin = document.getElementById('login-admin');

function switchTo(admin) {
  formSchool.classList.toggle('hidden', admin);
  formAdmin.classList.toggle('hidden', !admin);
  tabSchool.classList.toggle('active', !admin);
  tabAdmin.classList.toggle('active', admin);
}

tabSchool.addEventListener('click', () => switchTo(false));
tabAdmin.addEventListener('click', () => switchTo(true));

formSchool.addEventListener('submit', async e => {
  e.preventDefault();
  const sid = e.target.schoolId.value.trim();
  try {
    const cred = await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    const data = snap.data();
    if (!snap.exists() || data.schoolId !== sid) throw new Error('Invalid School ID or user.');
    const role = data.role;
    window.location = {
      teacher: 'dashboards/teacher.html',
      headTeacher: 'dashboards/headteacher.html',
      primaryAdmin: 'dashboards/primaryadmin.html'
    }[role] || 'dashboards/systemadmin.html';
  } catch(err) {
    alert(err.message);
  }
});

formAdmin.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const cred = await signInWithEmailAndPassword(auth, e.target.adminEmail.value, e.target.adminPass.value);
    const data = (await getDoc(doc(db, 'users', cred.user.uid))).data();
    if (data.role !== 'systemAdmin') throw new Error('Not a System Admin.');
    window.location = 'dashboards/systemadmin.html';
  } catch(err) {
    alert(err.message);
  }
});