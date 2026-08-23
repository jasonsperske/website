# website

[jason.sperske.com](https://jason.sperske.com) — a data-driven static site.

Content lives in `data/` as `index.json` documents, templates live in `views/`
as EJS, and `sitemap.json` files describe which pages exist. The same renderer
(`lib/site.js`) powers both the live-editing server and the static build, so
what you see locally is exactly what gets published.

## Getting started

```sh
nvm use            # or fnm use — matches .nvmrc, the version CI builds with
npm install
npm start          # build assets, then serve on http://127.0.0.1:3000
```

Edit anything under `data/` or `views/` and refresh — no restart needed, even
for brand new pages. Use `npm run dev` instead if you are also editing `src/`
and want the CSS/JS bundles rebuilt on save.

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Build `static/` assets, then run the local content server |
| `npm run dev` | Same server, plus an asset watcher on `src/` |
| `npm run assets` | Bundle `src/js` and `src/css` into `static/` (esbuild + sass) |
| `npm run assets:watch` | Asset bundling in watch mode |
| `npm run compile` | Render `data/` + `views/` into `build/` |
| `npm run build` | `assets` followed by `compile` — what CI runs |

## How a page is found

`views/` mirrors the URL structure. A directory named `_id` is a parameter, so
`views/wad/_id/index.ejs` serves `/wad/DOOM.WAD/` and reads its content from
`data/wad/DOOM.WAD/index.json`. A `layout.ejs` applies to its own directory and
is inherited by everything below it. Every page also publishes its raw document
at `index.json` alongside the HTML.

`npm run compile` walks the `sitemap.json` tree under `data/` to decide which
URLs to render:

- `hasIndex: true` — render this directory itself
- `collections: ["computer"]` — recurse into `data/computer/sitemap.json`
- a collection object — read `key` out of `resource` and render one page per
  entry, either `array<string>` (the value is the slug) or `array<map>` (the
  slug is `mapKey` of each item)

Pages that fail to render are skipped and listed at the end of the build rather
than breaking it.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which runs
`npm run build` and publishes `build/` to GitHub Pages. The custom domain comes
from the `CNAME` file at the repo root, which the compiler copies into `build/`
alongside a `.nojekyll` marker.

For the domain to resolve, `jason.sperske.com` needs a DNS `CNAME` record
pointing at `jasonsperske.github.io`, and Pages must be set to deploy from
"GitHub Actions" in the repository settings.
