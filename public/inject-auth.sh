#!/usr/bin/env bash
set -e

echo "🔄 Normalizing filenames..."
if [ -f "Teacherdashboard.html" ]; then
  mv Teacherdashboard.html teacher-dashboard.html
  echo "  • Renamed Teacherdashboard.html → teacher-dashboard.html"
fi

# Common Firebase init snippet (replace with your actual config if needed)
read -r -d '' FIREBASE_INIT << 'CONFIG'
const firebaseConfig = {
  apiKey: "AIzaSyA69R-DYOlIvArgq2ABJp2KVkFALYOYLm0",
  authDomain: "teacherratingapp.firebaseapp.com",
  databaseURL: "https://teacherratingapp-default-rtdb.firebaseio.com",
  projectId: "teacherratingapp",
  storageBucket: "teacherratingapp.firebasestorage.app",
  messagingSenderId: "114496602504",
  appId: "1:114496602504:web:62d555a0358a32b0cdba3d"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
CONFIG

inject_snippet() {
  local file=\$1
  local snippet=\$2
  ed -s "\$file" <<EOF_ED
/<\/body>/
a
\$snippet
.
w
q
EOF_ED
  echo "  • Injected into \$file"
}

# 1) login.html handler
read -r -d '' LOGIN_SNIPPET <<'SNIP'
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
  import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

  $FIREBASE_INIT

  async function onLogin() {
    try {
      const email = document.getElementById('email').value;
      const pass  = document.getElementById('password').value;
      const { user } = await signInWithEmailAndPassword(auth, email, pass);
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) throw new Error('No profile found.');
      const { role } = snap.data();
      switch (role) {
        case 'admin':          window.location.href = 'admin-dashboard.html';       break;
        case 'headteacher':    window.location.href = 'head-teacher-dashboard.html';break;
        case 'primaryAdmin':   window.location.href = 'primary-admin-dashboard.html';break;
        case 'teacher':        window.location.href = 'teacher-dashboard.html';    break;
        default:
          alert('Access denied: ' + role);
          auth.signOut();
      }
    } catch (e) {
      alert('Login failed: ' + e.message);
    }
  }
  document.getElementById('loginBtn').onclick = onLogin;
</script>
SNIP

inject_snippet login.html "\$LOGIN_SNIPPET"

# 2) Guard snippet for dashboards
read -r -d '' GUARD_SNIPPET <<'SNIP'
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
  import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
  import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

  $FIREBASE_INIT

  onAuthStateChanged(auth, async user => {
    if (!user) return location.href = 'login.html';
    const snap = await getDoc(doc(db,'users', user.uid));
    const myRole = snap.data()?.role;
    const file = window.location.pathname.split('/').pop();
    const allowed = {
      'admin-dashboard.html':        ['admin'],
      'head-teacher-dashboard.html': ['headteacher'],
      'primary-admin-dashboard.html':['primaryAdmin'],
      'teacher-dashboard.html':      ['teacher']
    }[file] || [];
    if (!allowed.includes(myRole)) {
      alert('Access denied.');
      return location.href = 'login.html';
    }
    if (typeof initializePage === 'function') initializePage();
  });
</script>
SNIP

for page in admin-dashboard.html head-teacher-dashboard.html primary-admin-dashboard.html teacher-dashboard.html; do
  [ -f "\$page" ] && inject_snippet "\$page" "\$GUARD_SNIPPET"
done

echo "✅ Script complete."
