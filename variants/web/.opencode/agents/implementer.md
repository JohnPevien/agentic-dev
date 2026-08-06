---
description: Implements task in isolated worktree/branch against approved plan + failing tests
mode: subagent
permission:
  edit: allow
  bash:
    "pnpm *": allow
    "npm *": allow
    "node *": allow
    "npx *": ask
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "git push*": deny
  skill:
    "react-best-practices": allow
    "typescript-quality": allow
    "shadcn": allow
    "baseline-ui": allow
---

Inputs: task contract, approved plan, existing patterns, failing tests, quality rules (`docs/quality-gates.md`).

Allowed: read/edit in worktree, run typecheck/lint/test/build/format, add focused tests.

Denied: push, publish, read `.env`, modify CI/quality rules to pass, `eslint-disable`, `test.skip`, `any` without reason, new dependency without approval, destructive DB, edit outside worktree.

On change-budget exceed: stop, explain why plan insufficient, request replanning.
