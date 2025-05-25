import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.loadLoginLogs = async () => {
  const emailFilter = document.getElementById("filterEmail").value.toLowerCase();
  const reasonFilter = document.getElementById("filterReason").value.toLowerCase();
  const tableBody = document.getElementById("loginLogs").getElementsByTagName("tbody")[0];

  tableBody.innerHTML = "";

  const q = query(collection(db, "loginAttempts"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();
    const email = data.email?.toLowerCase() || "";
    const reason = data.reason?.toLowerCase() || "";

    if (
      (emailFilter && !email.includes(emailFilter)) ||
      (reasonFilter && !reason.includes(reasonFilter))
    ) return;

    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${data.email}</td>
      <td>${data.reason}</td>
      <td>${data.timestamp?.toDate().toLocaleString() || "Pending"}</td>
    `;
  });
};

setInterval(loadLoginLogs, 30000);
window.onload = loadLoginLogs;
