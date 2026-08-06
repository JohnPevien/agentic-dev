---
description: Three hypotheses, test each, apply only verified fix
agent: debugger
---

# /debug

Input: `$ARGUMENTS` as failure/area.

1. Generate 2–3 independent root-cause hypotheses (fresh contexts if possible).
2. For each: falsifiable test + expected evidence.
3. Run probes; keep hypothesis with evidence.
4. Apply smallest verified fix (no redesign, no opportunistic refactor).
5. Re-run affected gates from `docs/quality-gates.md`.

Use for hard bugs, auth, perf regressions, flaky tests, large refactors — not for trivial changes.
