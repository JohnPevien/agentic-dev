# Shared Agent Pack — agentic-dev (_shared)

This block is copied into every new project (web, expo, etc.) via `scripts/copy.mjs`.
When merged into an existing `AGENTS.md`, it is wrapped as:

`<!-- agentic-dev:VARIANT:start -->` … `<!-- agentic-dev:end -->` (VARIANT = web, expo, etc.)

## Base rules (all stacks)

- Keep project-local agent config — do not write to `~/.muse`, `~/.config`, or global `~/.agents`.
- Prefer small, reversible edits. Verify with `node --check` or existing lints before committing.
- If a `variants/<stack>/AGENTS.md` also exists, its rules take precedence over this shared section.
- This pack uses a **two-instance relay model** (worker + judge). See `.agentic-dev/orchestration.md` for the full protocol, tier map, and handoffs.
- **Role identity files** are at `.agentic-dev/roles/<role>.md`. Paste the relevant role into whichever harness instance is playing that role — they are pure text, no frontmatter.
- **Reference docs** are at `.agentic-dev/reference/` (`quality-gates.md`, `testing-strategy.md`, `accessibility-standards.md`, `task-contract-template.md`, `architecture.md`).
- **Task contracts** go to `.agentic-dev/tasks/<slug>.md` — committed, source of truth.
- **Process state** (recon, plan, review, verify) goes to `.agentic-dev/run/<slug>/` — gitignored.
- **Constraints** (deny-rules, anti-cheat) are in `.agentic-dev/constraints.md` — follow them as discipline.
- This pack is an **execution toolkit** (stateless relay). When a project already carries a durable workflow (ownership roles, a handoff, a state machine), the toolkit composes with it — the project's roles govern, the toolkit's roles execute. The variant `AGENTS.md` has the composition details.

## Composing with an existing workflow

Some projects already carry a durable handoff (ownership roles like Lead/Builder/Checker, a state machine, task files in `.agentic-dev/tasks/`). This relay is the **execution toolkit** those roles orchestrate, not a replacement for them:

- **Ownership roles** (who decides, reviews, publishes) and the **durable handoff** (repo-carried state across sessions) govern. This pack's roles are stateless workers/judges that never commit or push, and never advance workflow states.
- **Mapping**: the role that plans runs the planner; the role that implements dispatches test-author (failing tests) then implementer; the role that independently checks dispatches the reviewer; the role that validates runs the verifier. All artifacts land in `.agentic-dev/run/<slug>/`.
- **Verifier PASS ≠ publish**: the verifier's PASS is evidence for the owner/Lead's authoritative gate; publication is a separate, separately authorized step.
- **Task tracking**: `.agentic-dev/reference/task-contract-template.md` is the planning contract (Goal, Given/When/Then, Change Budget, Decisions). Task contracts live in `.agentic-dev/tasks/<slug>.md`.

A greenfield project with no existing workflow uses this relay as-is.

## When to interrupt you

Proceed automatically for reversible local edits, existing patterns, fixing deterministic failures. **Interrupt only:** product ambiguity, architecture change, dependency change, security/data decision, irreversible/external action. Never ask "should I continue?" — finish reversible work, then one consolidated decision request.

## Lazy references (load only when needed)

- `.agentic-dev/orchestration.md` — relay protocol, tier map, handoffs
- `.agentic-dev/constraints.md` — deny-rules + anti-cheat
- `.agentic-dev/reference/architecture.md` — stack + directory map (template, project fills)
- `.agentic-dev/reference/quality-gates.md` — gates + anti-cheat
- `.agentic-dev/reference/testing-strategy.md`
- `.agentic-dev/reference/accessibility-standards.md`
- `.agentic-dev/reference/task-contract-template.md`
- `.agentic-dev/roles/<role>.md` — role identity prompts (planner, test-author, implementer, reviewer, verifier, debugger)

> Source: `agentic-dev/variants/_shared/AGENTS.md` • copied by `scripts/copy.mjs --variant=<stack> <target>`