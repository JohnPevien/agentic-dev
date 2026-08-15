# agentic-dev

Plug-n-play **evidence-gated pipeline** delivered as a file-only, project-local agent pack — now built around a **two-instance relay** and **identity-guided roles**. No `~/.muse` / `~/.config` writes. `scripts/copy.mjs` copies the pack into any new repo; the human drives two harness instances by hand.

> Status: grill session resolved the model-alias problem (killed per-agent model frontmatter, moved to per-instance model identity) and consolidated everything pack-owned under one `.agentic-dev/` folder. Personal git `JohnPevien <johnpevien.dev@gmail.com>` via `includeIf gitdir:~/git-repositories/`. Sandbox blocks `.git` in Muse — run `git init` manually.

## Purpose

- **Fight slop with constraints, not longer prompts.** Separate contexts, independent judgment, executable gates.
- Keep config **project-local** — every target gets its own `AGENTS.md`, `CLAUDE.md`, `.agentic-dev/` via copy. No global source of truth.
- **Variants** — `web` (Next.js pipeline) vs `expo` (mobile stub) today; `api`, `docs`, etc. tomorrow without code change.
- **File-only pack** — no `create-agentic-app` CLI yet; automation is dumb copy + smart merge (`AGENTS.md`/`CLAUDE.md` tag).
- **Harness-agnostic** — no harness-specific trees, no `model:`/`mode:`/`tools:` frontmatter. The pack is portable text + convention. You prompt your harness natively.

## Two-instance architecture

Model identity is **per-instance, not per-agent frontmatter**. You open two instances of your harness:

- **Worker** — a cheap/mid model family. Does all the heavy lifting: recon, tests, implementation, running gates. High token volume, no cost concern.
- **Judge** — a strong/senior model family. Directs the work (plan), judges the output (review), diagnoses hard problems (debugger tournament). High-reasoning, low-volume.

The human is the relay: copy a concise one-sentence prompt from one instance to the other. Role identity files (`.agentic-dev/roles/*.md`) are pasted into whichever instance is playing that role.

### Role tiers

Mental model: **judge = senior engineer, worker = mid/junior.** Worker executes; judge directs, reviews, diagnoses.

| Role | Tier | Job | Why |
|---|---|---|---|
| planner | Judge (senior) | Read recon, write the plan (files, order, tests, risks, binding test direction) | Directing the work is high-leverage; needs strong reasoning. |
| reviewer | Judge (senior) | Fresh-context review of diff + outputs, no worker reasoning | Independent judgment is the point; same-model review defeats it. |
| debugger | Judge (senior) | Tournament of hypotheses on stuck/failing cases | Diagnosis needs depth; only runs for hard cases. |
| test-author | Worker (junior) | Write tests from the contract (not implementation), fail-before-code | Mechanical-to-moderate, high-volume. Bound by the plan's test direction. |
| implementer | Worker (junior) | Edit in worktree, typecheck/lint/test/build; denied push/publish/gate-weakening | High-volume execution against an approved plan. |
| verifier | Worker (junior) | Run gates, produce boring evidence table (PASS/FAIL per gate) | Mechanical verification; deliberately skill-less to avoid interpreting. |

### The relay

- **Pointers, not content dumps.** Both instances share the same repo/filesystem. The human copies one-sentence instructions ("review branch X against contract Y"), not diffs or summaries. The judge reads artifacts from disk.
- **Discipline rule:** the judge never receives the worker's reasoning — only artifacts (diff, test output, contract). The human is the enforcement mechanism. If you paste the worker's summary into the judge, the judge's fresh-context independence is gone.
- **Recon is worker-tier** — volume work; the senior directs and judges, doesn't scour.
- **Cross-tier handoffs only:**
  - Recon → Plan: worker → judge — "Recon done. Read `.agentic-dev/run/<slug>/recon.md`. Plan the task."
  - Plan → Build: judge → worker — "Plan approved at `.agentic-dev/run/<slug>/plan.md`. Write tests, then implement."
  - Build → Review: worker → judge — "Implementation on branch X. Review against contract. Do not read my summary — read the diff."
  - Review → Fix: judge → worker — "Fix these findings: [list]. Re-run gates."
  - [conditional] Build → Debug: worker → judge — "Stuck on: [failure]. Form hypotheses."

### Bias defense

The impl/test same-family blind spot is defended **proactively**: the senior (planner) writes the plan including binding "Tests to create/modify" direction, specifying coverage scope before the junior touches a test. Cross-family diversity enters at guidance (planner) and judgment (reviewer) — the two highest-leverage points. The plan's test direction is **binding** on test-author, not advisory.

## File structure

Everything pack-owned lives under `.agentic-dev/`. Root keeps only the three files every harness reads.

```
<target-project>/
  AGENTS.md                          # convention: declares .agentic-dev/, tier model, relay (always auto-loaded)
  CLAUDE.md                          # CC entry → points to AGENTS.md
  .gitignore                         # includes .agentic-dev/run/
  .agentic-dev/
    orchestration.md                 # relay protocol, tier map, use cases, topology (lazy-loaded on handoff)
    constraints.md                   # deny-rules + anti-cheat as instructions, not mechanical frontmatter
    roles/                           # portable identity prompts — no tool frontmatter, pasted into instance
      planner.md                     # JUDGE
      test-author.md                 # WORKER
      implementer.md                 # WORKER
      reviewer.md                    # JUDGE
      verifier.md                    # WORKER
      debugger.md                    # JUDGE
    reference/                       # pack standards (moved from docs/)
      quality-gates.md
      testing-strategy.md
      accessibility-standards.md
      task-contract-template.md
      architecture.md                # template, project fills
    tasks/                           # contracts — committed, source of truth
      <slug>.md
    run/                             # gitignored — relay state per task
      <slug>/
        recon.md                     # worker → judge
        plan.md                      # judge → worker
        review.md                    # judge → worker
        verify.md                    # worker → human
```

`.gitignore` includes `.agentic-dev/run/` so relay state stays local; `tasks/` and `reference/` are committed.

### Discovery layering

- `AGENTS.md` declares the convention (one line + lazy-ref entrypoint) — always loaded by every harness.
- Role identity files (`.agentic-dev/roles/<role>.md`) bind each role's artifact I/O paths — pasted into the instance by the human when that role is active.
- `.agentic-dev/orchestration.md` holds the full relay protocol — lazy-loaded only when doing a handoff.

### Merge tag convention (in `scripts/copy.mjs`)

`AGENTS.md` / `CLAUDE.md` are merged, never clobbered:

- File missing in target → **created**.
- Exists, no tag → block **appended** at end.
- Exists, tag present → just the tagged block **replaced**; user content above/below untouched.
- Tag: `<!-- agentic-dev:<variant>:start -->` … `<!-- agentic-dev:end -->`.
- Idempotent on re-run.

Permission denies (`.env`, `git push`, `rm -rf`) and skill autoload become **instruction files** in `.agentic-dev/constraints.md` — discipline, not mechanical enforcement. A frontmatter `permission: deny` mechanically blocks; an instruction says "don't" and the model follows it. This is consistent with the relay model where the human controls what each instance runs.

## Pipeline

The pipeline is the same 5-role flow plus a debugger tournament — but described as **relay handoffs between two instances**, not subagent dispatch from one instance.

`Planner → Test Author → Implementer → Verifier`  (+ `Reviewer` loop, + `debugger` tournament for arch/auth/migration/perf/large-refactor)

1. **Task contract** — `.agentic-dev/tasks/<slug>.md` from `reference/task-contract-template.md` (Goal, Given/When/Then, Non-Goals, Required Verification, **Change Budget** max files/lines → exceed ⇒ replan, Decisions needing human, Risks/Rollback).
2. **Recon** — worker-tier read-only sweep: explorer, test archaeologist, dependency scout, risk analyst → facts, not implementation. Output: `run/<slug>/recon.md`.
3. **Plan** — judge reads recon from disk, writes `run/<slug>/plan.md` (files, order, tests, risks, assumptions vs human decisions, **binding test direction**).
4. **Test author** — worker, separate context, from **contract** not implementation, fails before code (unit + interaction + Playwright happy/error + keyboard + focus + axe + responsive). Bound by the plan's test direction.
5. **Implementer** — worker, isolated worktree/branch, allowed: edit in worktree, typecheck/lint/test/build; denied: push, publish, `.env`, gate weakening, `eslint-disable`, `test.skip`.
6. **Verification** — worker runs `reference/quality-gates.md` (formatter → typecheck → lint → focused tests → suite → Playwright → a11y → build → budget audit → anti-cheat). Hard fail on `any` without reason, `@ts-ignore`, duplicated component, new dep without approval, `console.log` in prod, client-only auth, unnecessary `"use client"`.
7. **Reviewer** — judge, fresh context, **no worker reasoning**, reads diff + outputs from disk; findings require severity/location/rule/reproduce/minimal fix. Max 2 cycles → replan.
8. **Verifier** — worker, boring evidence table (`PASS/FAIL` per gate, unexpected files, new deps, risks). No edits. Only then ship.

Debugger tournament (judge-tier) only runs when the worker is stuck on architecture/auth/migration/perf/large-refactor failures — not every button change.

**Composition.** This pipeline is a stateless execution toolkit. A greenfield project uses it as-is; a project with an existing durable workflow (ownership roles, a handoff, a state machine) composes with it — the project's roles govern, the toolkit's roles execute, and a verifier PASS is evidence (not publication).

**Improvements over the original 27k spec (firm, critical):**

- **Per-instance model identity, not frontmatter aliases.** Original shipped per-agent model aliases that were dead tokens outside one harness. Two instances + identity files is portable to any harness.
- **One folder, harness-agnostic.** Harness-specific trees deleted; everything pack-owned lives under `.agentic-dev/`. No `model:`/`mode:`/`tools:` frontmatter.
- **Project-local first, global optional.** Original pushed global `~/.config/opencode`; this pack is file-only project-local — global is thin override, not source of truth.
- **Change budget enforced as gate**, not just prose (gate 9 audits `git diff --stat`).
- **Command discovery from `package.json`**, not hardcoded `pnpm lint && pnpm test` — makes verification plug-n-play across `npm`/`pnpm`/`yarn`.
- **`formatter` added as gate 1** (prevents noisy diffs) and anti-cheat expanded (`as` hiding `unknown`, client-only auth, `"use client"`).
- **Verifier is deliberately boring** and skill-less — per original's warning over interpreting.
- **Tournament scoped** — only for architecture/auth/migration/perf/refactors, not every button change.

## Layout

```
agentic-dev/
  README.md
  AGENTS.md            # dev rules for this repo itself
  CLAUDE.md            # project-local (not global)
  .gitignore
  package.json
  scripts/copy.mjs     # plug-n-play copier (idempotent, --dry-run, --force, no-global guard)
  scripts/check.mjs    # verification
  variants/
    _shared/           # always copied
      AGENTS.md  CLAUDE.md  .gitignore
      .agentic-dev/
        orchestration.md  constraints.md
        roles/{planner,test-author,implementer,reviewer,verifier,debugger}.md
        reference/{quality-gates,testing-strategy,accessibility-standards,task-contract-template,architecture}.md
    web/               # + when --variant=web (evidence-gated pipeline)
      AGENTS.md  CLAUDE.md
      .agentic-dev/    # web-specific overrides + role identity prompts
    expo/              # + when --variant=expo (stub)
      AGENTS.md  CLAUDE.md
      .agentic-dev/
```

Variants carry `.agentic-dev/` content, not harness-specific trees.

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
- **Agent pack only**: no Next.js baseline files; web vs expo differ only in `.agentic-dev/` content (Q3).
- **Variants as folders**: `variants/_shared` + `variants/<stack>` (Q4).
- **Safe copy**: skip + warn by default, `--force` to overwrite (Q5).
- **Explicit merge tag**: `<!-- agentic-dev:<variant>:start -->` … `<!-- agentic-dev:end -->` idempotent replace/append (Q6).
- **No global config**: invariant enforced in `scripts/copy.mjs` — asserts target is not `~`, `~/.muse`, `~/.config`, etc., and never writes outside target (Q7).
- **Per-instance model identity**: two harness instances (worker/judge), not per-agent model frontmatter — portable to any harness (Q8).
- **Senior/junior tier model**: judge = planner/reviewer/debugger; worker = test-author/implementer/verifier. Worker does the volume; judge directs and judges (Q9).
- **One folder, harness-agnostic**: everything pack-owned under `.agentic-dev/`; harness-specific trees deleted; no `model:`/`mode:`/`tools:` frontmatter (Q10).
- **Relay protocol**: pointers not content dumps, shared repo, discipline rule (judge never receives worker reasoning) (Q11).

## Adding a variant

```bash
cp -R variants/web variants/api
# edit variants/api/AGENTS.md, variants/api/.agentic-dev/ content
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