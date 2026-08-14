# Shared Agent Pack — agentic-dev (_shared)

This block is copied into every new project (web, expo, etc.) via `scripts/copy.mjs`.
When merged into an existing `AGENTS.md`, it is wrapped as:

`&lt;!-- agentic-dev:VARIANT:start --&gt;` … `&lt;!-- agentic-dev:end --&gt;` (VARIANT = web, expo, etc.)

## Base rules (all stacks)

- Keep project-local agent config — do not write to `~/.muse`, `~/.config`, or global `~/.agents`.
- Prefer small, reversible edits. Verify with `node --check` or existing lints before committing.
- If a `variants/<stack>/AGENTS.md` also exists, its rules take precedence over this shared section.
- This pack is an **execution toolkit** (stateless subagent pipeline). When a project already carries a durable workflow (ownership roles, a handoff, a state machine), the toolkit composes with it — the project's roles govern, the toolkit's subagents execute. The variant `AGENTS.md` has the composition details.

> Source: `agentic-dev/variants/_shared/AGENTS.md` • copied by `scripts/copy.mjs --variant=<stack> <target>`
