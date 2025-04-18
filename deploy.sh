#!/bin/bash
echo "🚀 Deploying Teacher Rating App..."

git add .
git commit -m "Auto-deploy update $(date +'%Y-%m-%d %H:%M:%S')"
git push origin main

firebase deploy
