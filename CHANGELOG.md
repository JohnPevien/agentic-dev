# Changelog

All notable changes to agentic-dev are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Architecture — Two-instance relay model

- **Model identity is per-instance, not per-agent frontmatter.** Removed `model:`, `mode:`, `tools:`, `permission:` frontmatter from all agent files. The user opens two harness instances (worker + judge) and pastes role identity guides. Rationale: `@smol`/`@slow` aliases were OMP-specific and failed in Claude Code, Codex, and agy. The tier *intent* was portable; the tier *spelling* was not — portability wins over harness-specific routing.
- **Senior/junior tier model.** Judge (senior): planner, reviewer, debugger. Worker (junior): test-author, implementer, verifier. Worker does all heavy lifting — high token volume, no cost concern — while the judge directs, reviews, and diagnoses. High-reasoning / low-volume work stays on the senior; high-volume / mechanical-to-moderate work goes to the junior.
- **Bias defense relocated to proactive direction.** The impl/test same-family blind spot is defended by the senior writing *binding* test direction in the plan (coverage scope pre-specified), not by reactive review of test adequacy. Cross-family diversity enters at guidance (planner) and judgment (reviewer) — the two highest-leverage points. The plan's test direction is binding on test-author, not advisory.

### Changed — Single folder structure

- **Everything pack-owned moved under `.agentic-dev/`.** Root keeps only `AGENTS.md`, `CLAUDE.md`, `.gitignore`. The five `docs/*` files moved to `.agentic-dev/reference/`. New: `.agentic-dev/orchestration.md` (relay protocol), `.agentic-dev/constraints.md` (deny-rules + anti-cheat as instructions), `.agentic-dev/roles/` (portable identity prompts), `.agentic-dev/tasks/` (contracts), `.agentic-dev/run/` (gitignored relay state). Rationale: avoids collision with a target project's `docs/`; the pack becomes one removable directory.
- **AGENTS.md declares the convention; role files bind artifact I/O.** `AGENTS.md` carries one line + a lazy-ref entrypoint (always loaded by every harness). Role identity files under `.agentic-dev/roles/<role>.md` bind each role's artifact paths and are pasted into whichever instance the human assigns them to. Full protocol lives in `.agentic-dev/orchestration.md`, lazy-loaded only when doing a handoff.

### Removed — Harness-specific trees

- **Deleted `.opencode/` tree** (agents, commands, skills, config). No slash commands, no OpenCode-specific agent files. Rationale: harness-specific trees are not portable across Claude Code, Codex, agy, OMP.
- **Deleted `.omp/` tree** (agents, commands, skills, config). No OMP-specific agent files, for the same reason.
- **Permission denies became instruction files.** `.agentic-dev/constraints.md` carries deny-rules (`.env`, `git push`, `rm -rf`) and anti-cheat as *discipline*, not mechanical enforcement. Trade-off accepted: instruction ≠ enforcement, but this is consistent with the relay model where the human controls what each instance actually runs.
- **Skill autoload became instruction.** Roles reference skills by name in their identity files; the human loads them manually. No frontmatter-driven autoload.

### Relay protocol

- **Pointers, not content dumps.** Both instances share the same repo/filesystem. The human copies one-sentence instructions ("review branch X against contract Y"), not diffs or summaries. The judge reads artifacts from disk.
- **Discipline rule.** The judge never receives the worker's reasoning — only artifacts (diff, test output, contract). The human is the enforcement mechanism. If the worker's summary is pasted, the judge's fresh-context independence is lost.
- **Recon is worker-tier.** Recon is volume work; the senior directs and judges it, doesn't scour.
- **Cross-tier handoffs only.** Recon → Plan (worker → judge); Plan → Build (judge → worker); Build → Review (worker → judge); Review → Fix (judge → worker); conditionally Build → Debug (worker → judge). No same-tier chatter.
- **Process state in `.agentic-dev/run/<slug>/`.** Files: `recon.md` (worker → judge), `plan.md` (judge → worker), `review.md` (judge → worker), `verify.md` (worker → human). Gitignored.

### Preserved — Merge behavior (no change)

- **`AGENTS.md`/`CLAUDE.md` merge semantics unchanged.** Missing → create; exists with no tag → append the block at end; exists with the tag → replace just the tagged block (user content above/below untouched). Tag: `<!-- agentic-dev:<variant>:start -->` … `<!-- agentic-dev:end -->`. Idempotent on re-run. Implemented in `scripts/copy.mjs`.

### Downstream — Not yet implemented

- **`scripts/copy.mjs` needs updating.** No longer copies `.opencode/`/`.omp/` trees; copies `.agentic-dev/` instead; handles `.gitignore` merge (append `.agentic-dev/run/`).
- **Role identity files need to be written** (`.agentic-dev/roles/*.md`) — portable text, stripped of all frontmatter.
- **`.agentic-dev/orchestration.md` and `.agentic-dev/constraints.md` need to be written.**
- **Existing `docs/*` content moves to `.agentic-dev/reference/`** (quality-gates, testing-strategy, accessibility-standards, task-contract-template, architecture).
- **`scripts/check.mjs` may need updates** to verify the new structure.

## [0.1.0] - 2026-08-06

Initial scaffold of the file-only, project-local, variant-aware agent pack. Approximate date from the first commit (`chore: scaffold agentic-dev evidence-gated pipeline`).

- **File-only pack, no global writes.** `scripts/copy.mjs` copies the pack into a target repo; asserts target is not `~`, `~/.muse`, `~/.config`, and never writes outside the target dir.
- **Variants as folders.** `variants/_shared` (always copied) + `variants/web` (Next.js pipeline) + `variants/expo` (mobile stub). Add a variant by copying the folder — no code change.
- **Copier with merge semantics.** `AGENTS.md`/`CLAUDE.md` merged via `<!-- agentic-dev:<variant>:start -->` … `<!-- agentic-dev:end -->` tag: replace if present, append if absent, idempotent on re-run. Other differing files warn + skip (`--force` to overwrite).
- **5-role evidence-gated pipeline.** Planner → Test Author → Implementer → Reviewer → Verifier, with a debugger tournament scoped to architecture/auth/migration/perf/large-refactor. Gates: formatter → typecheck → lint → focused tests → suite → Playwright → a11y → build → change-budget audit → anti-cheat.
- **Quality gates as files.** `docs/quality-gates.md`, `docs/testing-strategy.md`, `docs/accessibility-standards.md`, `docs/task-contract-template.md`, `docs/architecture.md` shipped under `_shared` so every variant inherits them.