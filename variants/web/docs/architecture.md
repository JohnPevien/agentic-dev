# Architecture — web variant

Inherits `_shared/docs/architecture.md` template. Fill per project.

Example for web:

- Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui (Radix)
- Server Components by default; Client Components at `src/features/<f>/client.tsx`
- API clients in `src/lib/api` (generated, do not edit)
- Feature slices in `src/features/<feature>`

See `../../_shared/docs/architecture.md` for full template.
