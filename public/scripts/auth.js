// public/scripts/auth.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// 1. Initialize Firebase (modular SDK)
const firebaseConfig = {
  apiKey: "AIzaSyA69R-DYOlIvArgq2ABJp2KVkFALYOYLm0",
  authDomain: "teacherratingapp.firebaseapp.com",
  projectId: "teacherratingapp",
  storageBucket: "teacherratingapp.appspot.com",
  messagingSenderId: "114496602504",
  appId: "1:114496602504:web:62d555a0358a32b0cdba3d"
};
const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Session helpers
export function setSession({ name, role, school }) {
  sessionStorage.setItem("userName", name);
  sessionStorage.setItem("userRole", role);
  if (school) sessionStorage.setItem("userSchool", school);
}
export function clearSession() {
  sessionStorage.clear();
}

// Display message popup (assumes #messageBox exists)
export function showMessage(msg, type = 'success') {
  const box = document.getElementById('messageBox');
  box.className = type === 'success' ? 'message success' : 'message error';
  box.textContent = msg;
  box.style.display = 'block';
  setTimeout(() => box.style.display = 'none', 3000);
}

// 4. School login
export async function loginSchool(id, email, password) {
  // sign in with email/password
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  // fetch user profile
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error('User record not found.');
  }
  const data = userSnap.data();
  // verify school ID
  if (data.schoolId !== id) {
    throw new Error('School ID does not match.');
  }
  setSession({ name: data.name, role: data.role, school: data.schoolId });
}

// 5. Admin login
export async function loginAdmin(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error('Administrator record not found.');
  }
  const data = userSnap.data();
  if (data.role !== 'systemAdmin') {
    throw new Error('Not an administrator.');
  }
  setSession({ name: data.name, role: data.role });
}

// 6. Logout
export async function logout() {
  await signOut(auth);
  clearSession();
  window.location = 'index.html';
}

// 7. Guard on each page
export function enforceLogin() {
  onAuthStateChanged(auth, user => {
    const name = sessionStorage.getItem('userName');
    if (!user || !name) {
      showMessage('Please log in first', 'error');
      setTimeout(() => window.location = 'index.html', 1500);
    }
  });
}

// 8. Configure navigation links (role-based)
export function configureNav() {
  const role = sessionStorage.getItem('userRole');
  document.querySelectorAll('[data-role-only]').forEach(el => {
    const allowed = el.getAttribute('data-role-only').split(',');
    el.style.display = allowed.includes(role) ? 'block' : 'none';
  });
}
