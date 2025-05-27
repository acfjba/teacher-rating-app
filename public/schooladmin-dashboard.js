import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { firebaseConfig } from "../../common/firebase-config.js";

// ---------- Firebase init ----------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ---------- DOM ----------
const content   = document.getElementById('contentArea');
const pageTitle = document.getElementById('pageTitle');
const navBtns   = document.querySelectorAll('.nav-btn');

// helper
function setActive(view){
  navBtns.forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  pageTitle.textContent = view[0].toUpperCase()+view.slice(1);
}
function msg(text,cls='error'){return `<p class="${cls}-msg">${text}</p>`}

// ---------- View load functions ----------
async function loadDashboard(){
  setActive('dashboard');
  const user = auth.currentUser;
  const qU = query(collection(db,'users'),where('schoolId','==',user.schoolId));
  const usersSnap = await getDocs(qU);
  const teachers = usersSnap.docs.filter(d=>d.data().role==='teacher').length;
  const staff    = usersSnap.size;
  const qT = query(collection(db,'tasks'),where('schoolId','==',user.schoolId));
  const taskSnap = await getDocs(qT);
  const pending  = taskSnap.docs.filter(d=>['submitted','resubmitted'].includes(d.data().status)).length;
  content.innerHTML = `
    <div class="card">
      <h3>Quick Stats</h3>
      Teachers: <b>${teachers}</b><br>
      Total Staff: <b>${staff}</b><br>
      Pending Tasks: <b>${pending}</b>
    </div>`;
}

async function loadTasks(){
  setActive('tasks');
  content.innerHTML = '<div class="card"><h3>Loading tasks…</h3></div>';
  const user = auth.currentUser;
  const snap = await getDocs(query(collection(db,'tasks'),where('schoolId','==',user.schoolId)));
  let rows='';
  snap.forEach(d=>{
    const t=d.data();
    rows+=`<tr><td>${t.title}</td><td>${t.createdByName||''}</td><td>${t.status}</td></tr>`;
  });
  content.innerHTML = `
    <div class="card">
      <h3>School Tasks</h3>
      <table><thead><tr><th>Title</th><th>Teacher</th><th>Status</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No tasks.</td></tr>'}</tbody></table>
    </div>`;
}

async function loadRatings(){
  setActive('ratings');
  content.innerHTML='<div class="card"><h3>Loading ratings…</h3></div>';
  const user = auth.currentUser;
  const snap = await getDocs(query(collection(db,'tasks'),where('schoolId','==',user.schoolId),where('status','==','rated')));
  let rows='';
  snap.forEach(d=>{const t=d.data();rows+=`<tr><td>${t.title}</td><td>${t.rating}</td><td>${t.comment||''}</td></tr>`});
  content.innerHTML=`<div class="card"><h3>Ratings</h3><table><thead><tr><th>Task</th><th>⭐</th><th>Feedback</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No ratings yet.</td></tr>'}</tbody></table></div>`;
}

async function loadStaff(){
  setActive('staff');
  content.innerHTML='<div class="card"><h3>Loading staff…</h3></div>';
  const user = auth.currentUser;
  const snap = await getDocs(query(collection(db,'users'),where('schoolId','==',user.schoolId)));
  let rows='';
  snap.forEach(d=>{const u=d.data();rows+=`<tr><td>${u.name}</td><td>${u.role}</td><td>${u.email}</td></tr>`});
  content.innerHTML=`<div class="card"><h3>Staff</h3><table><thead><tr><th>Name</th><th>Role</th><th>Email</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No staff.</td></tr>'}</tbody></table></div>`;
}

function loadInvites(){
  setActive('invites');
  content.innerHTML=`
    <div class="card">
      <h3>Send Invite</h3>
      <form id="inviteForm">
        <label>Email <input type="email" id="inviteEmail" required></label>
        <label>Role <select id="inviteRole"><option value="teacher">Teacher</option><option value="admin">Admin</option></select></label>
        <button class="action-btn" type="submit">Send</button>
      </form>
      <div id="inviteMsg"></div>
    </div>`;
  inviteForm.onsubmit=async e=>{
    e.preventDefault();
    const user=auth.currentUser;
    await addDoc(collection(db,'invites'),{email:inviteEmail.value,role:inviteRole.value,schoolId:user.schoolId,status:'pending',sentAt:serverTimestamp(),invitedBy:user.uid});
    inviteMsg.innerHTML=msg('Invite logged (email service pending)','success');
    inviteForm.reset();
  };
}

async function loadSummary(){
  setActive('summary');
  const user=auth.currentUser;
  const uSnap=await getDocs(query(collection(db,'users'),where('schoolId','==',user.schoolId)));
  const tSnap=await getDocs(query(collection(db,'tasks'),where('schoolId','==',user.schoolId)));
  const iSnap=await getDocs(query(collection(db,'invites'),where('schoolId','==',user.schoolId)));
  content.innerHTML=`<div class="card"><h3>Summary</h3>Total Users: <b>${uSnap.size}</b><br>Total Tasks: <b>${tSnap.size}</b><br>Invites Sent: <b>${iSnap.size}</b></div>`;
}

// ---------- Navigation listeners ----------
navBtns.forEach(btn=>btn.addEventListener('click',()=>{
  if(btn.id==='logoutBtn') return; // handled below
  const view=btn.dataset.view;
  if(view==='dashboard') loadDashboard();
  else if(view==='tasks') loadTasks();
  else if(view==='ratings') loadRatings();
  else if(view==='staff') loadStaff();
  else if(view==='invites') loadInvites();
  else if(view==='summary') loadSummary();
}));

document.getElementById('logoutBtn').onclick=()=>{signOut(auth);sessionStorage.clear();location.href='../login.html'};

// ---------- Auth guard ----------
onAuthStateChanged(auth,user=>{
  if(!user){location.href='../login.html';return;}
  if(!['admin','schooladmin'].includes(sessionStorage.getItem('userRole'))){signOut(auth);location.href='../login.html';return;}
  loadDashboard();
});
