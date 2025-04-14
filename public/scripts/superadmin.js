
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userList = document.getElementById("userList");

onAuthStateChanged(auth, async user => {
  if (!user) return (window.location.href = "index.html");

  const res = await getDocs(collection(db, "users"));
  userList.innerHTML = "";

  res.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.innerHTML = \`
      <strong>\${data.email}</strong> - Role: <em>\${data.role}</em>
      <button onclick="changeRole('\${docSnap.id}', 'teacher')">To Teacher</button>
      <button onclick="changeRole('\${docSnap.id}', 'head')">To Head</button>
      <button onclick="changeRole('\${docSnap.id}', 'superadmin')">To Superadmin</button>
      <button onclick="deleteUser('\${docSnap.id}')">Delete</button>
    \`;
    userList.appendChild(div);
  });
});

window.changeRole = async (uid, role) => {
  await updateDoc(doc(db, "users", uid), { role });
  alert("Role updated");
  location.reload();
};

window.deleteUser = async (uid) => {
  await deleteDoc(doc(db, "users", uid));
  alert("User deleted");
  location.reload();
};
