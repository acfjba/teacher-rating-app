import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  const table = document.getElementById("userTable");
  table.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.email}</td>
      <td>${data.role || 'N/A'}</td>
      <td>${data.schoolID || 'N/A'}</td>
    `;
    table.appendChild(row);
  });
}

loadUsers();
