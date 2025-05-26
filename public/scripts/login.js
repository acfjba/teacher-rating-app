import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { firebaseConfig } from './firebase-config.js';

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.login = async function (event) {
  event.preventDefault();

  const schoolID = document.getElementById('schoolID').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const statusEl = document.getElementById('status');
  const spinner = document.getElementById('spinner');
  const errorEl = document.getElementById('error');

  statusEl.textContent = '';
  errorEl.textContent = '';
  spinner.style.display = 'block';

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // ✅ Log successful login
    await addDoc(collection(db, "logs"), {
      email,
      schoolID,
      status: "success",
      timestamp: serverTimestamp()
    });

    // ✅ Fetch role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    spinner.style.display = 'none';

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;
      const status = userData.status;

      console.log("✅ Firestore user data:", userData);
      statusEl.textContent = `✅ Logged in as ${email} (${role})`;

      if (status !== "active") {
        errorEl.textContent = "❌ Account is not active.";
        return;
      }

      // ✅ Redirect based on role (with fallback)
      let target = null;
      if (role === "admin") {
        target = "admin-dashboard.html";
      } else if (role === "headteacher") {
        target = "school-head.html";
      } else if (role === "teacher") {
        target = "teacher-dashboard.html";
      }

      if (target) {
        console.log("➡ Redirecting to:", target);
        location.href = target;
        setTimeout(() => {
          alert("Redirect failed? Click OK to go: " + target);
          location.href = target;
        }, 2000);
      } else {
        errorEl.textContent = "❌ Unknown role. Contact admin.";
      }
    } else {
      errorEl.textContent = "❌ User profile not found in Firestore.";
    }

  } catch (error) {
    spinner.style.display = 'none';
    errorEl.textContent = `❌ ${error.message}`;

    // ❌ Log failed attempt
    await addDoc(collection(db, "logs"), {
      email,
      schoolID,
      status: "failed",
      timestamp: serverTimestamp()
    });
  }
};

// ✅ Logout handler
window.logout = async function () {
  try {
    await signOut(auth);
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = "👋 Logged out successfully.";
    location.href = "login.html";
  } catch (error) {
    const errorEl = document.getElementById('error');
    if (errorEl) errorEl.textContent = `Logout failed: ${error.message}`;
    else alert("Logout failed: " + error.message);
  }
};
