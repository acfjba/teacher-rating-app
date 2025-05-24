
// Generate and download PDF of ratings summary
function printTeacherSummary(teacherId) {
  const doc = new jsPDF();
  firebase.firestore().collection("ratings").where("teacherId", "==", teacherId).get().then(snapshot => {
    doc.text("Teacher Performance Summary", 20, 20);
    let y = 40;
    snapshot.forEach(ratingDoc => {
      const r = ratingDoc.data();
      doc.text(`Week ${r.week} - Task: ${r.taskTitle}, Score: ${r.score}`, 20, y);
      y += 10;
    });
    doc.save("summary_" + teacherId + ".pdf");
  });
}
