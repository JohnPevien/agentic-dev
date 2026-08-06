# Quality Gates

Applies to every task. Run in this order; each gate is a hard fail.

## Execution order

1. **Formatter** — `package.json` `format:check` or `prettier --check` if present
2. **TypeScript typecheck** — `tsc --noEmit` / `pnpm typecheck` (project's script)
3. **ESLint** — project's `lint` script
4. **Focused unit/component tests** — tests for changed area
5. **Full relevant suite** — not just focused
6. **Playwright critical-flow** — if task touches UI flows
7. **Accessibility checks** — `axe` / `playwright --a11y` if UI
8. **Production build** — `next build` / `vite build` per project
9. **Change-budget audit** — `git diff --stat` ≤ contract limits
10. **Anti-cheat scan** — see below

## Anti-cheat checks (fail if found)

Scan `git diff` for these in changed files without approved justification:

- `any` without `// why:` + narrowing plan
- `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` without issue link
- `eslint-disable` (any)
- `test.skip`, `describe.skip`, `it.only`, `test.only`
- `setTimeout(` used to fix race
- empty `catch` / commented-out implementation
- duplicated component instead of reuse (reviewer flags)
- new dependency without approval
- secret / `.env` value in diff
- `console.log` in production path
- client-only auth guard (reviewer flags)
- `as` cast that hides `unknown` without validation
- `"use client"` added without reviewer approval + hydration check

## Frontend-specific checks

- No unnecessary `"use client"` boundary
- Hydration risk (server/client value mismatch)
- Missing `loading` / `error` / `empty` states
- Semantic HTML + heading order + label / accessible-name
- Keyboard + focus placement / restoration
- Layout shift / CLS risk
- Bundle impact (`next-bundle-analyzer` if available)
- ResponsiveAssertions (viewport 375 + 1280)
- Design-token usage (no ad-hoc colors/spacing)

## Improvement over original

- Added **formatter as gate 1** (original started at typecheck) — prevents noisy diffs.
- Added **change-budget audit** as gate 9 — original described budget but never enforced it.
- Anti-cheat now includes `as` hiding `unknown`, `use client`, and client-only auth — tighter frontend guardrails.
- This file is the single source of truth for `task contract → Required verification`. Agents read it via lazy reference, not by pasting into every prompt.
