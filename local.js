// Local content server: renders views/ + data/ on every request so content can
// be edited live.
//
//   node local.js            serve on http://127.0.0.1:3000
//   node local.js --watch    also rebuild static/ assets when src/ changes
import express from 'express';
import { discoverRoutes, matchRoute, renderPage } from './lib/site.js';

const port = process.env.PORT || process.env.port || 3000;
const app = express();

app.use('/static', express.static('static'));

// The route table is rebuilt per request rather than registered up front, so
// adding a view or a data folder shows up on the next refresh without a restart.
app.use(async (req, res, next) => {
  try {
    const routes = await discoverRoutes();
    const match = matchRoute(routes, req.path);
    if (!match) return next();

    const { html, json } = await renderPage(match.route, match.params, { cache: false });
    if (match.json) return res.json(json);
    return res.type('html').send(html);
  } catch (err) {
    return next(err);
  }
});

app.listen(port, () => {
  console.log(`Server started at http://127.0.0.1:${port}`);
});

if (process.argv.includes('--watch')) {
  const { buildAssets, watchAssets } = await import('./build.js');
  await buildAssets();
  watchAssets();
}
