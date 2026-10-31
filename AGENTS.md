# AGENTS.md

This file provides guidance to coding agents (Claude Code and others) when working with code in this repository.

## Project

Website of AGM² (Analytical and Geometric Methods for Microstructure), built
with Astro and deployed to GitHub Pages at `agm-2.github.io`. AGM² is an
umbrella name: a notice board (news, papers, events, job openings, a monthly
digest) for people who work on these topics. It is not a group, a project or
a grant. Build internal links from `import.meta.env.BASE_URL` (exported as
`base` from `src/lib/site.ts`), not hardcoded absolute paths.

## Writing style

- Impersonal copy: no personal names, no "we/our/us", nothing that makes the
  site look like one person's or one group's. The contact is the address in
  `src/data/site.json`.
- British spelling, as in the digest (organise, behaviour, colour). Official
  names keep their own spelling (e.g. a conference titled "Modeling").
- Spell the name `AGM²` (superscript two) and the newsletter `AGM² Digest`.

## Commands

```sh
npm install                # install deps
npm run build              # production build to ./dist/
npm run preview            # preview the production build locally
npm run astro -- check     # type-check .astro/.ts files
```

There is no test suite or linter. Start the dev server with
`astro dev --background` and manage it with `astro dev stop|status|logs`.

## Architecture

- The look copies the digest email (`../mail_list/template/style.css`):
  monospace, boxes with a thin border, blue links without underline. All
  colours are custom properties in `src/styles/global.css`; the dark variant
  only redefines them under `prefers-color-scheme: dark`.
- `src/layouts/Base.astro` is the shell of every page (head, masthead with the
  navigation, footer).
- `src/content.config.ts` defines two collections:
  - `digest`: one JSON file per issue in `src/content/digest/`, written by
    `tools/publish.py` in the mailing list repo (run by `make send` and
    `make publish` there), together with `public/digest/<YYYY-MM>/` (PDF and
    images). Never edit these by hand: the JSON holds HTML rendered by the
    email's own Markdown pipeline. If you change its shape, change
    `publish.py` and the schema together.
  - `events`: `src/data/events.json`, edited by hand. Dates are `YYYY-MM-DD`,
    or `YYYY-MM` while the days are not known; date logic (`dateRange`,
    `isUpcoming`, `hasExactDays`) lives in `src/lib/site.ts`.
- `src/components/IssueBody.astro` lays out an issue like the email (intro,
  "In this issue", one box per section) and points relative image paths at
  `public/digest/<YYYY-MM>/`.
- `src/pages/events/[id].ics.ts` writes one calendar file per event whose days
  are known. Its
  `DTSTAMP`/`SEQUENCE` are fixed so rebuilds are byte-identical; bump them by
  hand when an event's dates change.
- Upcoming/past is decided at build time (`today` in `src/lib/site.ts`); the
  deploy workflow also runs weekly for that reason.
- `.github/workflows/deploy.yml` builds with `withastro/action` on push to
  `main` and deploys via `actions/deploy-pages`.
