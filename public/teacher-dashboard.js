import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { firebaseConfig } from "../../common/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const dashboard = document.getElementById('dashboard-content');
const welcomeMsg = document.getElementById('welcomeMsg');
const roleSpan = document.getElementById('role');

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "../common/login.html";
  } else {
    // Optional: load user display name and role from Firestore if you want
    // welcomeMsg.innerText = "Welcome, " + user.email;
    // roleSpan.innerText = "teacher";
    initNav();
    showAddTask();
  }
});

function explain(text) {
  return `<div class="explain"><b>What to do:</b> ${text}</div>`;
}
function qa(question, answer) {
  return `<div class="qa"><b>?</b> ${question}<br><b>Answer:</b> ${answer}</div>`;
}

function initNav() {
  document.getElementById('tab-add-task').onclick = showAddTask;
  document.getElementById('tab-my-tasks').onclick = showMyTasks;
  document.getElementById('tab-ratings').onclick = showRatings;
  document.getElementById('logoutBtn').onclick = () => {
    signOut(auth);
    sessionStorage.clear();
    window.location.href = "../common/login.html";
  };
}

function showAddTask() {
  dashboard.innerHTML =
    explain("Submit your weekly teaching task here. The Head Teacher will review and rate your submission. Use the form below. You can track progress under 'My Submitted Tasks'.") +
    qa("What happens after I submit?", "Your Head Teacher is notified and will review/accept or rate your task. If rejected, you may resubmit.") +
    `<h2>Submit a New Task</h2>
    <form id="addTaskForm" class="tapa-border">
      <label>Task Title:<br>
        <input name="taskTitle" required>
      </label><br>
      <label>Task Description:<br>
        <textarea name="taskDesc" required></textarea>
      </label><br>
      <button type="submit">Submit Task</button>
    </form>
    <div id="taskMsg"></div>
    `;
  document.getElementById('addTaskForm').onsubmit = async function(e){
    e.preventDefault();
    const user = auth.currentUser;
    // Find headteacher for this school (assumes "schoolId" in user profile)
    const teachersRef = collection(db, "users");
    const q = query(teachersRef, where("role", "==", "headteacher"), where("schoolId", "==", user?.schoolId));
    const snap = await getDocs(q);
    const headTeacher = snap.docs[0]?.id || null;
    if (!headTeacher) {
      document.getElementById('taskMsg').innerHTML = '<span style="color:red">No Head Teacher found for your school!</span>';
      return;
    }
    await addDoc(collection(db, "tasks"), {
      title: this.taskTitle.value,
      description: this.taskDesc.value,
      createdBy: user.uid,
      assignedTo: headTeacher,
      schoolId: user?.schoolId,
      status: "submitted",
      submittedAt: serverTimestamp()
    });
    document.getElementById('taskMsg').innerHTML = '<span style="color:green">Task submitted successfully!</span>';
    this.reset();
  };
}

async function showMyTasks() {
  dashboard.innerHTML =
    explain("This section lists all your submitted tasks. Watch for Head Teacher review: Accepted (approved), Rejected (needs resubmission), or Rated (with feedback).") +
    qa("How do I know if my task is accepted?", "You'll see a blue tick and the word 'Accepted'. If rejected, click 'Resubmit'. If rated, see your score and feedback in the next tab.") +
    `<h2>Your Submitted Tasks</h2>
    <div id="tasks-list"></div>`;
  const user = auth.currentUser;
  const q = query(collection(db, "tasks"), where("createdBy", "==", user.uid));
  const snap = await getDocs(q);

  const list = snap.docs.map(d => {
    const t = d.data();
    let status = t.status;
    let feedback = "";
    let action = "";
    if (status === "reviewed") feedback = `<span class="tapa-border" style="color:green;">&#10003; Reviewed by Head Teacher</span>`;
    if (status === "rejected") {
      feedback = `<span class="tapa-border" style="color:red;">&#10060; Rejected by Head Teacher</span>`;
      action = `<button onclick="resubmitTask('${d.id}')">Resubmit</button>`;
    }
    if (status === "accepted") feedback = `<span class="tapa-border" style="color:blue;">&#9989; Accepted</span>`;
    if (status === "rated") feedback = `<span class="tapa-border" style="color:gold;">⭐ Rated</span>`;
    return `<div class="tapa-border" style="margin:8px 0;">
      <strong>${t.title}</strong><br>
      Status: ${status}<br>
      ${feedback}<br>
      ${action}
    </div>`;
  }).join("");

  document.getElementById('tasks-list').innerHTML = list || "<p>No tasks submitted yet.</p>";
}

window.resubmitTask = async function(taskId) {
  const user = auth.currentUser;
  await updateDoc(doc(db, "tasks", taskId), { status: "submitted", resubmittedAt: serverTimestamp() });
  showMyTasks();
}

async function showRatings() {
  dashboard.innerHTML =
    explain("When your Head Teacher rates your submitted task, the feedback and score will appear here.") +
    qa("What if I don't see feedback?", "Check back after your Head Teacher reviews your task. If it's missing, ask your Head Teacher.") +
    `<h2>Ratings & Feedback</h2>
    <div id="ratings-list"></div>`;
  const user = auth.currentUser;
  const q = query(collection(db, "tasks"), where("createdBy", "==", user.uid), where("status", "==", "rated"));
  const snap = await getDocs(q);

  const list = snap.docs.map(d => {
    const t = d.data();
    return `<div class="tapa-border" style="margin:8px 0;">
      <strong>${t.title}</strong><br>
      Rating: <span style="color:gold;">${t.rating ?? "N/A"}</span><br>
      Feedback: ${t.comment ?? "–"}
    </div>`;
  }).join("");

  document.getElementById('ratings-list').innerHTML = list || "<p>No feedback/ratings yet.</p>";
}
