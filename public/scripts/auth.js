loginSchool.addEventListener('submit', async e => {
  e.preventDefault();
  const sid = document.getElementById('schoolId').value.trim();
  const email = document.getElementById('email').value;
  const pass  = document.getElementById('password').value;
  try {
    const cred = await auth.signInWithEmailAndPassword(email, pass);
    const userSnap = await db.collection('users').doc(cred.user.uid).get();
    if (!userSnap.exists || userSnap.data().schoolId !== sid) {
      throw new Error('School ID mismatch or user not found.');
    }
    const role = userSnap.data().role;  // e.g. 'teacher', 'headTeacher', 'schoolAdmin'
    
    // Redirect based on role
    switch (role) {
      case 'teacher':
        window.location = 'teacher-dashboard.html';
        break;
      case 'headTeacher':
        window.location = 'headteacher-dashboard.html';
        break;
 .// should be exactly this:
// Inside your loginSchool or loginAdmin handler’s switch/case
case 'systemAdmin':
  window.location = 'systemadmin-dashboard.html';
  break;
}
      default:
        // fallback
        window.location = 'school-dashboard.html';
    }
  } catch(err) {
    console.error(err);
    alert(err.message);
    auth.signOut();
  }
});
