const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const port = process.env.port || 3000;

app.set('view engine', 'ejs');
app.use(require('express-ejs-layouts'));

function hasParam(base) {
  return base.endsWith('/_id')
}

function getURLPattern(base) {
  if (hasParam(base)) {
    return `/${base.replace('/_id', '/:id')}`;
  } else {
    return `/${base}`;
  }
}

function getDataPath(base, req) {
  let dataPath = base;
  Object.keys(req.params).forEach(param => {
    dataPath = dataPath.replace(`/_${param}`, `/${req.params[param]}`);
  });
  return dataPath;
}

async function loadJSONdata(file, extraData) {
  let data = {};
  try {
    data = JSON.parse(await readFile(path.join('data', file, 'index.json'), 'utf-8'));
  } catch (e) {}
  return Object.assign(data, extraData);
}

async function init(app, base, layout) {
  const files = await (async () => {
    const files = await readdir(path.join('views', base));
    return Promise.all(files.map(async (name) => {
      const stats = await stat(path.join('views', base, name));
      const parsedName = path.parse(name);
      return {
        name: parsedName.name,
        ext: parsedName.ext,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      };
    }));
  })();

  const layouts = files.filter(f => f.isFile && f.name === 'layout');
  if(layouts.length === 1) {
    layout = path.join(base, layouts[0].name);
  }

  if(!layout) {
    throw new Error(`Layout not found in '${path.join('views', base)}'`);
  }

  for(const file of files) {
    if(file.isDirectory) {
      await init(app, path.join(base, file.name), layout);
    } else if(file.isFile) {
      if (file.name === 'index') {
        app.get(getURLPattern(base), async (req, res) => {
          const data = await loadJSONdata(
            getDataPath(base, req),
            { layout });
          res.render(path.join(base, file.name), data);
        });
      }
    } else {
      throw new Error(`Found object that isn't a file or a directory: ${f.name}`);
    }
  }

  return this;
}

init(app, '').then(() => {
  app.listen(port, () => {
    console.log(`Server started at http://0.0.0.0:${port}`);
  });
});
