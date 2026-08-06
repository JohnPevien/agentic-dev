# Shared Agent Pack — agentic-dev (_shared)

This block is copied into every new project (web, expo, etc.) via `scripts/copy.mjs`.
When merged into an existing `AGENTS.md`, it is wrapped as:

`&lt;!-- agentic-dev:VARIANT:start --&gt;` … `&lt;!-- agentic-dev:end --&gt;` (VARIANT = web, expo, etc.)

## Base rules (all stacks)

- Keep project-local agent config — do not write to `~/.muse`, `~/.config`, or global `~/.agents`.
- Prefer small, reversible edits. Verify with `node --check` or existing lints before committing.
- If a `variants/<stack>/AGENTS.md` also exists, its rules take precedence over this shared section.

> Source: `agentic-dev/variants/_shared/AGENTS.md` • copied by `scripts/copy.mjs --variant=<stack> <target>`
