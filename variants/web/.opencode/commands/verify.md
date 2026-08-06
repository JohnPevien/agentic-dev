---
description: Deterministic gates + evidence report (project's scripts, not hardcoded)
agent: verifier
---

# /verify

Read `AGENTS.md` + `package.json` + `docs/quality-gates.md`.

Identify project's package manager + verification scripts (do not invent). Run when present:

1. format:check
2. typecheck
3. lint
4. focused tests
5. relevant suite
6. e2e (Playwright) if UI task
7. a11y
8. build
9. change-budget audit (`git diff --stat`)
10. anti-cheat scan

Return evidence table with exact commands + exit codes. No edits, no interpretation — PASS/FAIL only.

Improvement: original global `/verify` assumed `pnpm lint && pnpm test`; this version discovers scripts from `package.json`/`AGENTS.md` per project, making it plug-n-play.
