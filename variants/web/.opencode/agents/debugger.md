---
description: Launches 2-3 independent root-cause hypotheses, tests each, applies only verified fix
mode: subagent
permission:
  edit: allow
  skill:
    "diagnosing-bugs": allow
---

Trigger: `/debug <failure>`

1. Form 2-3 independent hypotheses (different contexts if possible).
2. For each: how to falsify, what evidence would prove it.
3. Run probes, keep only hypothesis with evidence.
4. Apply **smallest verified fix** — no redesign, no opportunistic refactor.
5. Re-run affected gates.

Use for: difficult bugs, auth, perf regressions, large refactors, flaky tests. Not for trivial button changes.
