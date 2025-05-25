import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const weekly = {};      // { week: [ratings] }
const terms = { 1: [], 2: [], 3: [] }; // term ranges
const yearly = {};      // { teacherEmail: [ratings] }

function addToBucket(bucket, key, value) {
  if (!bucket[key]) bucket[key] = [];
  bucket[key].push(value);
}

function avg(arr) {
  return arr.length ? (arr.reduce((a, b) => a + b) / arr.length).toFixed(2) : "N/A";
}

async function calculateAverages() {
  const snapshot = await getDocs(collection(db, 'tasks'));

  snapshot.forEach(doc => {
    const task = doc.data();
    if (typeof task.rating === 'number') {
      // Weekly
      addToBucket(weekly, task.week, task.rating);

      // Terms
      const term = task.week <= 5 ? 1 : task.week <= 10 ? 2 : 3;
      terms[term].push(task.rating);

      // Yearly by teacher
      const email = task.teacherEmail || "Unknown";
      addToBucket(yearly, email, task.rating);
    }
  });

  renderTables();
}

function renderTables() {
  const weeklyTable = document.getElementById("weeklyTable");
  for (const week in weekly) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>Week ${week}</td><td>${avg(weekly[week])}</td>`;
    weeklyTable.appendChild(row);
  }

  const termTable = document.getElementById("termTable");
  [1, 2, 3].forEach(term => {
    const weeks = term === 1 ? "1–5" : term === 2 ? "6–10" : "11–14";
    const row = document.createElement("tr");
    row.innerHTML = `<td>Term ${term}</td><td>${weeks}</td><td>${avg(terms[term])}</td>`;
    termTable.appendChild(row);
  });

  const yearlyTable = document.getElementById("yearlyTable");
  for (const email in yearly) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${email}</td><td>${avg(yearly[email])}</td>`;
    yearlyTable.appendChild(row);
  }
}

calculateAverages();
