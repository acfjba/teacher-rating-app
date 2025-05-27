import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Logout button
window.logout = async function () {
  await signOut(auth);
  alert("Logged out successfully.");
  location.href = "login.html";
};

// Load tasks on auth
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push(doc.data());
    });

    displayTasks(tasks);
    displaySummary(tasks);
  } else {
    location.href = "login.html";
  }
});

function displayTasks(tasks) {
  const table = document.getElementById("taskTable");
  table.innerHTML = "";

  tasks.forEach(task => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.week}</td>
      <td>${task.task}</td>
      <td>${task.rating ?? "Pending"}</td>
      <td><button onclick="deleteTask('${task.week}')">Delete</button></td>
    `;
    table.appendChild(row);
  });
}

function displaySummary(tasks) {
  const summary = document.getElementById("summaryTable");
  summary.innerHTML = "";

  const termRatings = {};
  tasks.forEach(t => {
    if (t.rating !== undefined) {
      const term = Math.ceil(t.week / 5);
      if (!termRatings[term]) termRatings[term] = [];
      termRatings[term].push(Number(t.rating));
    }
  });

  for (const term in termRatings) {
    const avg = (
      termRatings[term].reduce((a, b) => a + b, 0) / termRatings[term].length
    ).toFixed(2);

    const row = document.createElement("tr");
    row.innerHTML = `<td>Term ${term}</td><td>${avg}</td>`;
    summary.appendChild(row);
  }
}
