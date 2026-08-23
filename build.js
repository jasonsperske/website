// Asset pipeline: replaces gulpfile.js.
//
//   node build.js            build js + css + fonts into static/
//   node build.js --watch    same, then rebuild whenever src/ changes
import { mkdir, writeFile, cp } from 'node:fs/promises';
import { watch } from 'node:fs';
import * as esbuild from 'esbuild';
import * as sass from 'sass';

const JS_ENTRY = 'src/js/sperske.js';
const JS_OUT = 'static/js/sperske.min.js';
const CSS_ENTRY = 'src/css/sperske.scss';
const CSS_OUT = 'static/css/sperske.min.css';
const FONTS_SRC = 'node_modules/font-awesome/fonts';
const FONTS_OUT = 'static/fonts';

async function javascript() {
  await esbuild.build({
    entryPoints: [JS_ENTRY],
    outfile: JS_OUT,
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2018'],
    legalComments: 'none',
    logLevel: 'warning',
  });
  console.log(`built ${JS_OUT}`);
}

async function css() {
  const { css } = sass.compile(CSS_ENTRY, {
    loadPaths: ['.', 'node_modules'],
    quietDeps: true,
    // bootstrap 4 and font-awesome 4 predate the sass module system.
    silenceDeprecations: ['import', 'global-builtin', 'slash-div', 'color-functions', 'abs-percent'],
  });
  const { code } = await esbuild.transform(css, { loader: 'css', minify: true });
  await mkdir('static/css', { recursive: true });
  await writeFile(CSS_OUT, code, 'utf8');
  console.log(`built ${CSS_OUT}`);
}

async function fonts() {
  await mkdir(FONTS_OUT, { recursive: true });
  await cp(FONTS_SRC, FONTS_OUT, { recursive: true });
  console.log(`copied ${FONTS_OUT}`);
}

export async function buildAssets() {
  await javascript();
  await css();
  await fonts();
}

export function watchAssets() {
  let timer = null;
  let running = false;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) return;
      running = true;
      try {
        await buildAssets();
      } catch (e) {
        console.error(e.message);
      } finally {
        running = false;
      }
    }, 100);
  };
  watch('src', { recursive: true }, rebuild);
  console.log('watching src/ for changes');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildAssets();
  if (process.argv.includes('--watch')) watchAssets();
}
