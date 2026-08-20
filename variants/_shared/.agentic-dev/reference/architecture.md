# Architecture Template

Copy to `.agentic-dev/reference/architecture.md` in each target project and fill. Keep it short — agents load it on demand (lazy reference).

```md
# Stack

- Next.js 16 App Router / or Vite + React 19
- TypeScript strict
- Tailwind CSS 4 + shadcn/ui (Radix)
- Form handling: [Formik+Yup / RHF+Zod / etc.]
- State: [Server Components default / Zustand / etc.]

# Directory map

- `src/app` — routes (Server Components by default)
- `src/features/<feature>` — feature slices
- `src/lib/api` — API clients, generated types (do not edit manually)
- `src/components/ui` — shadcn primitives
- `src/lib/` — shared utilities

# Data flow

- Server Components fetch; Client Components at interactive boundaries only.
- API types are generated; do not modify `src/lib/api/generated`.

# Invariants

- Do not introduce [React Hook Form] if Formik+Yup is chosen (per-project restriction).
- Do not bypass generated types.
- Preserve analytics events in `src/lib/analytics`.

# Verification (project command map)

- `pnpm typecheck` (or `npm run typecheck`)
- `pnpm lint`
- `pnpm test` / `pnpm test:e2e`
- `pnpm build`

Agents read this file before planning. Global agents/tools do not duplicate these decisions.
```

**Improvement:** original `architecture.md` was implied but not templated; this makes per-project stack choices explicit and prevents agents from inventing framework assumptions. The `Verification` map stops global commands from hardcoding `pnpm lint && pnpm test`.