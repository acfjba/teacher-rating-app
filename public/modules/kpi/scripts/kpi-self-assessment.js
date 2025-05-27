/**
 * kpi-self-assessment.js
 * - loadKPIForm(): populate existing KPI if any
 * - saveKPI(): write KPI self-assessment to Firestore
 */
import { db, auth } from '../../common/firebase-config.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

async function loadKPIForm() {
  const ref = doc(db, 'kpi', auth.currentUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById('term').value = data.term;
    document.getElementById('score').value = data.score;
    document.getElementById('comments').value = data.comments;
  }
}

async function saveKPI(e) {
  e.preventDefault();
  const term = form.term.value;
  const score = Number(form.score.value);
  const comments = form.comments.value;
  await setDoc(doc(db, 'kpi', auth.currentUser.uid), {
    term, score, comments, updatedAt: serverTimestamp()
  });
  alert('KPI saved!');
}

document.addEventListener('DOMContentLoaded', () => {
  loadKPIForm();
  document.getElementById('kpi-form').addEventListener('submit', saveKPI);
});
