// scripts/auth.js
import { initializeApp }       from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
                             from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs }
                             from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 1. Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA69R-DYOlIvArgq2ABJp2KVkFALYOYLm0",
  authDomain: "teacherratingapp.firebaseapp.com",
  databaseURL: "https://teacherratingapp-default-rtdb.firebaseio.com",
  projectId: "teacherratingapp",
  storageBucket: "teacherratingapp.firebasestorage.app",
  messagingSenderId: "114496602504",
  appId: "1:114496602504:web:62d555a0358a32b0cdba3d"
  // ...
};
const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
// 2. Session helpers
export function setSession({ name, role, school }) {
  sessionStorage.setItem("userName", name);
  sessionStorage.setItem("userRole", role);
  sessionStorage.setItem("userSchool", school || "");
}
export function clearSession() {
  sessionStorage.clear();
}

// 3. Display popup
export function showMessage(msg, type = "success") {
  const box = document.getElementById("messageBox");
  box.className = `alert alert-${type==="success"?"success":"danger"}`;
  box.textContent = msg;
  box.style.display = "block";
  setTimeout(() => box.style.display = "none", 3000);
}

// 4. Login functions
export async function loginSchool(id, email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  const q = query(collection(db, "schools", id, "users"), where("email","==",email));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No user found for this School ID");
  const data = snap.docs[0].data();
  setSession({ name: data.name, role: data.role, school: id });
}

export async function loginAdmin(username, password) {
  // your admin email logic (e.g. username@example.com)
  const email = username;
  await signInWithEmailAndPassword(auth, email, password);
  const q = query(collection(db, "administrators"), where("email","==",email));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Not an administrator");
  const data = snap.docs[0].data();
  setSession({ name: data.name, role: "admin" });
}

// 5. Logout
export async function logout() {
  await signOut(auth);
  clearSession();
  window.location = "login.html";
}

// 6. On each page load, verify login
export function enforceLogin() {
  onAuthStateChanged(auth, user => {
    const name = sessionStorage.getItem("userName");
    if (!user || !name) {
      showMessage("Please log in first", "danger");
      setTimeout(() => window.location = "login.html", 1500);
    }
  });
}

// 7. Role-based nav
export function configureNav() {
  const role = sessionStorage.getItem("userRole");
  document.getElementById("link-user-management").style.display =
    role === "admin" ? "block" : "none";
  // etc for other links...
  // Logout link:
  const logoutLink = document.getElementById("link-logout");
  logoutLink.onclick = () => logout();
}
