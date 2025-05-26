import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const gallery = document.getElementById("gallery");

let currentUser;

onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = "login.html";
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "head") {
    alert("Access denied.");
    return window.location.href = "login.html";
  }
  currentUser = user;
  loadGallery();
});

window.uploadImage = async () => {
  const file = document.getElementById("imageInput").files[0];
  if (!file) return alert("Choose an image.");
  const imgRef = ref(storage, "gallery/" + Date.now() + "_" + file.name);
  await uploadBytes(imgRef, file);
  alert("Image uploaded!");
  loadGallery();
};

async function loadGallery() {
  const listRef = ref(storage, "gallery");
  const result = await listAll(listRef);
  gallery.innerHTML = "";
  for (const itemRef of result.items) {
    const url = await getDownloadURL(itemRef);
    const img = document.createElement("img");
    img.src = url;
    gallery.appendChild(img);
  }
}
