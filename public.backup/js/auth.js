// public/js/auth.js
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const schoolId = document.getElementById('schoolId').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('login-error');
  errEl.style.display = 'none';
  try {
    const { user } = await auth.signInWithEmailAndPassword(email, password);
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists || userDoc.data().schoolId !== schoolId) {
      throw new Error('Invalid School ID or user not found.');
    }
    const role = userDoc.data().role;
    const routes = {
      systemAdmin: 'systemadmin-dashboard.html',
      primaryAdmin:'primaryadmin-dashboard.html',
      headTeacher: 'headteacher-dashboard.html',
      teacher:     'teacher-dashboard.html'
    };
    window.location.href = routes[role] || 'dashboard.html';
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
});
