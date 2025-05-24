#!/usr/bin/env bash
set -e

echo "🔗 Wiring up sidebar nav links…"

# Make sure these pages exist (so links won't 404)
touch invites.html summaries.html

# admin-dashboard.html
sed -i \
  -e 's#<div id="navInvites"#<a href="invites.html" id="navInvites"#g' \
  -e 's#</div>#</a>#g' \
  admin-dashboard.html

sed -i \
  -e 's#<div id="navUsers"#<a href="users.html" id="navUsers"#g' \
  -e 's#</div>#</a>#g' \
  admin-dashboard.html

sed -i \
  -e 's#<div id="navTasks"#<a href="ratings.html" id="navTasks"#g' \
  -e 's#</div>#</a>#g' \
  admin-dashboard.html

sed -i \
  -e 's#<div id="navSummary"#<a href="summaries.html" id="navSummary"#g' \
  -e 's#</div>#</a>#g' \
  admin-dashboard.html

# teacher-dashboard.html (only off‐page links)
sed -i \
  -e 's#<div id="navTasks"#<a href="task.html" id="navTasks"#g' \
  -e 's#</div>#</a>#g' \
  teacher-dashboard.html

sed -i \
  -e 's#<div id="navRatings"#<a href="ratings.html" id="navRatings"#g' \
  -e 's#</div>#</a>#g' \
  teacher-dashboard.html

# head‐teacher and primary‐admin keep their in‐page tabs

echo "✅ All sidebar nav links wired."
