
// Role-based login and redirect
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const uid = user.uid;
    // Fetch user role from Firestore
    firebase.firestore().collection("users").doc(uid).get().then(doc => {
      if (doc.exists) {
        const role = doc.data().role;
        if (role === "super") location.href = "dashboard-super.html";
        else if (role === "head") location.href = "dashboard-head.html";
        else location.href = "dashboard-teacher.html";
      }
    });
  }
});
