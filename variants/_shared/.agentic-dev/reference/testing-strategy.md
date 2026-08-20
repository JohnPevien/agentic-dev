# Testing Strategy

## Levels

1. **Unit** — pure transformations, business logic, utilities (Vitest/Jest)
2. **Component interaction** — React Testing Library, user events, not implementation details
3. **Integration** — route handlers, API clients with MSW
4. **E2E (Playwright)** — happy path + error/retry + keyboard + focus

## Test author rules (anti-slop)

- Tests are written by a **separate agent** from implementer, from **acceptance criteria**, not from implementation.
- Important tests should **fail before implementation** (red phase).
- Do not let test author read implementer's reasoning; it may read existing code but contract is truth.
- For frontend: include unit, interaction, Playwright happy/error, keyboard, focus placement/restoration, automated a11y (`axe`), responsive (375/1280), permission boundaries.

## Placement

- `src/<feature>/*.test.ts` (colocated) or `src/__tests__` per project convention — document choice in `.agentic-dev/reference/architecture.md`.
- Playwright: `e2e/<feature>.spec.ts`

## Anti-cheat

- No `test.skip` / `only` in committed code.
- No mocking of system under test.
- No snapshot-only coverage for logic that needs assertions.

## Improvement

Original lumped unit/component/a11y into one bullet; this separates levels and mandates **failure-before-implementation** as an explicit gate, which was described but not enforced.