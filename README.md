# agm-2.github.io

Website of AGM² (*Analytical and Geometric Methods for Microstructure*), a
notice board for people who work on these topics, published at
<https://agm-2.github.io>. It has an About page, every issue of the AGM²
Digest, and events. It looks like the digest email: same font, colours, boxes
and logo.

Built with [Astro](https://astro.build).

## Commands

```sh
npm install              # install dependencies
npm run dev              # dev server at http://localhost:4330
npm run build            # production build to ./dist/
npm run preview          # preview the production build
npm run astro -- check   # type-check .astro and .ts files
```

## Editing content

| What | Where |
| :--- | :---- |
| About text | `src/about.md` |
| Name, tagline, contact address, GitHub link | `src/data/site.json` |
| Events | `src/data/events.json` |
| Digest issues | written by the mailing list, see below; don't edit by hand |
| Colours and layout | `src/styles/global.css` (light, and dark under `prefers-color-scheme`) |

### Events

`src/data/events.json` is a list of events. Only `id`, `kind`, `title` and
`start` are required:

```json
{
  "id": "smectics-workshop-2027",
  "kind": "Workshop",
  "title": "Smectics and shells",
  "summary": "Two days of talks and discussion.",
  "start": "2027-03-11",
  "end": "2027-03-12",
  "venue": "Department of Mathematics, University of Pavia",
  "city": "Pavia, Italy",
  "url": "https://example.org/workshop",
  "links": [
    { "label": "Slides", "url": "https://example.org/slides.pdf" },
    { "label": "Recording", "url": "https://example.org/video" }
  ]
}
```

- `id` is used in the calendar file name (`/events/<id>.ics`) and as the event's
  anchor on `/events/`, so keep it stable once published.
- `kind` is free text: `Workshop`, `Talk`, `Minisymposium`, `Seminar`, ...
- `end` defaults to `start` for one-day events.
- While the days are not known, give just the month: `"start": "2027-09"`
  shows as "September 2027", with no calendar file until full dates are set.
- `url` and the `links` can be full URLs or paths on this site (put files in
  `public/`, e.g. `public/material/slides.pdf` → `"material/slides.pdf"`).
- Events whose last day has passed move to "Past" at the next build. The site
  is rebuilt on every push and once a week (Monday morning).
- If an event's dates change, bump `DTSTAMP` and `SEQUENCE` in
  `src/pages/events/[id].ics.ts` so calendars pick up the change.

### Digest issues

Issues come from the mailing list repo (`AGM-2/mailing_list`, checked out next
to this one as `../mail_list`). When an issue is sent with `make send` there,
it runs `make publish`, which writes:

- `src/content/digest/<YYYY-MM>.json`: the issue rendered with the same code
  as the email;
- `public/digest/<YYYY-MM>/`: its PDF and images;

then commits only those files here and pushes `main`, which redeploys the site.
To change a published issue, fix it in the mailing list repo and run
`make publish` in its folder again.

## Deployment

Every push to `main` builds the site and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup: in the repository settings,
under **Pages**, set **Source** to **GitHub Actions**.
