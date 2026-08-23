// Shared site model: turns the views/ tree into a route table and renders a
// route against the matching folder in data/.
//
// Both local.js (live editing) and compile.js (static build) go through here,
// so the compiled output is byte-for-byte what the dev server serves.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import ejs from 'ejs';

export const VIEWS_DIR = 'views';
export const DATA_DIR = 'data';

/**
 * Walk views/ and collect one route per index.ejs.
 *
 * A directory named `_id` is a parameter segment (`/wad/_id` -> `/wad/:id`).
 * `layout.ejs` applies to its own directory and is inherited by children.
 */
export async function discoverRoutes(base = '', inheritedLayout = null, routes = []) {
  const entries = await readdir(path.join(VIEWS_DIR, base), { withFileTypes: true });

  const layoutEntry = entries.find((e) => e.isFile() && path.parse(e.name).name === 'layout');
  const layout = layoutEntry ? path.join(base, 'layout') : inheritedLayout;
  if (!layout) {
    throw new Error(`Layout not found in '${path.join(VIEWS_DIR, base)}'`);
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      await discoverRoutes(path.join(base, entry.name), layout, routes);
    } else if (entry.isFile()) {
      if (path.parse(entry.name).name === 'index') {
        const segments = base === '' ? [] : base.split(path.sep);
        routes.push({
          base,
          layout,
          view: path.join(base, 'index'),
          segments,
          params: segments.filter((s) => s.startsWith('_')).map((s) => s.slice(1)),
          urlPattern: '/' + segments.map((s) => (s.startsWith('_') ? `:${s.slice(1)}` : s)).join('/'),
        });
      }
    } else {
      throw new Error(`Found object that isn't a file or a directory: ${entry.name}`);
    }
  }

  // Literal routes win over parameterised ones at the same depth.
  routes.sort((a, b) => a.params.length - b.params.length || a.base.localeCompare(b.base));
  return routes;
}

/** Split a request path into segments, noting whether index.json was asked for. */
export function parseUrl(urlPath) {
  let rest = urlPath.replace(/^\/+/, '').replace(/\/+$/, '');
  let json = false;
  if (rest === 'index.json') {
    json = true;
    rest = '';
  } else if (rest.endsWith('/index.json')) {
    json = true;
    rest = rest.slice(0, -'/index.json'.length);
  }
  const segments = rest === '' ? [] : rest.split('/').map(decodeURIComponent);
  return { segments, json };
}

/** Find the route serving `urlPath`, or null. */
export function matchRoute(routes, urlPath) {
  const { segments, json } = parseUrl(urlPath);

  for (const route of routes) {
    if (route.segments.length !== segments.length) continue;
    const params = {};
    let matched = true;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = route.segments[i];
      if (segment.startsWith('_')) {
        params[segment.slice(1)] = segments[i];
      } else if (segment !== segments[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params, json };
  }
  return null;
}

/** The folder under data/ backing a route once its params are filled in. */
export function dataPathFor(route, params = {}) {
  return route.segments
    .map((segment) => (segment.startsWith('_') ? params[segment.slice(1)] : segment))
    .join('/');
}

/** Read data/<dataPath>/index.json, or {} when there is none. */
export async function loadData(dataPath) {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, dataPath, 'index.json'), 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Render a route to { html, json }.
 *
 * `json` is the raw data document (what /index.json used to return) and `html`
 * is the view rendered into its layout — the job express-ejs-layouts used to do.
 */
export async function renderPage(route, params = {}, { cache = true } = {}) {
  const dataPath = dataPathFor(route, params);
  const data = await loadData(dataPath);
  const locals = { ...data, dataPath, layout: route.layout };
  const options = { cache, root: VIEWS_DIR };

  const body = await ejs.renderFile(path.join(VIEWS_DIR, `${route.view}.ejs`), locals, options);
  const html = await ejs.renderFile(
    path.join(VIEWS_DIR, `${route.layout}.ejs`),
    { ...locals, body },
    options
  );

  return { html, json: data };
}
