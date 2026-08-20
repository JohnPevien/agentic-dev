# Shared Claude Rules — agentic-dev (_shared)

Project-local rules copied into every new project by `scripts/copy.mjs`.

- This repo is a **consumer** of `agentic-dev`, not a global config. Keep `CLAUDE.md` project-local.
- The convention lives in `AGENTS.md` — read it for the relay model, tier map, and handoff protocol.
- Pack directory is `.agentic-dev/` (roles, reference docs, tasks, run state, constraints).
- Stack variants (`web`, `expo`, …) may extend this file. See `variants/<stack>/CLAUDE.md`.

> Source: `agentic-dev/variants/_shared/CLAUDE.md`