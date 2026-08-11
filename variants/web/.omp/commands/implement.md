---
description: Run implementer against approved contract + failing tests
---

# /implement

Preconditions: `docs/tasks/<slug>.md` approved, failing tests exist (from `test-author`).

Dispatch the `implementer` subagent via the task tool (`agent: "implementer"`):

1. Create isolated `git worktree` or branch for this task.
2. Load contract, plan, patterns, failing tests, `docs/quality-gates.md`.
3. Implement inside worktree only. Run formatter → typecheck → lint → focused tests locally.
4. Do not push, publish, or weaken gates. On budget exceed: stop + explain replanning need.
5. Report diff + local verification output; do not self-review.

Next: `/review` then `/verify`.
