# CLAUDE.md — agentic-dev (project-local, not global)

This file is **project-local** to `~/git-repositories/agentic-dev`. Do not copy it to `~/.muse` or `~/.config`. Target projects receive their own `CLAUDE.md` from `variants/_shared/CLAUDE.md` + `variants/<stack>/CLAUDE.md` via `scripts/copy.mjs`.

## For Muse working in this repo

- Stack: file-only agent pack, Node `scripts/copy.mjs`. No web app, no build step.
- Variants: `variants/_shared` (always) + `variants/<variant>` (e.g. `web`, `expo`). To add a variant, duplicate a folder, edit, no code change.
- Copier semantics: `AGENTS.md` / `CLAUDE.md` are **merged** with HTML comment tag `<!-- agentic-dev:<variant>:start -->` … `<!-- agentic-dev:end -->` (idempotent). Other files skip unless `--force`.
- Never write outside target dir. Guard helper `assertNotGlobalPath()` in `scripts/copy.mjs` must stay.
- Verify locally after edits:

```bash
node --check scripts/copy.mjs
node scripts/copy.mjs --variant=web /tmp/test-web --dry-run
rm -rf /tmp/test-web && node scripts/copy.mjs --variant=web /tmp/test-web
grep -c "agentic-dev:web:start" /tmp/test-web/AGENTS.md  # → 1
node scripts/copy.mjs --variant=web /tmp/test-web          # re-run idempotent
grep -c "agentic-dev:web:start" /tmp/test-web/AGENTS.md  # → still 1
```
