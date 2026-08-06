# agentic-dev

Plug-n-play **evidence-gated pipeline** for future web projects — **file-only, project-local, variant-aware**. No `~/.muse` / `~/.config` writes. `scripts/copy.mjs` copies the pack into any new repo.

> Status: grill 7/7 + pipeline upgraded (critiqued original 27k spec, kept firm project-local direction). Personal git `JohnPevien <johnpevien.dev@gmail.com>` via `includeIf gitdir:~/git-repositories/`. Sandbox blocks `.git` in Muse — run `git init` manually.

## Purpose

- **Fight slop with constraints, not longer prompts.** Separate contexts, independent agents, executable gates.
- Keep config **project-local** — every target gets its own `AGENTS.md`, `.opencode/`, `docs/*`, `.agents/` via copy. Global `~/.config/opencode` is **optional override**, not source of truth.
- **Variants** — `web` (Next.js pipeline) vs `expo` (mobile stub) today; `api`, `docs`, etc. tomorrow without code change.
- **File-only pack** — no `create-agentic-app` CLI yet; automation is dumb copy + smart merge (`AGENTS.md`/`CLAUDE.md` tag).

## Layout

```
agentic-dev/
  README.md
  AGENTS.md            # dev rules for this repo itself
  CLAUDE.md            # project-local (not global)
  .gitignore  package.json
  scripts/copy.mjs     # plug-n-play copier (idempotent, --dry-run, --force, no-global guard)
  scripts/check.mjs    # 8-gate verification
  variants/
    _shared/           # always copied
      AGENTS.md  CLAUDE.md  .agents/skills/example/SKILL.md
      docs/task-contract-template.md  docs/quality-gates.md  docs/architecture.md  docs/testing-strategy.md  docs/accessibility-standards.md
    web/               # + when --variant=web (evidence-gated pipeline)
      AGENTS.md  CLAUDE.md  docs/* (5 files)
      .opencode/opencode.jsonc  .opencode/agents/{planner,test-author,implementer,reviewer,verifier,debugger}.md
      .opencode/commands/{task,implement,review,verify,debug,ship-report}.md
      .opencode/skills/{typescript-quality,react-best-practices,baseline-ui}/SKILL.md
      .agents/skills/web/SKILL.md
    expo/              # + when --variant=expo (stub)
      AGENTS.md  CLAUDE.md  .agents/skills/expo/SKILL.md
```

Add a new variant: `mkdir -p variants/<name> && cp -R variants/web/* variants/<name>/` then edit. No code change.

## Pipeline (what web variant gives you)

**Thesis:** tokens are abundant (cheap-tier models are a fraction of flagship cost) — spend them *horizontally* (separate contexts, redundancy, independent evidence), not on one agent monologue. Use `/models` for exact IDs; don't hardcode token quotas.

**5-role start (add tournament only for hard cases):**

`Planner → Test Author → Implementer → Reviewer → Verifier`  (+ `debugger` tournament for arch/auth/migration/perf/large-refactor)

1. **Task contract** — `docs/tasks/<slug>.md` from `docs/task-contract-template.md` (Goal, Given/When/Then, Non-Goals, Required Verification, **Change Budget** max files/lines → exceed ⇒ replan, Decisions needing human, Risks/Rollback).
2. **Recon** — parallel read-only agents: explorer, test archaeologist, dependency scout, risk analyst → facts, not implementation.
3. **Plan** — read-only `planner` (files, order, tests, risks, assumptions vs human decisions).
4. **Test author** — separate context, from **contract** not implementation, fails before code (unit + interaction + Playwright happy/error + keyboard + focus + axe + responsive).
5. **Implementer** — isolated worktree/branch, allowed: edit in worktree, typecheck/lint/test/build; denied: push, publish, `.env`, gate weakening, `eslint-disable`, `test.skip`.
6. **Verification** — `docs/quality-gates.md` (formatter → typecheck → lint → focused tests → suite → Playwright → a11y → build → budget audit → anti-cheat). Hard fail on `any` without reason, `@ts-ignore`, duplicated component, new dep without approval, `console.log` in prod, client-only auth, unnecessary `"use client"`.
7. **Reviewer** — fresh context, **no implementer reasoning**, diff + outputs; findings require severity/location/rule/reproduce/minimal fix. Max 2 cycles → replan.
8. **Verifier** — boring evidence table (`PASS/FAIL` per gate, unexpected files, new deps, risks). No edits. Only then ship.

See `variants/web/AGENTS.md` for the concise lazy-ref entrypoint and `variants/web/.opencode/opencode.jsonc` for permissions (auto + deny: `.env`, `git push`, `rm -rf /`).

**Improvements over original 27k spec (firm, critical):**

- **Project-local first, global optional.** Original pushed global `~/.config/opencode`; this pack is file-only project-local per your "no global config" — global is thin override, not source of truth.
- **Change budget enforced as gate**, not just prose (gate 9 audits `git diff --stat`).
- **Command discovery from `package.json`**, not hardcoded `pnpm lint && pnpm test` — makes `/verify` plug-n-play across `npm`/`pnpm`/`yarn`.
- **`formatter` added as gate 1** (prevents noisy diffs) and anti-cheat expanded (`as` hiding `unknown`, client-only auth, `"use client"`).
- **Skill stubs pinned** (`typescript-quality` is custom minimal, not maximalist public skill; `react-best-practices`/`baseline-ui` are placeholders with supply-chain warning).
- **Verifier is deliberately boring** and skill-less — per original's warning over interpreting.
- **Tournament scoped** — only for architecture/auth/migration/perf/refactors, not every button change.

## Quick start

### Git setup (required once)

Muse's sandbox blocks `.git` creation (Operation not permitted on `.git`). Run this in **your Terminal** (outside Muse):

```bash
cd ~/git-repositories/agentic-dev
git init
git config user.name   # → JohnPevien
git config user.email  # → johnpevien.dev@gmail.com
git add .
git commit -m "chore: scaffold agentic-dev file-only pack (variants/web, expo, _shared)"
# optional: gh repo create agentic-dev --private --source=. --push
```

Personal identity comes from `~/.gitconfig-personal` via `includeIf gitdir:~/git-repositories/` — any repo under `~/git-repositories/` automatically uses `JohnPevien <johnpevien.dev@gmail.com>`, not work `jpevien@ltagency.com.au`.

### Use the copier

```bash
# from agentic-dev root
node scripts/copy.mjs --variant=web  /path/to/my-new-web-project
node scripts/copy.mjs --variant=expo /path/to/my-expo-app --dry-run
node scripts/copy.mjs --variant=web  /path/to/project --force   # overwrite non-merge files

# inside agentic-dev to test idempotency
npm run copy:web -- /tmp/test-web --dry-run
```

### Copy semantics

| Target state | Behavior |
|---|---|
| File missing in target | Copied verbatim |
| File exists, content identical | Skipped (silent) |
| `AGENTS.md` / `CLAUDE.md` exists, differs | **Merge/patch**: block wrapped with `<!-- agentic-dev:<variant>:start -->` … `<!-- agentic-dev:end -->` is replaced if present, else **appended at end**. Idempotent on re-run. |
| Other file exists, differs | WARN + skip. Use `--force` to overwrite. |
| `--dry-run` | Lists `COPY` / `SKIP` / `MERGE` / `WARN` without writing. No global writes ever — only inside target dir. |

Wrapping tag example (appended end of `AGENTS.md`):

```md
<!-- agentic-dev:web:start -->
<!-- source: agentic-dev/variants/web/AGENTS.md -->
... variant content ...
<!-- agentic-dev:end -->
```

Re-running the copier replaces that block; your own content above it is untouched.

## Design decisions (grill-me)

- **Deliverable = file pack**: not a CLI generator yet (Q1/Q2).
- **Agent pack only**: no Next.js baseline files; web vs expo differ only in agent config (Q3).
- **Variants as folders**: `variants/_shared` + `variants/<stack>` (Q4).
- **Safe copy**: skip+w Warn by default, `--force` to overwrite (Q5).
- **Explicit tag**: `<!-- agentic-dev:<variant>:start -->` … `<!-- agentic-dev:end -->` idempotent replace/append (Q6).
- **No global config**: invariant enforced in `scripts/copy.mjs` — asserts target is not `~`, `~/.muse`, `~/.config`, etc., and never writes outside target (Q7).

## Adding a variant

```bash
cp -R variants/web variants/api
# edit variants/api/AGENTS.md, variants/api/.agents/...
node scripts/copy.mjs --variant=api /tmp/test-api --dry-run
```

## Scripts

| Command | Description |
|---|---|
| `node scripts/copy.mjs --variant=web <target>` | Copy `_shared` + `web` into target |
| `node scripts/copy.mjs --variant=expo <target>` | Copy `_shared` + `expo` |
| `npm run copy:web -- <target>` | Shortcut |
| `npm run copy:expo -- <target>` | Shortcut |

## Verification (local, no CI yet)

```bash
node --check scripts/copy.mjs
npm run check:copy   # dry-run + idempotency checks (see package.json)
```
