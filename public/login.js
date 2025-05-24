// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ─── 1. Your Firebase config ──────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA69R-DYOlIvArgq2ABJp2KVkFALYOYLm0",
  authDomain: "teacherratingapp.firebaseapp.com",
  databaseURL: "https://teacherratingapp-default-rtdb.firebaseio.com",
  projectId: "teacherratingapp",
  storageBucket: "teacherratingapp.firebasestorage.app",
  messagingSenderId: "114496602504",
  appId: "1:114496602504:web:62d555a0358a32b0cdba3d"
};
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ─── 2. UI Helpers ────────────────────────────────────────────────────────────
const msgBox = document.getElementById("messageBox");
function showMessage(text, type = "error") {
  msgBox.textContent    = text;
  msgBox.className      = type;         // will be either "error" or "success"
  msgBox.style.display  = "block";
  setTimeout(() => msgBox.style.display = "none", 3000);
}

// ─── 3. Error-code → Friendly message map ─────────────────────────────────────
const ERROR_MESSAGES = {
  "auth/invalid-email":            "That email address is malformed.",
  "auth/user-disabled":            "This account has been disabled.",
  "auth/user-not-found":           "No account found with those credentials.",
  "auth/wrong-password":           "Incorrect password. Please try again.",
  "auth/network-request-failed":   "Network error. Check your connection.",
  // add more as needed...
};
function friendlyError(code) {
  return ERROR_MESSAGES[code] || "Login failed. (" + code + ")";
}

// ─── 4. Tab-switching UI ───────────────────────────────────────────────────────
const tabSchool    = document.getElementById("tabSchool");
const tabAdmin     = document.getElementById("tabAdmin");
const panelSchool  = document.getElementById("schoolLoginPanel");
const panelAdmin   = document.getElementById("adminLoginPanel");
function toggleTab(isSchool) {
  if (isSchool) {
    tabSchool.classList.remove("inactive");
    tabAdmin.classList.add("inactive");
    panelSchool.classList.remove("hidden");
    panelAdmin.classList.add("hidden");
  } else {
    tabAdmin.classList.remove("inactive");
    tabSchool.classList.add("inactive");
    panelAdmin.classList.remove("hidden");
    panelSchool.classList.add("hidden");
  }
}
toggleTab(true);
tabSchool.addEventListener("click", () => toggleTab(true));
tabAdmin.addEventListener("click",  () => toggleTab(false));

// ─── 5. School-login handler ──────────────────────────────────────────────────
document.getElementById("schoolLoginBtn").addEventListener("click", async () => {
  const schoolId = document.getElementById("schoolId").value.trim();
  const email    = document.getElementById("schoolEmail").value.trim();
  const pwd      = document.getElementById("schoolPassword").value;
  if (!schoolId || !email || !pwd) {
    return showMessage("Please fill in all fields.");
  }

  try {
    // sign in
    const { user } = await signInWithEmailAndPassword(auth, email, pwd);

    // fetch user doc (assuming you store all users under 'users' with a schoolId field)
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      return showMessage("User record not found.");
    }
    const data = snap.data();

    // check role & school match
    if (data.role === "teacher" && data.schoolId === schoolId) {
      showMessage("Login successful!", "success");
      setTimeout(() => location.href = "teacher-dashboard.html", 1500);
    } else {
      showMessage("Access denied. Wrong role or school.");
    }
  } catch (err) {
    showMessage(friendlyError(err.code));
  }
});

// ─── 6. Admin-login handler ───────────────────────────────────────────────────
document.getElementById("adminLoginBtn").addEventListener("click", async () => {
  const email = document.getElementById("adminEmail").value.trim();
  const pwd   = document.getElementById("adminPassword").value;
  if (!email || !pwd) {
    return showMessage("Please fill in both email and password.");
  }

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, pwd);
    const snap = await getDoc(doc(db, "systemAdmins", user.uid));
    if (!snap.exists()) {
      return showMessage("Admin record not found.");
    }
    if (snap.data().role === "admin") {
      showMessage("Admin login successful!", "success");
      setTimeout(() => location.href = "admin-dashboard.html", 1500);
    } else {
      showMessage("Access denied.");
    }
  } catch (err) {
    showMessage(friendlyError(err.code));
  }
});
