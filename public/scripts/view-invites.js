import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadInvites() {
  const snapshot = await getDocs(collection(db, "invites"));
  const table = document.getElementById("inviteTable");
  table.innerHTML = "";

  snapshot.forEach(doc => {
    const invite = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${invite.email}</td>
      <td>${invite.schoolID}</td>
      <td>${invite.role}</td>
      <td>${invite.status}</td>
      <td>${invite.invitedBy}</td>
      <td>${invite.timestamp?.toDate().toLocaleString() || 'N/A'}</td>
    `;
    table.appendChild(row);
  });
}

loadInvites();
