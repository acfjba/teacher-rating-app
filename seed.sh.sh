#!/usr/bin/env bash
set -e

# Install firebase-admin if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing firebase-admin…"
  npm install firebase-admin
fi

echo "🔐 Seeding users into Firestore database 'dbteacherrating'…"
node seedUsers.js
