// public/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth }         from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore }    from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA69R-DYOlIvArgq2ABJp2KVkFALYOYLm0",
  authDomain: "teacherratingapp.firebaseapp.com",
  databaseURL: "https://teacherratingapp-default-rtdb.firebaseio.com",
  projectId: "teacherratingapp",
  storageBucket: "teacherratingapp.firebasestorage.app",
  messagingSenderId: "114496602504",
  appId: "1:114496602504:web:62d555a0358a32b0cdba3d"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export { auth, db };
