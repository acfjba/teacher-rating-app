import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import { firebaseConfig } from './firebase-config.js';

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Wait for user auth state
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("⚠️ You must be logged in to send an invite.");
    return;
  }

  console.log("✅ Logged in as:", user.email, "| UID:", user.uid);

  // ✅ Attach form handler once user is ready
  document.getElementById('inviteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const schoolID = document.getElementById('schoolID').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const statusEl = document.getElementById('status');
    const errorEl = document.getElementById('error');

    statusEl.textContent = '';
    errorEl.textContent = '';

    try {
      await addDoc(collection(db, 'invites'), {
        schoolID,
        email,
        role,
        invitedBy: user.email,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      statusEl.textContent = "✅ Invite sent successfully!";
      document.getElementById('inviteForm').reset();

    } catch (error) {
      console.error("❌ Error sending invite:", error);
      errorEl.textContent = "❌ Failed to send invite: " + error.message;
    }
  });
});
