const got = require('got');
const path = require('path');
const fs = require('fs').promises;
const fse = require('fs-extra');
const content_host = process.env.content_host || 'http://127.0.0.1:3000'

async function loadJSON(file, resource) {
  try {
    return JSON.parse(await fs.readFile(path.join('data', file, resource), 'utf-8'));
  } catch (e) {}
  return {};
}

async function loadSiteMap(file) {
  try {
    return JSON.parse(await fs.readFile(path.join('data', file, 'sitemap.json'), 'utf-8'));
  } catch (e) {}
  return {};
}

async function capture(root) {
  try {
    await fs.mkdir(`./build${root}`);
  } catch (_) {}
  try {
    const index = await got(`${content_host}${root}`);
    await fs.writeFile(`./build${root}index.html`, index.body, 'utf8');
    console.log(`compiled ${root}index.html`);
  } catch (_) {}
  try {
    const index_json = await got(`${content_host}${root}index.json`);
    await fs.writeFile(`./build${root}index.json`, index_json.body, 'utf8');
    console.log(`compiled ${root}index.json`);
  } catch (_) {}
}

async function index(root) {
  const sitemap = await loadSiteMap(root);
  if (sitemap.hasIndex) {
    await capture(root)
  }

  if(sitemap.collections) {
    for(const collection of sitemap.collections) {
      if(typeof collection === 'string') {
        try {
          await fs.mkdir(`./build${root}${collection}`);
        } catch (_) {}
        await index(`${root}${collection}\\`);
      } else if(typeof collection === 'object') {
        const resource = await loadJSON(`${root}`, collection.resource);
        const data = resource[collection.key];
        if (collection.type === 'array<map>') {
          for(const key of Object.keys(data)) {
            await capture(`${root}${data[key][collection.mapKey]}\\`);
          }
        } else if (collection.type === 'array<string>') {
          for(const key of data) {
            await capture(`${root}${key}\\`);
          }
        }
      }
    }
  }
}

(async () => {
  console.log(`Compiling content from ${content_host}`);
  await index('/');
  console.log('Completed compile');
  console.log('Copying static resoruces...');
  try {
    await fs.mkdir(`./build/static`);
  } catch (_) {}
  await fse.copy('static', 'build/static');
  console.log('Done!');
})();
