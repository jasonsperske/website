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
async function init(app, base, onReady, layout) {
  const is_root = !!onReady;

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
      await init(app, path.join(base, file.name), undefined, layout);
    } else if(file.isFile) {
      if (file.name === 'index') {
        if (hasParam(base)) {
          app.get(`/${base.replace('/_id', '/:id')}`, async (req, res) => {
            const data = JSON.parse(
              await readFile(
                path.join('data', base.replace('/_id', `/${req.params.id}`), 'index.json'),
                'utf-8'));
            data.layout = layout;
            res.render(path.join(base, file.name), data);
          });
        } else {
          app.get(`/${base}`, async (req, res) => {
            const data = JSON.parse(
              await readFile(
                path.join('data', base, 'index.json'),
                'utf-8'));
            data.layout = layout;
            res.render(path.join(base, file.name), data);
          });
        }
      }
    } else {
      throw new Error(`Found object that isn't a file or a directory: ${f.name}`);
    }
  }

  if(is_root) {
    onReady();
  }
}

init(app, '', () => {
  app.listen(port, () => {
    console.log(`Server started at http://0.0.0.0:${port}`);
  });
});
