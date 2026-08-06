# AGENTS.md — web variant (project-local)

Concise entry point. Load details on demand — do not paste whole repo into context.

## Core rule (anti-slop)

> **Do not fight slop with longer prompts. Fight it with executable constraints, independent agents, and evidence.**

Tokens are cheap — use them for redundancy (separate contexts, re-reading code, independent tests), not monologues.

## Stack (per project, see docs/architecture.md)

Next.js App Router, React 19, Tailwind 4, shadcn/ui. Prefer Server Components by default; Client Components only at interactive boundaries. See `docs/architecture.md` for project specifics.

## Required workflow (evidence-gated, 5 roles to start)

`Planner → Test Author → Implementer → Reviewer → Verifier`

Add `debugger` tournament (2-3 hypotheses) only for: arch changes, auth, migrations, perf regressions, large refactors.

1. **Task contract** — fill `docs/task-contract-template.md` → `docs/tasks/<slug>.md`. Must include Goal, Acceptance Criteria (Given/When/Then), Non-Goals, Required Verification, Change Budget (max files/lines), Decisions needing human.
2. **Reconnaissance** — read-only agents in parallel: codebase explorer, test archaeologist, dependency scout, risk analyst. Output is facts (`Relevant files:` … `Unresolved decisions:`), not implementation.
3. **Plan** — read-only planner: files to change, order, tests, risks/rollback, assumptions vs. decisions needing you.
4. **Test author** — separate context, from **acceptance criteria**, fails before implementation. Includes happy/error, keyboard, focus, a11y, responsive.
5. **Implementer** — isolated branch/worktree. Allowed: read/edit in worktree, typecheck/lint/test/build, git status/diff. Denied: push, publish, read `.env`, modify quality gates, `eslint-disable`, `test.skip`.
6. **Deterministic verification** — `docs/quality-gates.md` (formatter → typecheck → lint → tests → Playwright → a11y → build → budget audit → anti-cheat). Fail on `any` without reason, `eslint-disable`, `test.only`, etc.
7. **Independent reviewer** — fresh context, **no implementer reasoning**, diff + outputs + `docs/quality-gates.md`. Findings require severity + location + rule violated + reproduce + minimal correction. Max 2 review→fix cycles, then replan.
8. **Verifier** — read-only evidence table: acceptance, typecheck, lint, tests, build, a11y, unexpected files, dependencies, risks, human decisions. Only then ship.

## Permissions (enforced via .opencode/opencode.jsonc, also via auto + deny)

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
- `.opencode/agents/*.md` — role prompts
- `.opencode/commands/*.md` — `/task`, `/implement`, `/review`, `/verify`, `/debug`

> Source: `agentic-dev/variants/web/AGENTS.md` • variant=web • project-local, file-only
