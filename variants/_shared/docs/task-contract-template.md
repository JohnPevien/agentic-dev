# Task Contract Template (Linear Issue Description)

Use this template as the description body when creating or drafting a Linear ticket (`linear_save_issue`). The contract in the Linear issue is the source of truth — not the implementer's summary.
```md
# Goal

What user-visible or technical outcome must exist when done? One sentence, testable.

# Acceptance Criteria (Given/When/Then)

- Given <state>, when <action>, then <observable result>.
- Keyboard users can complete the flow.
- Loading, empty, error, and success states are handled.
- [add per-task criteria]

# Non-Goals

- No redesign of unrelated components.
- No API schema changes (unless approved).
- No new dependency (unless approved).

# Required Verification

Check from `docs/quality-gates.md`; task may add more. Minimum:

- [ ] typecheck
- [ ] lint
- [ ] focused unit/component tests
- [ ] relevant suite
- [ ] Playwright critical flow (if UI)
- [ ] a11y checks (if UI)
- [ ] production build
- [ ] change-budget audit
- [ ] anti-cheat scan

# Change Budget

- Max files: 8  (set per task; exceed → stop, replan)
- Max lines: 400 (set per task; exceed → stop, explain why plan was insufficient)

AI tends to expand scope; budget forces replanning over silent sprawl.

# Decisions Needing Human

- [ ] product ambiguity
- [ ] architecture change
- [ ] dependency change
- [ ] security/data decision
- [ ] irreversible/external action

# Risks & Rollback

- Likely regression surfaces:
- Rollback: revert branch/worktree, no migration needed / migration plan:
```

**Improvement over original:** made `change budget` a required, task-specific field (not a fixed global), added explicit `Decisions` checklist so implementer knows when to interrupt, and tied `Required Verification` to `quality-gates.md` instead of duplicating lists.
