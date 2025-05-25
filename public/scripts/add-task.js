import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { firebaseConfig } from './firebase-config.js';

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Wait for login state
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("⚠️ You must be logged in to submit a task.");
    location.href = "login.html";
    return;
  }

  document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const week = document.getElementById('week').value;
    const term = document.getElementById('term').value;
    const task = document.getElementById('task').value.trim();
    const statusEl = document.getElementById('status');
    const errorEl = document.getElementById('error');

    statusEl.textContent = '';
    errorEl.textContent = '';

    try {
      // ✅ Fetch schoolID from Firestore user profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const schoolID = userDoc.exists() ? userDoc.data().schoolID : "unknown";

      // ✅ Submit task to Firestore
      await addDoc(collection(db, "tasks"), {
        week,
        term,
        task,
        teacherEmail: user.email,
        schoolID,
        timestamp: serverTimestamp()
      });

      // ✅ Log submission to logs collection
      await addDoc(collection(db, "logs"), {
        action: "Task Submitted",
        teacherEmail: user.email,
        schoolID,
        week,
        term,
        timestamp: serverTimestamp()
      });

      statusEl.textContent = "✅ Task submitted successfully!";
      document.getElementById('taskForm').reset();

    } catch (error) {
      console.error("❌ Error submitting task:", error);
      errorEl.textContent = "❌ Failed to submit task: " + error.message;
    }
  });
});
