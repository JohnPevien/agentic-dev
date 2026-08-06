---
description: Create task contract, run recon, produce plan
agent: planner
---

# /task — create contract + recon + plan

Input: `$ARGUMENTS` as task description.

Steps:

1. **Contract** — fill `docs/tasks/<slug>.md` from `docs/task-contract-template.md` (Goal, Acceptance Criteria Given/When/Then, Non-Goals, Required Verification per `docs/quality-gates.md`, Change Budget, Decisions needing human, Risks).
2. **Reconnaissance** — launch read-only subagents in parallel:
   - Codebase explorer (patterns, relevant files)
   - Test archaeologist (conventions, missing coverage)
   - Dependency scout (upstream docs, lib source)
   - Risk analyst (a11y, security, perf, regression)
   Output facts, not implementation: `Relevant files: / Existing pattern: / Tests covering: / Regression surfaces: / Unresolved decisions:`.
3. **Plan** — delegate to `planner` agent with contract + recon + `docs/architecture.md`. Plan lists files, order, tests, risks/rollback, assumptions vs human decisions. Stay read-only.

Do not implement. Return contract + recon + plan for approval.

Improvement: parallel recon is explicit (original implied sequential), and plan is gated on contract + facts, not on implementer optimism.
