# Vakratund Construction

First version of the Chakan site. Static Astro pages, a small desk for the copy, and three intake forms. The host is the same shape as the Dinymeo site: Azure Static Web Apps, Free SKU only, GitHub Actions.

The public name is **Vakratund**. The domain is `vakrtundconstruction.com`.

## Run

```bash
npm install
npm run dev:full
```

http://127.0.0.1:4322

The desk password on this machine is `vakratund-dev` (see `.env.example`).

| Script | What it does |
|---|---|
| `npm run dev` | Site only |
| `npm run dev:full` | Site and the local `/api` |
| `npm test` | Unit tests, including the content mirror |
| `npm run test:e2e` | Browser pass against the dev server |
| `npm run build` | `dist/` and a fresh `api/content` copy |

## What is already on the site

- Home, work, plant and tools, process, clients, resources, identity, contact, client onboarding, site-visit booking, privacy, desk.
- Mark and roads poster from the September 2026 files. Work photographs from the previous repository, recompressed.
- Services, office, and phone from the 19 Sep 2026 note. History, plant counts, and clients from the company profile.

## Three ways to change it

1. **Git.** Edit `src/content/*.json`, run `npm run build` (this refreshes `api/content`), push. This is what goes live.
2. **Desk.** `/admin` on a machine running `dev:full`. It writes the same JSON. The live Free host will not write files.
3. **Forms.** A visit, a client identity, or a note. Stored in `.data/` locally, or as a private GitHub issue when `ENQUIRY_GITHUB_TOKEN` and `GITHUB_REPO` are set. These do not edit the public pages.

Call, WhatsApp, and email are links. The visit form also raises a browser notification and offers a calendar file. It does not send SMS.

## Where it is published

GitHub Pages, until the domain DNS is pointed:

https://vakrtundconstruction.com

Wix only keeps the domain registration. It does not host the site, and it does not need a plugin. DNS notes are in [docs/wix.md](docs/wix.md).

The desk (`/admin`) edits words, plant counts, clients, projects, and files. It does not receive bookings. Bookings are the public forms. Save works only on a computer running `npm run dev:full`. GitHub Pages shows the last published build and cannot save from the browser.

## Next files

Drop drawings, rates, or new photographs in `resources/` and say what they are. A photograph becomes a project image only after it is compressed into `public/media` and named from the desk. Counts, clients, and sentences stay tied to a document — see [docs/sources.md](docs/sources.md).

Azure steps: [docs/azure.md](docs/azure.md).
