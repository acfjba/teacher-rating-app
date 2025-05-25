import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.submitRequest = async function(event) {
  event.preventDefault();
  const schoolID = document.getElementById('schoolID').value.trim();
  const email = document.getElementById('email').value.trim();

  try {
    await addDoc(collection(db, 'resetRequests'), {
      schoolID,
      email,
      timestamp: serverTimestamp()
    });
    document.getElementById('status').textContent = "✅ Reset request sent. Admin/Headteacher will review.";
  } catch (error) {
    console.error("Error sending reset request: ", error);
    document.getElementById('status').textContent = "❌ Failed to send reset request.";
  }
};
