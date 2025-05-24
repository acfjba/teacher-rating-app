// firebase-config.js
// ─── 1. Import the SDK modules you actually need ───────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth }          from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore }     from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ─── 2. Your Firebase config ───────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA69R-DYOlIvArgq2ABJp2KVkFALYOYLm0",
  authDomain: "teacherratingapp.firebaseapp.com",
  databaseURL: "https://teacherratingapp-default-rtdb.firebaseio.com",
  projectId: "teacherratingapp",
  storageBucket: "teacherratingapp.appspot.com",      // ← use *.appspot.com
  messagingSenderId: "114496602504",
  appId: "1:114496602504:web:62d555a0358a32b0cdba3d"
};

// ─── 3. Initialize and export ─────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
