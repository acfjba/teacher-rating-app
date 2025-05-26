import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const auth = getAuth();

window.logout = async () => {
  try {
    await signOut(auth);
    window.location.href = "/login.html";
  } catch (err) {
    console.error("Logout error:", err);
  }
};
