---
name: Git commit instructions
description: Always provide Mac terminal commands for committing and pushing to main after every git operation
type: feedback
originSessionId: 3b010f84-98d3-42fe-a707-564704ec602f
---
After every git commit (or when a commit is ready), always end the response with the exact Mac terminal commands the user needs to run to clear the git lock and push to main.

**Why:** The Linux sandbox creates `.git/HEAD.lock` and `.git/index.lock` files it can't delete cross-filesystem. The sandbox can stage and commit but the push always fails. The user must run the push from their Mac terminal.

**How to apply:** After any git work, always include a terminal block like:

```bash
cd "/Users/tejas/Documents/Claude/Projects/New Home Website"
rm -f .git/HEAD.lock .git/index.lock
git push origin main
```

Never just say "push from your terminal" without including the exact commands. Always include the full cd path, the rm lock-file line, and the git push line.
