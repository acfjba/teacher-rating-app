for (let i = 1; i <= 50; i++) {
  const email = `testuser${i}@school.com`;
  const pass = "secureTest123";
  firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(() => console.log("Created:", email))
    .catch(err => {
      if (err.code === 'auth/email-already-in-use') {
        firebase.auth().signInWithEmailAndPassword(email, pass)
          .then(() => console.log("Logged in:", email));
      }
    });
}
