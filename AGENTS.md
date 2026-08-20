# agentic-dev — Agent Instructions (for developing this repo itself)

This `AGENTS.md` governs **work inside `agentic-dev`**. The `variants/*/AGENTS.md` files govern target projects after copy.

## Rules for agents working in agentic-dev

1. **File-only, project-local**: Never write to `~/.muse`, `~/.config`, `~/.agents`, `~/.gitconfig`. All output stays under `~/git-repositories/agentic-dev` (allowed) or a target dir passed to `scripts/copy.mjs`. The copier itself enforces this invariant with `assertNotGlobalPath()`.

2. **Variants are the product**: Source of truth is `variants/_shared` + `variants/<stack>`. Add a variant by copying a folder, not by branching or suffixing files.

3. **Copy semantics** (see `scripts/copy.mjs`):
   - Missing → copy
   - Same → skip
   - `AGENTS.md` / `CLAUDE.md` / `.gitignore` differs → merge/patch wrapped with `<!-- agentic-dev:<variant>:start -->` … `<!-- agentic-dev:end -->`, idempotent
   - Other differs → WARN + skip unless `--force`

4. **No web baseline here**: Don't add `package.json` dependencies for Next.js / Expo. This repo is an **agent pack** only. Web apps consume it via `node scripts/copy.mjs --variant=web <target>`.

5. **Personal git**: Repo lives under `~/git-repositories/` → `includeIf gitdir:~/git-repositories/` picks `JohnPevien <johnpevien.dev@gmail.com>`. Verify with `git config user.email`.

6. **Test the copier locally** before committing:
   ```bash
   node --check scripts/copy.mjs
   node scripts/copy.mjs --variant=web /tmp/test-web --dry-run
   node scripts/copy.mjs --variant=web /tmp/test-web && cat /tmp/test-web/AGENTS.md
   # re-run should be idempotent (no duplicate tag)
   node scripts/copy.mjs --variant=web /tmp/test-web && grep -c "agentic-dev:web:start" /tmp/test-web/AGENTS.md # → 1
   ```
