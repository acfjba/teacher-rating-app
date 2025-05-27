/**
 * staff-records.js
 * - loadStaffRecords(): fetch and display staff records
 * - addRecord(): add new staff record
 */
import { db } from '../../common/firebase-config.js';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

async function loadStaffRecords() {
  const snapshot = await getDocs(collection(db, 'staffRecords'));
  // render records…
}

async function addRecord(e) {
  e.preventDefault();
  const name = form.staffName.value;
  const role = form.role.value;
  const details = form.details.value;
  await addDoc(collection(db, 'staffRecords'), {
    staffName: name, role, details, createdAt: serverTimestamp()
  });
  alert('Record added!');
  form.reset();
}

document.addEventListener('DOMContentLoaded', () => {
  loadStaffRecords();
  document.getElementById('staff-records-form').addEventListener('submit', addRecord);
});
