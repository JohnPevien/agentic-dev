---
description: Independent review against diff (fresh context, no implementer reasoning)
---

# /review

Inputs: task contract, `git diff`, test + build output, `docs/quality-gates.md`, `docs/architecture.md`. The reviewer **does not** receive the implementer's reasoning.

Dispatch the `reviewer` subagent via the task tool (`agent: "reviewer"`).

Fail if diff introduces: `any` w/o reason, `eslint-disable`, `test.skip/only`, `setTimeout` race fix, duplicated component, new dep w/o approval, `.env` secret, `console.log` in prod, client-only auth, unnecessary `"use client"`.

Output findings with `Severity / File:line / Rule violated / Failure mode / Reproduce / Minimal correction`. Vague feedback is rejected.

Routes verified findings to the implementer (fix mode). Max 2 cycles.
