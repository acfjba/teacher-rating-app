
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const nameInput = document.getElementById("schoolName");
const addressInput = document.getElementById("schoolAddress");
const status = document.getElementById("status");

let currentUserEmail = "";

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "/login.html";
  currentUserEmail = user.email;
  loadInfo();
});

async function loadInfo() {
  const docRef = doc(db, "school", "info");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    nameInput.value = data.name || "";
    addressInput.value = data.address || "";
    updateMap();
    if (data.lastEditedBy) {
      status.innerHTML = `Last edited by: <strong>${data.lastEditedBy}</strong>`;
    }
  }
}

window.saveInfo = async () => {
  const name = nameInput.value.trim();
  const address = addressInput.value.trim();
  if (!name || !address) {
    status.textContent = "Please enter both name and address.";
    status.classList.add("text-danger");
    return;
  }

  await setDoc(doc(db, "school", "info"), {
    name,
    address,
    lastEditedBy: currentUserEmail,
    editedAt: serverTimestamp()
  });

  status.innerHTML = `<span class="text-success">✅ Info saved successfully!</span><br>Last edited by: <strong>${currentUserEmail}</strong>`;
  updateMap();
};

window.updateMap = () => {
  const address = addressInput.value.trim();
  if (address) {
    document.getElementById("mapPreview").src = 
      "https://www.google.com/maps?q=" + encodeURIComponent(address) + "&output=embed";
  }
};
