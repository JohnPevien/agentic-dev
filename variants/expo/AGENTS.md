# Expo Variant — agentic-dev

Expo-mobile agent rules. Merged on top of `_shared` when `--variant=expo`.

- Expo / React Native conventions: file-based routing, EAS Build/Submit, native modules handled via Expo config plugins. Keep config project-local (`app.json` / `app.config.js`).
- Two-instance relay pipeline. See `.agentic-dev/orchestration.md` for the full protocol, tier map, and handoffs.
- Role identity files at `.agentic-dev/roles/<role>.md` — paste into your harness instance.
- Reference docs at `.agentic-dev/reference/` (`quality-gates.md`, `testing-strategy.md`, `architecture.md`).
- Keep agent config project-local, same merge tag per README (expo variant).

> Source: `agentic-dev/variants/expo/AGENTS.md` • variant=expo