import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify as minifyHtml } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = __dirname;
const distDir = resolve(rootDir, 'dist');

async function ensureDist() {
  await mkdir(distDir, { recursive: true });
}

async function buildScript() {
  await esbuild.build({
    entryPoints: [resolve(rootDir, 'script.js')],
    outfile: resolve(distDir, 'script.js'),
    bundle: false,
    minify: true,
    format: 'iife',
    target: ['es2018'],
    sourcemap: true,
    legalComments: 'none'
  });
}

async function buildStyles() {
  const cssPath = resolve(rootDir, 'style.css');
  const cssRaw = await readFile(cssPath, 'utf8');
  const cleaner = new CleanCSS({
    level: {
      1: { specialComments: 0 },
      2: { restructureRules: true }
    }
  });
  const { styles, errors, warnings } = cleaner.minify(cssRaw);
  if (errors.length) {
    console.error('CSS minification errors:\n', errors.join('\n'));
    throw new Error('CSS minification failed');
  }
  if (warnings.length) {
    console.warn('CSS minification warnings:\n', warnings.join('\n'));
  }
  await writeFile(resolve(distDir, 'style.css'), styles, 'utf8');
}

async function minifyHtmlFile(source, destination) {
  const htmlRaw = await readFile(resolve(rootDir, source), 'utf8');
  const minified = await minifyHtml(htmlRaw, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
    keepClosingSlash: true,
    sortClassName: false
  });
  await writeFile(resolve(distDir, destination), minified, 'utf8');
}

async function copyStaticFiles() {
  const assets = [
    'favicon.svg',
    'og-image.jpg',
    '_headers',
    'robots.txt',
    'sitemap.xml'
  ];

  for (const asset of assets) {
    const sourcePath = resolve(rootDir, asset);
    try {
      await copyFile(sourcePath, resolve(distDir, asset));
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.warn(`Aviso: ${asset} no se encontró. Continúo.`);
        continue;
      }
      throw err;
    }
  }
}

async function build() {
  console.log('Creando carpeta dist...');
  await ensureDist();

  console.log('Minificando JavaScript...');
  await buildScript();

  console.log('Minificando CSS...');
  await buildStyles();

  console.log('Minificando HTML principal...');
  await minifyHtmlFile('index.html', 'index.html');

  try {
    console.log('Minificando página secundaria 2027.html...');
    await minifyHtmlFile('2027.html', '2027.html');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn('Aviso: 2027.html no se encontró, omito minificación.');
    } else {
      throw err;
    }
  }

  console.log('Copiando archivos estáticos...');
  await copyStaticFiles();

  console.log('Build finalizado. Archivos en dist/.');
}

build().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
