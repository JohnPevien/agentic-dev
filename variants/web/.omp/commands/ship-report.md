---
description: Final evidence report — no edits, ship/no-ship decision
---

# /ship-report

Dispatch the `verifier` subagent via the task tool (`agent: "verifier"`). No edits. Check against `docs/tasks/<slug>.md`:

```
Acceptance criteria: PASS/FAIL
Typecheck: PASS/FAIL
Lint: PASS/FAIL
Tests: PASS/FAIL
Build: PASS/FAIL
A11y: PASS/FAIL
Unexpected files: NONE/list
New dependencies: NONE/list
Known risks:
Unverified assumptions:
Human decisions required:
```

Only `PASS` across gates → ship. Otherwise block with evidence.
