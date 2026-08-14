# AGENTS.md — web variant (project-local)

Concise entry point. Load details on demand — do not paste whole repo into context.

## Core rule (anti-slop)

> **Do not fight slop with longer prompts. Fight it with executable constraints, independent agents, and evidence.**

Tokens are cheap — use them for redundancy (separate contexts, re-reading code, independent tests), not monologues.

## Stack (per project, see docs/architecture.md)

Next.js App Router, React 19, Tailwind 4, shadcn/ui. Prefer Server Components by default; Client Components only at interactive boundaries. See `docs/architecture.md` for project specifics.

## Workflow (evidence-gated, 5 roles to start)

`Planner → Test Author → Implementer → Reviewer → Verifier`

Add `debugger` tournament (2-3 hypotheses) only for: arch changes, auth, migrations, perf regressions, large refactors.

This is an **execution toolkit**: a stateless pipeline the orchestrating
session runs per task. It composes with — does not replace — a project's
ownership roles and durable handoff (see "Composing with an existing workflow"
below). A greenfield project with no existing workflow uses it as-is.

1. **Task contract** — create or draft a Linear ticket (`linear_save_issue`) with description from `docs/task-contract-template.md`. Must include Goal, Acceptance Criteria (Given/When/Then), Non-Goals, Required Verification, Change Budget (max files/lines), Decisions needing human.
2. **Reconnaissance** — read-only agents in parallel: codebase explorer, test archaeologist, dependency scout, risk analyst. Output is facts (`Relevant files:` … `Unresolved decisions:`), not implementation.
3. **Plan** — read-only planner: files to change, order, tests, risks/rollback, assumptions vs. decisions needing you.
4. **Test author** — separate context, from **acceptance criteria**, fails before implementation. Includes happy/error, keyboard, focus, a11y, responsive.
5. **Implementer** — isolated branch/worktree as a scratch sandbox; the orchestrating session materializes the approved diff into the working tree. Allowed: read/edit in worktree, typecheck/lint/test/build, git status/diff. Denied: push, publish, read `.env`, modify quality gates, `eslint-disable`, `test.skip`. If a project forbids worktrees, use a branch instead.
6. **Deterministic verification** — `docs/quality-gates.md` (formatter → typecheck → lint → tests → Playwright → a11y → build → budget audit → anti-cheat). Fail on `any` without reason, `eslint-disable`, `test.only`, etc.
7. **Independent reviewer** — fresh context, **no implementer reasoning**, diff + outputs + `docs/quality-gates.md`. Findings require severity + location + rule violated + reproduce + minimal correction. Max 2 review→fix cycles, then replan.
8. **Verifier** — read-only evidence table: acceptance, typecheck, lint, tests, build, a11y, unexpected files, dependencies, risks, human decisions. A PASS is evidence to ship, not publication itself — the owner (or a durable Lead role) publishes.

## Composing with an existing workflow

Some projects already carry a durable handoff (ownership roles like
Lead/Builder/Checker, a state machine, task files in `docs/tasks/`). This
pipeline is the **execution toolkit** those roles orchestrate, not a
replacement for them:

- **Ownership roles** (who decides, reviews, publishes) and the **durable
  handoff** (repo-carried state across sessions) govern. This pipeline's
  subagents are stateless workers that never touch the handoff, never commit
  or push, and never advance workflow states.
- **Mapping**: the role that plans runs `/task` (contract + recon + planner);
  the role that implements dispatches `test-author` (failing tests) then
  `/implement` (implementer); the role that independently checks dispatches
  `/review` (reviewer); the role that validates runs `/verify` or
  `/ship-report` (verifier).
- **`/ship-report` ≠ publish**: the verifier's PASS is evidence for the
  owner/Lead's authoritative gate; publication is a separate, separately
  authorized step.
- **Task tracking**: `docs/task-contract-template.md` is the planning contract
  (Goal, Given/When/Then, Change Budget, Decisions) placed into the Linear ticket
  description via Linear MCP. Tasks are tracked as Linear issues with status
  and comments carrying workflow evidence.

A greenfield project with no existing workflow uses this pipeline as-is.

## Permissions (enforced via `.opencode/opencode.jsonc` in opencode, `.omp/config.yml` in OMP; also via auto + deny)

Allow: read, edit inside worktree, typecheck/lint/test/build, git status/diff
Ask: install dependency, git commit, DB migration
Deny: read `.env`/secrets, broad delete, `git push`, publish, prod deploy, external dirs, destructive DB

## When to interrupt you

Proceed automatically for reversible local edits, existing patterns, fixing deterministic failures. **Interrupt only:** product ambiguity, architecture change, dependency change, security/data decision, irreversible/external action. Never ask "should I continue?" — finish reversible work, then one consolidated decision request.

## Lazy references (load only when needed)

- `docs/architecture.md` — stack + directory map
- `docs/quality-gates.md` — gates + anti-cheat
- `docs/testing-strategy.md`
- `docs/accessibility-standards.md`
- `.opencode/agents/*.md` — role prompts (opencode)
- `.opencode/commands/*.md` — `/task`, `/implement`, `/review`, `/verify`, `/debug`, `/ship-report` (opencode)
- `.omp/agents/*.md` — role prompts (OMP)
- `.omp/commands/*.md` — `/task`, `/implement`, `/review`, `/verify`, `/debug`, `/ship-report` (OMP)

> Source: `agentic-dev/variants/web/AGENTS.md` • variant=web • project-local, file-only
