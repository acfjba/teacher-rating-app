import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, doc, getDocs, query, where, updateDoc, serverTimestamp, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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
    // Optionally load display name/role
    // welcomeMsg.innerText = "Welcome, " + user.email;
    // roleSpan.innerText = "headteacher";
    initNav();
    showReview();
  }
});

function explain(text) {
  return `<div class="explain"><b>What to do:</b> ${text}</div>`;
}
function qa(question, answer) {
  return `<div class="qa"><b>?</b> ${question}<br><b>Answer:</b> ${answer}</div>`;
}

function initNav() {
  document.getElementById('tab-review').onclick = showReview;
  document.getElementById('tab-summary').onclick = showSummary;
  document.getElementById('tab-ratings').onclick = showRatings;
  document.getElementById('logoutBtn').onclick = () => {
    signOut(auth);
    sessionStorage.clear();
    window.location.href = "../common/login.html";
  };
}

// REVIEW TAB: See all submitted tasks from teachers in your school, review, accept/reject/rate.
async function showReview() {
  dashboard.innerHTML =
    explain("Review all teacher-submitted tasks below. Accept, reject, or rate them with a score and feedback. When you rate, an email will be sent to the teacher.") +
    qa("What happens when I rate a task?", "Your feedback and score will be saved, the teacher will see it, and a notification is logged (for email sending).") +
    `<h2>Review Teacher Tasks</h2>
    <div id="tasks-list"></div>`;

  const user = auth.currentUser;
  // Find tasks assigned to headteacher and status is 'submitted' or 'resubmitted'
  const q = query(
    collection(db, "tasks"),
    where("assignedTo", "==", user.uid),
    where("status", "in", ["submitted", "resubmitted"])
  );
  const snap = await getDocs(q);

  let listHtml = "";

  for (const d of snap.docs) {
    const t = d.data();
    // Get teacher user info
    let teacherInfo = "(loading...)";
    try {
      const teacherSnap = await getDoc(doc(db, "users", t.createdBy));
      if (teacherSnap.exists()) {
        const u = teacherSnap.data();
        teacherInfo = `${u.name} (${u.email})`;
      }
    } catch (e) { /* fail silently */ }
    listHtml += `
      <div class="tapa-border" style="margin:8px 0;">
        <b>Teacher:</b> ${teacherInfo}<br>
        <b>Title:</b> ${t.title}<br>
        <b>Description:</b> ${t.description}<br>
        <form onsubmit="return false;" id="taskActionForm_${d.id}">
          <button type="button" onclick="acceptTask('${d.id}')">Accept</button>
          <button type="button" onclick="rejectTask('${d.id}')">Reject</button>
          <span style="font-weight:bold;">&nbsp;|&nbsp;Rate:&nbsp;</span>
          <input type="number" min="1" max="5" id="rateVal_${d.id}" style="width:40px;" placeholder="★">
          <input type="text" id="rateComment_${d.id}" style="width:120px;" placeholder="Feedback">
          <button type="button" onclick="rateTask('${d.id}')">Submit Rating</button>
        </form>
        <div id="msg_${d.id}"></div>
      </div>
    `;
  }

  document.getElementById('tasks-list').innerHTML = listHtml || "<p>No tasks pending review.</p>";
}

// Helper functions to update tasks and notify teachers
window.acceptTask = async function(taskId) {
  await updateDoc(doc(db, "tasks", taskId), { status: "accepted", reviewedAt: serverTimestamp() });
  showReview();
};
window.rejectTask = async function(taskId) {
  await updateDoc(doc(db, "tasks", taskId), { status: "rejected", reviewedAt: serverTimestamp() });
  showReview();
};
window.rateTask = async function(taskId) {
  const rateVal = document.getElementById(`rateVal_${taskId}`).value;
  const rateComment = document.getElementById(`rateComment_${taskId}`).value;
  if (!rateVal) {
    document.getElementById(`msg_${taskId}`).innerHTML = '<span style="color:red;">Please enter a rating value.</span>';
    return;
  }
  // Get task info (to find teacher)
  const tSnap = await getDoc(doc(db, "tasks", taskId));
  const tData = tSnap.data();
  await updateDoc(doc(db, "tasks", taskId), {
    status: "rated",
    rating: rateVal,
    comment: rateComment,
    ratedAt: serverTimestamp()
  });
  // Send notification ("email") to teacher
  await addDoc(collection(db, "notifications"), {
    to: tData.createdBy,
    type: "task_rated",
    taskId: taskId,
    comment: rateComment,
    rating: rateVal,
    sentAt: serverTimestamp()
  });
  document.getElementById(`msg_${taskId}`).innerHTML = '<span style="color:green;">Task rated & teacher notified!</span>';
  showReview();
}

// SUMMARY TAB: Show all task statuses for this headteacher's school
async function showSummary() {
  dashboard.innerHTML =
    explain("Summary of all tasks: accepted, rejected, rated. See how your teachers are progressing.") +
    qa("Why does this summary matter?", "It helps you track teacher progress, see trends, and support teachers who need help.") +
    `<h2>Task Summary</h2>
    <div id="summary-list"></div>`;
  // For now, just list stats
  const user = auth.currentUser;
  const q = query(collection(db, "tasks"), where("assignedTo", "==", user.uid));
  const snap = await getDocs(q);

  let accepted=0, rejected=0, rated=0, submitted=0;
  snap.docs.forEach(d => {
    const s = d.data().status;
    if(s==="accepted") accepted++;
    if(s==="rejected") rejected++;
    if(s==="rated") rated++;
    if(s==="submitted"||s==="resubmitted") submitted++;
  });

  document.getElementById('summary-list').innerHTML = `
    <b>Total tasks:</b> ${snap.size}<br>
    <b>Submitted:</b> ${submitted}<br>
    <b>Accepted:</b> ${accepted}<br>
    <b>Rejected:</b> ${rejected}<br>
    <b>Rated:</b> ${rated}
  `;
}

// RATINGS TAB: Show all ratings you've given
async function showRatings() {
  dashboard.innerHTML =
    explain("View all the ratings and feedback you've given to teachers, for your records and accountability.") +
    qa("How do I know what feedback I gave?", "All feedback and scores you enter are recorded and visible here.") +
    `<h2>Ratings Given to Teachers</h2>
    <div id="ratings-list"></div>`;
  const user = auth.currentUser;
  const q = query(collection(db, "tasks"), where("assignedTo", "==", user.uid), where("status", "==", "rated"));
  const snap = await getDocs(q);

  let listHtml = "";
  for (const d of snap.docs) {
    const t = d.data();
    let teacherInfo = "(loading...)";
    try {
      const teacherSnap = await getDoc(doc(db, "users", t.createdBy));
      if (teacherSnap.exists()) {
        const u = teacherSnap.data();
        teacherInfo = `${u.name} (${u.email})`;
      }
    } catch (e) {}
    listHtml += `<div class="tapa-border" style="margin:8px 0;">
      <b>Teacher:</b> ${teacherInfo}<br>
      <b>Title:</b> ${t.title}<br>
      <b>Rating:</b> <span style="color:gold;">${t.rating ?? "N/A"}</span><br>
      <b>Feedback:</b> ${t.comment ?? "–"}
    </div>`;
  }

  document.getElementById('ratings-list').innerHTML = listHtml || "<p>No ratings yet.</p>";
}
