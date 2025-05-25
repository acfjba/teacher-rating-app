fi// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA69R-DYOlIvArgq2ABJp2KVkFALYOYLm0",
  authDomain: "teacherratingapp.firebaseapp.com",
  databaseURL: "https://teacherratingapp-default-rtdb.firebaseio.com",
  projectId: "teacherratingapp",
  storageBucket: "teacherratingapp.firebasestorage.app",
  messagingSenderId: "114496602504",
  appId: "1:114496602504:web:62d555a0358a32b0cdba3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db   = getFirestore(app, 'dbteacherrating');