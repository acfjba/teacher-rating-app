import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const role = userDoc.data().role;

      if (role === "head") {
        window.location.href = "head-dashboard.html";
      } else if (role === "teacher") {
        window.location.href = "teacher-dashboard.html";
      } else if (role === "superadmin") {
        window.location.href = "superadmin-dashboard.html";
      } else {
        alert("Unknown role assigned. Contact admin.");
      }
    } else {
      alert("User role not found in Firestore.");
    }
  } catch (error) {
    alert("Login error: " + error.message);
  }
});
