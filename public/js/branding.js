
// Update school name/logo in Firestore
function updateSchoolInfo() {
  const name = document.getElementById("schoolName").value;
  const address = document.getElementById("schoolAddress").value;
  firebase.firestore().collection("school").doc("info").set({
    name: name,
    address: address
  });
}

// Upload logo image
function uploadLogo(file) {
  const storageRef = firebase.storage().ref("branding/logo.png");
  storageRef.put(file).then(() => {
    console.log("Logo uploaded.");
  });
}
