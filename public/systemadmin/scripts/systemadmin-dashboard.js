import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const statusEl = document.getElementById("status");
const table = document.getElementById("userTable");
const tbody = table.querySelector("tbody");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    statusEl.textContent = "Redirecting to login...";
    window.location.href = "login.html";
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) throw new Error("User profile missing in Firestore.");

    const userData = userDoc.data();
    if (userData.role !== "superadmin") {
      statusEl.textContent = "Access denied. Super Admins only.";
      return;
    }

    const snapshot = await getDocs(collection(db, "users"));
    tbody.innerHTML = "";
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = `<tr>
        <td>${data.name || "—"}</td>
        <td>${data.email}</td>
        <td>${data.role}</td>
      </tr>`;
      tbody.innerHTML += row;
    });

    statusEl.style.display = "none";
    table.style.display = "table";
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
  }
});
