import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadLogs() {
  const snapshot = await getDocs(collection(db, "logs"));
  const table = document.getElementById("logTable");
  table.innerHTML = "";

  snapshot.forEach(doc => {
    const log = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.email || 'N/A'}</td>
      <td>${log.schoolID || 'N/A'}</td>
      <td style="color:${log.status === 'success' ? 'green' : 'red'}">${log.status}</td>
      <td>${log.timestamp?.toDate().toLocaleString() || 'N/A'}</td>
    `;
    table.appendChild(row);
  });
}

loadLogs();
