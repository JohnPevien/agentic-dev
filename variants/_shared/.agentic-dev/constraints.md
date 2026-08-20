# Constraints — Deny-Rules and Anti-Cheat

These are **discipline rules**, not mechanical enforcement. The relay model means the human controls what each instance runs. A frontmatter `permission: deny` mechanically blocks; an instruction says "don't" and the model follows it. Follow these as rules. If you violate one, you've broken discipline — not hit a wall.

## Deny-rules

The implementer (and any worker-tier role editing code) must not:

- **Never read `.env` or `.env.*`.** Secrets are not your concern. If a test needs a value, the human provides it.
- **Never `git push`.** Local commits in the worktree are fine. Remote operations are the human's job.
- **Never `npm publish` / `pnpm publish`.** No package release.
- **Never `rm -rf /` or `rm -rf ~`.** No destructive filesystem operations outside the worktree.
- **Never modify CI or quality rules to pass them.** If the gate is wrong, flag it — don't weaken it.
- **Never use `eslint-disable` without a `// why:` comment and a narrowing plan.** Suppressing a lint warning is debt; it must be justified and time-boxed.
- **Never use `test.skip`, `describe.skip`, `it.only`, or `test.only` without a `// why:` comment.** Skipping a test hides a failure. Focusing a test narrows the suite. Both must be intentional and explained.
- **Never use `any` without a `// why:` comment and a narrowing plan.** `any` disables type safety. If you must use it, explain why and when you'll remove it.
- **Never add a new dependency without approval.** Adding a package expands the supply chain and bundle. Flag it; the human decides.
- **Never run destructive database operations.** No `DROP`, no `TRUNCATE`, no mass `DELETE` in production or shared environments.
- **Never edit outside the worktree for this task.** Your changes are isolated to the task's branch. The main branch and other tasks are off-limits.

## Anti-cheat scan

The verifier (and reviewer) scan the git diff for these patterns. Any hit is a finding — it suggests the worker worked around a problem instead of solving it.

| Pattern | Why it's a finding |
|---|---|
| `any` without a `// why:` comment | Hides unknown types; disables safety |
| `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` without an issue link | Silences the compiler without tracking the debt |
| `eslint-disable` without a `// why:` | Suppresses a rule without justification |
| `test.skip` / `describe.skip` / `it.only` / `test.only` | Hides or narrows test failures |
| `setTimeout` used to fix a race | Masks a timing bug instead of fixing the synchronization |
| Empty catch block (`catch {}` or `catch (e) {}` with no handling) | Swallows errors silently |
| Commented-out implementation | Dead code that should be deleted or fixed |
| Duplicated component (same logic copied to a new file) | Violates DRY; should be extracted |
| New dependency in `package.json` without approval | Expands supply chain without sign-off |
| Secret or `.env` value hardcoded in source | Leaks credentials; should come from environment |
| `console.log` in production code | Debugging artifact left behind |
| Client-only auth check (auth logic in client-rendered code without server validation) | Security hole — client checks are bypassable |
| `as` cast hiding an unknown type | Type assertion that bypasses safety; same risk as `any` |
| `"use client"` without approval + hydration check | Marks server-incompatible code; needs hydration verification |

## How to use this file

- **Implementer:** read this before starting. Follow the deny-rules. If you're tempted to use `any`, `eslint-disable`, or skip a test, write the `// why:` comment and the narrowing plan first.
- **Reviewer:** scan the diff for every pattern in the anti-cheat table. Each hit is a finding with severity (usually major) and the minimal correction (remove the suppression and fix the underlying issue, or justify it with a tracked plan).
- **Verifier:** run the anti-cheat scan as gate 9. Report any hits in `verify.md` under "unexpected files" or "risks" — they are ship blockers unless justified.