
// Upload Excel files to Firebase Storage and parse to Firestore
function handleFileUpload(file, type) {
  const storageRef = firebase.storage().ref(type + "/" + file.name);
  const uploadTask = storageRef.put(file);
  uploadTask.on('state_changed', 
    snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    }, 
    error => console.error(error),
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
        console.log('File available at', downloadURL);
        // Parse and write to Firestore here
      });
    }
  );
}
