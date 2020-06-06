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
app.use('/static', express.static('static'));

function getParams(base) {
  let params = [];
  const regex = /\/_(\w*)/gm;
  let m;
  while ((m = regex.exec(base)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    m.forEach((match, groupIndex) => {
      if(groupIndex === 1) {
        params.push(match);
      }
    });
  }

  return params;
}

function getURLPattern(base) {
  let urlPattern = base.replace(/\\/g, '/');
  let params = getParams(urlPattern);
  if (params.length > 0) {
    for(const param of params) {
      urlPattern = urlPattern.replace(`/_${param}`, `/:${param}`)
    }
  }
  return `/${urlPattern}`;
}

function getDataPath(base, req) {
  let dataPath = base.replace(/\\/g, '/');
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
  const files = await
    Promise.all((await readdir(path.join('views', base))).map(async (name) => {
      const stats = await stat(path.join('views', base, name));
      const parsedName = path.parse(name);
      return {
        name: parsedName.name,
        ext: parsedName.ext,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      };
    }));

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
