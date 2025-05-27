/**
 * add-task.js
 * - initAddTaskForm(): attach submit listener to add-task form
 * - createTask(): write new task to Firestore
 */
import { db, auth } from '../../common/firebase-config.js';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

function initAddTaskForm() {
  const form = document.getElementById('add-task-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const title = form.title.value;
    const description = form.description.value;
    const schoolId = auth.currentUser?.schoolId;
    await addDoc(collection(db, 'tasks'), {
      title, description,
      schoolId,
      createdBy: auth.currentUser.uid,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    alert('Task created!');
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', initAddTaskForm);
