
// List backup files for download
function loadBackups() {
  const ref = firebase.storage().ref("backups/");
  ref.listAll().then(result => {
    result.items.forEach(fileRef => {
      fileRef.getDownloadURL().then(url => {
        const link = document.createElement("a");
        link.href = url;
        link.innerText = fileRef.name;
        document.body.appendChild(link);
      });
    });
  });
}
