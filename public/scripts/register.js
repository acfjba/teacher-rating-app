
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from '../firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.register = async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const invite = document.getElementById("invite").value.toLowerCase().trim();
  const error = document.getElementById("error");

  let role = "teacher";
  if (invite === "head") role = "head";
  else if (invite === "superadmin") role = "superadmin";
  else if (invite !== "teacher") {
    error.textContent = "Invalid invite code.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      role
    });
    window.location.href = "/login.html";
  } catch (err) {
    error.textContent = err.message;
  }
};

// Auto-fill invite code from URL
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const invite = urlParams.get("invite");
  if (invite) {
    document.getElementById("invite").value = invite;
  }
});
