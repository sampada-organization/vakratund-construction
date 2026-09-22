# Vakratund Construction site

- Stack matches the Dinymeo site: Astro static, Azure Static Web Apps Free only, GitHub Actions. Do not add a paid SKU, database, or email gateway.
- Public facts come from the company profile, the September 2026 office note, and the previous site at github.com/dnyand33p/vakrtundConstruction. Do not invent certificates, turnover, staff counts, or project values. See `docs/sources.md`.
- The current office is The Grand Centre, Chakan. Phone `9960532729`. Do not put the old site number `9970099700` back.
- The name is Vakratund. The roads poster misspells it; do not adopt that spelling as the wordmark.
- Use the supplied mark at `public/brand/mark.jpg`. Do not redraw it.
- Content JSON lives in `src/content`. `npm run build` copies it to `api/content`, which the free host can read. Keep the two copies identical.
- Forms post to `/api/enquiry`, `/api/onboard`, and `/api/meeting`. Local API: `npm run dev:full` on port 4322. Desk password in dev: `vakratund-dev`.
