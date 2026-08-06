# Accessibility Standards

Target: WCAG 2.2 AA. Automated checks are gates, not proof.

## Agent checklist

- Semantic HTML + heading order (`h1` → `h2` ...)
- Labels + accessible names ( `aria-label` only when no visible label works)
- Keyboard: all flows operable via keyboard, visible focus, no traps
- Focus placement + restoration (dialogs, toasts, route changes)
- State communication: `aria-live`, `aria-expanded`, `aria-invalid` + error text
- Forms: errors announced, field associated via `aria-describedby`
- Dialogs/menus: focus trap, ESC to close, return focus on close
- Reduced motion: respects `prefers-reduced-motion`
- Contrast (4.5:1 text, 3:1 large) + zoom 200% no loss
- `axe` automated scan + manual keyboard pass

## Tooling

- `axe-core` / `@axe-core/playwright` in E2E
- Playwright with viewport 1280 and 375

**Improvement:** original listed a11y items across multiple sections; consolidated into one checkable standard that `a11y-auditor` agent can load narrowly.
