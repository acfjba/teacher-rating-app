import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, addDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { firebaseConfig } from "../../common/firebase-config.js";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const appDiv = document.getElementById('app');
const year   = new Date().getFullYear();

onAuthStateChanged(auth, async user => {
  if (!user) return location = "../login.html";
  if (sessionStorage.getItem('userRole') !== 'teacher') return location = "../login.html";

  const formRef = doc(db, "kpiForms", `${user.uid}_${year}`);
  const snap    = await getDoc(formRef);

  if (snap.exists()) {
    const data = snap.data();
    appDiv.innerHTML = `
      <p>You already submitted your KPI self-assessment for ${year}.</p>
      <pre>${JSON.stringify(data.answers, null, 2)}</pre>`;
    return;
  }

  // Render form
  appDiv.innerHTML = `
    <form id="kpiForm">
      <h3>Self-Assessment – ${year}</h3>
      Rate each area 1-5:<br><br>
      Teaching quality <input name="Q1" type="number" min="1" max="5" required><br>
      Student feedback <input name="Q2" type="number" min="1" max="5" required><br>
      Extra-curricular  <input name="Q3" type="number" min="1" max="5" required><br><br>
      <button>Submit</button>
    </form><div id="msg"></div>`;

  kpiForm.onsubmit = async e => {
    e.preventDefault();
    const answers = Object.fromEntries(new FormData(kpiForm));
    await setDoc(formRef, {
      teacherId: user.uid,
      schoolId : sessionStorage.getItem('schoolId'),
      year, answers,
      submittedAt: serverTimestamp()
    });
    // Notify head teacher
    await addDoc(collection(db,"notifications"), {
      to: "head_of_" + sessionStorage.getItem('schoolId'),
      type: "kpi_submitted",
      teacherId: user.uid,
      year, sentAt: serverTimestamp()
    });
    msg.textContent = "Submitted!";
    kpiForm.remove();
  };
});
