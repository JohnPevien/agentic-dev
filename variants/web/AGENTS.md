# AGENTS.md — web variant (project-local)

Concise entry point. Load details on demand — do not paste whole repo into context.

## Core rule (anti-slop)

> **Do not fight slop with longer prompts. Fight it with executable constraints, independent agents, and evidence.**

Tokens are cheap — use them for redundancy (separate contexts, re-reading code, independent tests), not monologues.

## Stack (per project, see .agentic-dev/reference/architecture.md)

Next.js App Router, React 19, Tailwind 4, shadcn/ui. Prefer Server Components by default; Client Components only at interactive boundaries. See `.agentic-dev/reference/architecture.md` for project specifics.

## Workflow

Two-instance relay pipeline. See `.agentic-dev/orchestration.md` for the full protocol, tier map, and handoffs.

## Composing with an existing workflow

Some projects already carry a durable handoff (ownership roles like Lead/Builder/Checker, a state machine, task files in `.agentic-dev/tasks/`). This relay is the **execution toolkit** those roles orchestrate, not a replacement for them:

- **Ownership roles** govern; this pack's roles execute. The pack never commits or pushes, never advances workflow states.
- **Mapping**: the role that plans runs the planner; the role that implements dispatches test-author then implementer; the role that independently checks dispatches the reviewer; the role that validates runs the verifier. All artifacts land in `.agentic-dev/run/<slug>/`.
- **Verifier PASS ≠ publish**: the verifier's PASS is evidence for the owner/Lead's authoritative gate; publication is a separate, separately authorized step.

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

> Source: `agentic-dev/variants/web/AGENTS.md` • variant=web • project-local, file-only