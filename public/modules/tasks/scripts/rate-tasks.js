/**
 * rate-tasks.js
 * - loadPendingRatings(): fetch tasks with status="pending"
 * - handleRateSubmit(): update task with rating & comment
 */
import { db, auth } from '../../common/firebase-config.js';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

async function loadPendingRatings() {
  const q = query(collection(db, 'tasks'), where('status', '==', 'pending'), where('schoolId', '==', auth.currentUser.schoolId));
  const snapshot = await getDocs(q);
  // render tasks into the page…
}

async function handleRateSubmit(taskId, score, comment) {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    rating: score,
    comment,
    status: 'rated',
    ratedAt: serverTimestamp()
  });
  alert('Rating submitted!');
}

document.addEventListener('DOMContentLoaded', loadPendingRatings);
