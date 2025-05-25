import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Not logged in!");
    location.href = "login.html";
    return;
  }
  loadUnratedTasks();
});

async function loadUnratedTasks() {
  const snapshot = await getDocs(query(collection(db, 'tasks'), where("rating", "==", null)));
  const table = document.getElementById("taskRatingTable");
  table.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const task = docSnap.data();
    const docId = docSnap.id;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.teacherEmail ?? "Unknown"}</td>
      <td>${task.week}</td>
      <td>${task.task}</td>
      <td>
        <input type="number" id="rate-${docId}" min="1" max="10" />
      </td>
      <td>
        <button class="button" onclick="submitRating('${docId}')">Rate</button>
      </td>
    `;
    table.appendChild(row);
  });
}

window.submitRating = async function (taskId) {
  const input = document.getElementById(`rate-${taskId}`);
  const rating = Number(input.value);

  if (!rating || rating < 1 || rating > 10) {
    alert("Enter a valid rating between 1 and 10.");
    return;
  }

  try {
    const ref = doc(db, 'tasks', taskId);
    await updateDoc(ref, { rating });
    alert("✅ Rating submitted!");
    loadUnratedTasks(); // reload to update view
  } catch (error) {
    console.error("Error updating rating:", error);
    alert("
