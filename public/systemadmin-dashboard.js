import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { firebaseConfig } from "../../common/firebase-config.js";

/* -------- Firebase Init -------- */
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* -------- DOM -------- */
const content   = document.getElementById('contentArea');
const pageTitle = document.getElementById('pageTitle');
const navBtns   = document.querySelectorAll('.nav-btn');

function setActive(view){
  navBtns.forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));
  pageTitle.textContent=view.charAt(0).toUpperCase()+view.slice(1).replace(/([A-Z])/g,' $1');
}
function cardWrap(html){return `<div class="card">${html}</div>`}

/* -------- Views -------- */
async function loadOverview(){
  setActive('overview');
  content.innerHTML=cardWrap('<h3>Loading schools…</h3>');
  const schoolsSnap = await getDocs(collection(db,'schools'));
  let rows='';
  for(const s of schoolsSnap.docs){
    const d=s.data();
    // count users per school
    const usersSnap = await getDocs(query(collection(db,'users'),where('schoolId','==',s.id)));
    rows+=`<tr><td>${d.name||s.id}</td><td>${usersSnap.size}</td><td>${d.region||'-'}</td></tr>`;
  }
  content.innerHTML=cardWrap(`<h3>All Schools</h3><table><thead><tr><th>Name</th><th># Users</th><th>Region</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No schools found.</td></tr>'}</tbody></table>`);
}

async function loadUsers(){
  setActive('users');
  content.innerHTML=cardWrap('<h3>Loading users…</h3>');
  const snap = await getDocs(collection(db,'users'));
  let rows='';
  snap.forEach(d=>{const u=d.data();rows+=`<tr><td>${u.name||''}</td><td>${u.email}</td><td>${u.role}</td><td>${u.schoolId||'-'}</td></tr>`});
  content.innerHTML=cardWrap(`<h3>All Users</h3><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>School</th></tr></thead><tbody>${rows||'<tr><td colspan="4">No users.</td></tr>'}</tbody></table>`);
}

async function loadInvites(){
  setActive('invites');
  content.innerHTML=cardWrap('<h3>Loading invites…</h3>');
  const snap = await getDocs(collection(db,'invites'));
  let rows='';
  snap.forEach(d=>{const i=d.data();rows+=`<tr><td>${i.email}</td><td>${i.role}</td><td>${i.schoolId||'-'}</td><td>${i.status}</td></tr>`});
  content.innerHTML=cardWrap(`<h3>Invites</h3><table><thead><tr><th>Email</th><th>Role</th><th>School</th><th>Status</th></tr></thead><tbody>${rows||'<tr><td colspan="4">No invites.</td></tr>'}</tbody></table>`);
}

async function loadLogs(){
  setActive('logs');
  content.innerHTML=cardWrap('<h3>Loading recent logs…</h3>');
  const snap = await getDocs(query(collection(db,'logs'),orderBy('at','desc'),limit(50)));
  let rows='';
  snap.forEach(d=>{const l=d.data();rows+=`<tr><td>${new Date(l.at.seconds*1000).toLocaleString()}</td><td>${l.type}</td><td>${l.user||'-'}</td></tr>`});
  content.innerHTML=cardWrap(`<h3>Recent Audit Logs (50)</h3><table><thead><tr><th>Time</th><th>Type</th><th>User</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No logs.</td></tr>'}</tbody></table>`);
}

function loadSettings(){
  setActive('settings');
  content.innerHTML=cardWrap('<h3>Settings</h3><p>Platform settings coming soon…</p>');
}

/* -------- Navigation -------- */
navBtns.forEach(btn=>{
  if(btn.id==='logoutBtn') return;
  btn.addEventListener('click',()=>{
    const v=btn.dataset.view;
    if(v==='overview') loadOverview();
    else if(v==='users') loadUsers();
    else if(v==='invites') loadInvites();
    else if(v==='logs') loadLogs();
    else if(v==='settings') loadSettings();
  });
});

document.getElementById('logoutBtn').onclick=()=>{signOut(auth);sessionStorage.clear();location.href='../login.html'};

/* -------- Auth Guard -------- */
onAuthStateChanged(auth,user=>{
  if(!user){location.href='../login.html';return;}
  const role=sessionStorage.getItem('userRole');
  if(!['systemadmin','superadmin'].includes(role)){signOut(auth);location.href='../login.html';return;}
  loadOverview();
});
