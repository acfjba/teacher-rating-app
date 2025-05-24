
function renderBarChart(containerId, chartTitle, labels, data) {
  const ctx = document.getElementById(containerId).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: chartTitle,
        data: data,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

// Example summary rendering
function loadTermSummaryChart() {
  const teacherId = "teacher_001";  // dynamic in full integration
  firebase.firestore().collection("ratings")
    .where("teacherId", "==", teacherId)
    .get()
    .then(snapshot => {
      const termScores = { Term1: 0, Term2: 0, Term3: 0 };
      const counts = { Term1: 0, Term2: 0, Term3: 0 };
      snapshot.forEach(doc => {
        const r = doc.data();
        const term = r.term || "Term1";
        termScores[term] += r.score;
        counts[term]++;
      });
      const labels = Object.keys(termScores);
      const data = labels.map(t => counts[t] ? termScores[t] / counts[t] : 0);
      renderBarChart("termChart", "Term Average Scores", labels, data);
    });
}
