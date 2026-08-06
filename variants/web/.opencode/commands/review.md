---
description: Independent review against diff (fresh context, no implementer reasoning)
agent: reviewer
---

# /review

Inputs: task contract, `git diff`, test + build output, `docs/quality-gates.md`, `docs/architecture.md`. The reviewer **does not** receive implementer's reasoning.

Fail if diff introduces: `any` w/o reason, `eslint-disable`, `test.skip/only`, `setTimeout` race fix, duplicated component, new dep w/o approval, `.env` secret, `console.log` in prod, client-only auth, unnecessary `"use client"`.

Output findings with `Severity / File:line / Rule violated / Failure mode / Reproduce / Minimal correction`. Vague feedback is rejected.

Routes verified findings to `fixer` (implementer in fix mode). Max 2 cycles.
