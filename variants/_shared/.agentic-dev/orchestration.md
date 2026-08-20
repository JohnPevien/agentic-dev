# Orchestration — Two-Instance Relay Protocol

## The model

You run **two instances** of your coding harness. One is the **worker** (a cheap or mid model — high token volume, no cost concern). The other is the **judge** (a strong, high-reasoning model — low volume, high leverage).

The worker does all the heavy lifting: recon, tests, implementation, gate-running. The judge directs, reviews, and diagnoses. The human is the relay between them — copying one-sentence pointers, not content dumps.

### Why two instances

Model identity is per-instance, not per-agent frontmatter. A `model: "@smol"` token in an agent file is dead in any harness that doesn't speak OMP's alias language. Instead, the user picks the model when they open the instance. The `.agentic-dev/roles/<role>.md` files are **identity guides** — pure text, pasted into whichever instance is playing that role. No tool-specific frontmatter.

## Tier map

| Role | Tier | Job | Why this tier |
|---|---|---|---|
| planner | Judge (senior) | Produces the implementation plan from contract + recon | Directs the work — needs architecture judgment and the authority to set binding test direction |
| test-author | Worker (junior/mid) | Writes failing tests from contract + plan's test direction | High-volume execution; follows the plan's coverage scope, doesn't invent it |
| implementer | Worker (junior/mid) | Implements against the approved plan + failing tests | High-volume execution; follows the plan's order, doesn't redesign |
| reviewer | Judge (senior) | Reviews the diff with fresh context | Judges output — needs senior judgment, must not inherit the implementer's framing |
| verifier | Worker (junior/mid) | Runs quality gates mechanically | Boring, mechanical — no creative interpretation, just PASS/FAIL |
| debugger | Judge (senior) | Diagnoses hard failures via hypothesis tournament | Hard problems need senior reasoning; trivial issues stay with the implementer |

Recon (scouring the codebase for relevant files, patterns, coverage, regression surfaces) is **worker-tier** — volume work. The senior directs and judges; they don't scour.

## Relay protocol

### Pointers, not content dumps

Both instances share the same repo and filesystem. The human copies **one-sentence instructions** between instances, not diffs, summaries, or reasoning. The receiving instance reads artifacts from disk.

Example pointer: *"Review branch `feat-auth-123` against contract `.agentic-dev/tasks/auth-123.md`. Do not read my summary — read the diff."*

### Discipline rule

The judge **never receives the worker's reasoning** — only artifacts (diff, test output, contract). The human is the enforcement mechanism. If they paste the worker's summary into the judge instance, the judge's fresh-context independence is gone. This is the core defense against the implementer's framing contaminating the review.

### Shared filesystem

Both instances operate on the same repo. Process state lives in `.agentic-dev/run/<slug>/`:

| File | Direction | Contents |
|---|---|---|
| `recon.md` | worker → judge | Relevant files, existing patterns, test coverage, regression surfaces, unresolved decisions |
| `plan.md` | judge → worker | Files to change, implementation order, binding test direction, risks, assumptions, budget |
| `review.md` | judge → worker | Findings with severity, location, failure mode, rule violated, repro, minimal correction |
| `verify.md` | worker → human | Evidence table (gates + acceptance criteria), ship/no-ship decision |

Contracts live in `.agentic-dev/tasks/<slug>.md` — committed, the source of truth. Run state is gitignored.

## Cross-tier handoffs

Only five handoffs cross the instance boundary. Everything else stays within one instance.

1. **Recon → Plan** (worker → judge)
   > Recon done. Read `.agentic-dev/run/<slug>/recon.md`. Plan the task.

2. **Plan → Build** (judge → worker)
   > Plan approved at `.agentic-dev/run/<slug>/plan.md`. Write tests, then implement.

3. **Build → Review** (worker → judge)
   > Implementation on branch `<branch>`. Review against contract. Do not read my summary — read the diff.

4. **Review → Fix** (judge → worker)
   > Fix these findings: [list from review.md]. Re-run gates.

5. **Build → Debug** (conditional, worker → judge)
   > Stuck on: [failure symptom]. Form hypotheses.

Handoffs 3 and 4 may cycle up to 2 times. If the second review still has blockers, the judge requires replanning.

## Deployment guide

### Per runtime

Open two instances of your harness — Claude Code, Codex, agy, OMP, OpenCode, or any agent that reads markdown.

1. **Worker instance:** open with a cheap or mid model (e.g., GPT-4.1-mini, Claude Haiku, Gemini Flash). This is your high-volume executor.
2. **Judge instance:** open with a strong model (e.g., GPT-5, Claude Opus, Gemini Pro). This is your director/reviewer.

### Assigning roles

When a handoff occurs, paste the role identity from `.agentic-dev/roles/<role>.md` into whichever instance is playing that role. The role file tells the instance:

- Its tier (judge or worker)
- Its inputs and outputs (paths under `.agentic-dev/`)
- Its rules
- What to emit when done (the handoff signal)

Then copy the handoff prompt (from the list above) between instances.

### Example session

1. Human opens worker instance, pastes the recon prompt + task contract path. Worker does recon, writes `recon.md`, signals done.
2. Human copies the Recon → Plan pointer to the judge instance, pastes the planner role identity. Judge reads `recon.md` + contract, writes `plan.md`, signals done.
3. Human copies the Plan → Build pointer to the worker instance, pastes the test-author then implementer role identities in sequence. Worker writes failing tests, implements, runs local gates, signals done.
4. Human copies the Build → Review pointer to the judge instance, pastes the reviewer role identity. Judge reads the diff (not the summary), writes `review.md`, signals done.
5. If findings: human copies Review → Fix to the worker. Worker fixes, re-runs gates, signals done. Back to step 4 (max 2 cycles).
6. If clean: human copies the build pointer to the worker instance, pastes the verifier role identity. Worker runs all gates, writes `verify.md`, signals done.
7. Human reads `verify.md` — ship or no-ship.

## Bias defense

The original concern: when the implementer and test-author share the same model family, they share the same blind spots. The test-author may write tests that mirror the implementation's assumptions rather than challenging them.

Defense is **proactive**, not reactive:

1. **The planner (judge, senior) writes binding test direction.** Before the test-author touches a test, the plan's "Tests to create/modify" section specifies coverage scope: which edges, error states, interaction patterns, a11y checks, responsive breakpoints. The test-author follows this direction — they do not invent coverage.
2. **The reviewer (judge, senior) reviews with fresh context.** The reviewer never reads the implementer's reasoning. They read the diff and judge it against the contract and quality gates. Cross-family diversity enters at guidance (planner) and judgment (reviewer) — the two highest-leverage points.

The plan's test direction is **binding** on the test-author, not advisory. If the test-author deviates, the reviewer catches it.

## When to use the debugger

The debugger is a **tournament**, not a first resort. Trigger it when the worker is stuck on a failure that resists the obvious fix:

- **Architectural issues** — cross-module interaction, state management, race conditions
- **Auth or security failures** — permission boundaries, token handling, session state
- **Migrations or schema issues** — data shape changes, backward compatibility
- **Performance regressions** — the change made something slow and it's not obvious why
- **Large refactors gone wrong** — the refactor compiles but behavior is off
- **Flaky tests** — intermittent failures that suggest a timing or state issue

**Do not trigger the debugger for:** trivial button changes, typo fixes, missing imports, CSS tweaks. Those are implementer work. The debugger's value is in forming multiple independent hypotheses and eliminating them with evidence — that machinery is wasted on trivial issues.

The debugger forms 2-3 independent root-cause hypotheses, states how to falsify each, runs probes, keeps only the hypothesis with evidence, and applies the smallest verified fix. No redesign. No opportunistic refactor. See `.agentic-dev/roles/debugger.md`.