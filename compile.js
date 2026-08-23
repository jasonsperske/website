// Static site compiler: walks the sitemap.json tree under data/ and writes the
// whole site to build/, ready to be published to GitHub Pages.
//
// Previously this scraped a running copy of local.js over HTTP. It now renders
// through the same lib/site.js module the server uses, so no server is needed.
import { mkdir, writeFile, readFile, rm, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { discoverRoutes, matchRoute, renderPage, DATA_DIR } from './lib/site.js';

const BUILD_DIR = 'build';

const problems = [];

async function loadJSON(file) {
  try {
    return JSON.parse(await readFile(file, 'utf-8'));
  } catch {
    return {};
  }
}

const loadSiteMap = (root) => loadJSON(path.join(DATA_DIR, root, 'sitemap.json'));
const loadResource = (root, resource) => loadJSON(path.join(DATA_DIR, root, resource));

/** Render one URL (e.g. `/wad/DOOM.WAD/`) to build/<url>/index.html + index.json. */
async function capture(routes, root) {
  const match = matchRoute(routes, root);
  if (!match) {
    problems.push(`${root} is in a sitemap but no view renders it`);
    return;
  }

  // A page that cannot render is skipped rather than failing the whole build,
  // which is how the old HTTP-scraping compiler behaved. The difference is that
  // it is now reported instead of swallowed.
  let rendered;
  try {
    rendered = await renderPage(match.route, match.params);
  } catch (err) {
    problems.push(`${root} failed to render: ${err.message.split('\n').pop().trim()}`);
    return;
  }

  const outDir = path.join(BUILD_DIR, root);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), rendered.html, 'utf8');
  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(rendered.json), 'utf8');
  console.log(`compiled ${root}`);
}

/** Recursively expand a sitemap.json into the URLs it describes. */
async function index(routes, root) {
  const sitemap = await loadSiteMap(root);

  if (sitemap.hasIndex) {
    await capture(routes, root);
  }

  for (const collection of sitemap.collections ?? []) {
    if (typeof collection === 'string') {
      await index(routes, `${root}${collection}/`);
    } else if (typeof collection === 'object') {
      const resource = await loadResource(root, collection.resource);
      const data = resource[collection.key] ?? [];
      if (collection.type === 'array<map>') {
        for (const item of Object.values(data)) {
          await capture(routes, `${root}${item[collection.mapKey]}/`);
        }
      } else if (collection.type === 'array<string>') {
        for (const key of data) {
          await capture(routes, `${root}${key}/`);
        }
      }
    }
  }
}

async function copyIfPresent(src, dest) {
  try {
    await access(src);
  } catch {
    return false;
  }
  await cp(src, dest, { recursive: true });
  return true;
}

await rm(BUILD_DIR, { recursive: true, force: true });
await mkdir(BUILD_DIR, { recursive: true });

console.log('Compiling content...');
await index(await discoverRoutes(), '/');
console.log('Completed compile');

console.log('Copying static resources...');
await cp('static', path.join(BUILD_DIR, 'static'), { recursive: true });

// GitHub Pages: serve the output verbatim and keep the custom domain.
await writeFile(path.join(BUILD_DIR, '.nojekyll'), '', 'utf8');
if (await copyIfPresent('CNAME', path.join(BUILD_DIR, 'CNAME'))) {
  console.log('Copied CNAME');
}

if (problems.length > 0) {
  console.warn(`\n${problems.length} page(s) skipped:`);
  for (const problem of problems) console.warn(`  - ${problem}`);
}

console.log('\nDone!');
