import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { firebaseConfig } from "../../common/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const dashboard = document.getElementById('dashboard-content');
const welcomeMsg = document.getElementById('welcomeMsg');
const roleSpan = document.getElementById('role');

function explain(text) {
  return `<div class="explain"><b>What to do:</b> ${text}</div>`;
}
function qa(question, answer) {
  return `<div class="qa"><b>?</b> ${question}<br><b>Answer:</b> ${answer}</div>`;
}

// ACCESS CONTROL (primaryadmin only)
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "../common/login.html";
  } else {
    welcomeMsg.innerText = "Welcome, " + (user.displayName || "Primary Admin");
    roleSpan.innerText = "primaryadmin";
    setupNav();
    showDashboard();
  }
});

// Sidebar nav events
function setupNav() {
  document.getElementById('tab-dashboard').onclick = () => {
    setActive('tab-dashboard');
    showDashboard();
  };
  document.getElementById('tab-staff').onclick = () => {
    setActive('tab-staff');
    showStaff();
  };
  document.getElementById('tab-invite').onclick = () => {
    setActive('tab-invite');
    showInvite();
  };
  document.getElementById('tab-summary').onclick = () => {
    setActive('tab-summary');
    showSummary();
  };
  document.getElementById('logoutBtn').onclick = () => {
    signOut(auth);
    sessionStorage.clear();
    window.location.href = "../common/login.html";
  };
}

function setActive(tabId) {
  Array.from(document.querySelectorAll('.sidebar nav button')).forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

// Dashboard quick view
async function showDashboard() {
  dashboard.innerHTML =
    explain("Quick overview of your school's staff, teachers, and recent invites.") +
    `<h2>School Dashboard</h2>
      <div id="dash-quick"></div>`;
  const user = auth.currentUser;
  const qUsers = query(collection(db, "users"), where("schoolId", "==", user.schoolId));
  const usersSnap = await getDocs(qUsers);
  const staffCount = usersSnap.size;
  const teacherCount = usersSnap.docs.filter(d => d.data().role === "teacher").length;

  const qInvites = query(collection(db, "invites"), where("schoolId", "==", user.schoolId));
  const invitesSnap = await getDocs(qInvites);
  const invitesCount = invitesSnap.size;

  document.getElementById('dash-quick').innerHTML = `
    <div class="tapa-border">
      <b>Total Staff:</b> ${staffCount}<br>
      <b>Teachers:</b> ${teacherCount}<br>
      <b>Invites Sent:</b> ${invitesCount}<br>
    </div>
  `;
}

// Staff Records
async function showStaff() {
  dashboard.innerHTML =
    explain("View, search, and manage all your school's staff and teachers.") +
    qa("How do I add a new staff member?", "Use the Invite User tab to send an email invite. To edit staff, click on their card (feature coming soon).") +
    `<h2>Staff & Teachers</h2>
      <div id="staff-list"></div>`;
  const user = auth.currentUser;
  const q = query(collection(db, "users"), where("schoolId", "==", user.schoolId));
  const snap = await getDocs(q);

  const list = snap.docs.map(d => {
    const u = d.data();
    return `<div class="tapa-border" style="margin:8px 0;">
      <strong>${u.name || "(No Name)"}</strong> (${u.role})<br>
      Email: ${u.email}
    </div>`;
  }).join("");
  document.getElementById('staff-list').innerHTML = list || "<p>No staff found.</p>";
}

// Invite User
function showInvite() {
  dashboard.innerHTML =
    explain("Send an email invite to add a new teacher or admin to your school.") +
    qa("How does the invite work?", "The invited user will receive an email (when email service is enabled) and can register using the link.") +
    `<h2>Invite User</h2>
      <form id="inviteForm" class="tapa-border">
        <label>Email: <input type="email" name="email" required /></label><br>
        <label>Role:
          <select name="role">
            <option value="teacher">Teacher</option>
            <option value="primaryadmin">Primary Admin</option>
          </select>
        </label><br>
        <button type="submit">Send Invite</button>
      </form>
      <div id="inviteMsg"></div>`;
  document.getElementById('inviteForm').onsubmit = async function(e) {
    e.preventDefault();
    const user = auth.currentUser;
    const form = e.target;
    await addDoc(collection(db, "invites"), {
      email: form.email.value,
      role: form.role.value,
      invitedBy: user.uid,
      schoolId: user.schoolId,
      status: "pending",
      sentAt: serverTimestamp()
    });
    document.getElementById('inviteMsg').innerHTML = "<span style='color:green'>Invite logged (backend email needed for live delivery).</span>";
    form.reset();
  };
}

// School Summary
async function showSummary() {
  dashboard.innerHTML =
    explain("Summary: All key school stats and recent invites.") +
    qa("What can I learn here?", "Track user totals, role breakdown, and recent invites to manage your school efficiently.") +
    `<h2>School Summary</h2>
      <div id="summary-list"></div>`;
  const user = auth.currentUser;
  const qUsers = query(collection(db, "users"), where("schoolId", "==", user.schoolId));
  const usersSnap = await getDocs(qUsers);
  const teacherCount = usersSnap.docs.filter(d => d.data().role === "teacher").length;
  const adminCount = usersSnap.docs.filter(d => d.data().role === "primaryadmin").length;
  const qInvites = query(collection(db, "invites"), where("schoolId", "==", user.schoolId));
  const invitesSnap = await getDocs(qInvites);

  document.getElementById('summary-list').innerHTML = `
    <div class="tapa-border">
      <b>Teachers:</b> ${teacherCount}<br>
      <b>Primary Admins:</b> ${adminCount}<br>
      <b>Total Users:</b> ${usersSnap.size}<br>
      <b>Invites Sent:</b> ${invitesSnap.size}<br>
    </div>
  `;
}
