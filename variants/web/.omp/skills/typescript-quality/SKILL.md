---
name: typescript-quality
description: Minimal project-respecting TS quality — not a maximalist lint
---

# typescript-quality (project-local)

This is a **just-right** TS skill per critique: do not import arbitrary public TS skills that embed author-specific choices (shared tsconfig package, zero-any absolutism, mandatory return types, interface vs type wars).

Rules:

- Preserve project's `tsconfig` and lint conventions. Never weaken strictness to pass.
- Prefer `unknown` + narrowing over unsafe `any`. `any` requires `// why:` comment + issue link.
- No `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` without linked reason.
- Avoid unnecessary `as` casts and `!` non-null assertions; validate runtime data instead.
- Model invalid states out where practical.
- Validate untrusted runtime data (Zod/Yup/io-ts per project).
- Prefer inference for locals; explicitly type exported boundaries when stability matters.
- Keep public types intentional, implementation types local.
- Run project's typecheck before completion.

This skill is deliberately boring — it enforces what `docs/quality-gates.md` checks, not a maximalist style.
