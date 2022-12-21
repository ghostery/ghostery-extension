import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { build } from 'vite';
import shelljs from 'shelljs';

const pwd = process.cwd();

const options = {
  srcDir: resolve(pwd, 'src'),
  outDir: resolve(pwd, 'dist'),
  assets: ['_locales', 'assets'],
};

// Generate arguments from command line
const argv = process.argv.slice(2).reduce((acc, arg, index, arr) => {
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    const value = arr[index + 1];
    acc[key] = !value || value.startsWith('--') ? true : value;
  }
  return acc;
}, {});

const pkg = JSON.parse(readFileSync(resolve(pwd, 'package.json'), 'utf8'));
const manifest = JSON.parse(
  readFileSync(
    resolve(options.srcDir, `manifest.${argv.target || 'chromium'}.json`),
    'utf8',
  ),
);

const config = {
  configFile: false,
  root: options.srcDir,
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    outDir: options.outDir,
    assetsDir: '',
    emptyOutDir: false,
    minify: false,
    polyfillModulePreload: false,
    watch: argv.watch ? {} : null,
  },
};

// --- Generate dist structure ---

// generate dist folder
shelljs.rm('-rf', options.outDir);
shelljs.mkdir('-p', options.outDir);

// copy static assets
options.assets.forEach((path) => {
  shelljs.mkdir('-p', resolve(options.outDir, path));
  shelljs.cp(
    '-r',
    resolve(options.srcDir, path, '*'),
    resolve(options.outDir, path),
  );
});

// --- Save manifest ---

// set manifest version from package.json
manifest.version = pkg.version;

writeFileSync(
  resolve(options.outDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
);

// --- Generate entry points ---

const source = [];
const content_scripts = [];

if (manifest.action?.default_popup) {
  source.push(manifest.action.default_popup);
}

if (manifest.browser_action?.default_popup) {
  source.push(manifest.browser_action.default_popup);
}

// options page
if (manifest.options_page) {
  source.push(manifest.options_page);
}

// content scripts
manifest.content_scripts?.forEach(({ js = [], css = [] }) => {
  [...js, ...css].forEach((src) => content_scripts.push(src));
});

// web-accessible resources
manifest.web_accessible_resources?.forEach((entry) => {
  const paths = [];

  if (typeof entry === 'string') {
    paths.push(entry);
  } else {
    entry.resources.forEach((src) => paths.push(src));
  }

  paths.forEach((path) => {
    if (!path.match(/\.(js|css|html)$/)) {
      const dir = dirname(path);
      shelljs.mkdir('-p', resolve(options.outDir, dir));
      shelljs.cp('', path, resolve(options.outDir, dir));
    } else {
      source.push(path);
    }
  });
});

// declarative net request
if (manifest.declarative_net_request?.rule_resources) {
  manifest.declarative_net_request.rule_resources.forEach(({ path }) => {
    const dir = dirname(path);
    shelljs.mkdir('-p', resolve(options.outDir, dir));
    shelljs.cp(resolve(options.srcDir, path), resolve(options.outDir, dir));
  });
}

// background
if (manifest.background) {
  source.push(manifest.background.service_worker || manifest.background.page);
}

// --- Build  ---

function mapPaths(paths) {
  return paths.reduce((acc, src) => {
    acc[src.replace(/\.js/, '')] = src.startsWith('node_modules')
      ? resolve(src)
      : resolve(options.srcDir, src);
    return acc;
  }, {});
}

await build({
  ...config,
  build: {
    ...config.build,
    target: 'esnext',
    rollupOptions: {
      input: mapPaths(source),
      preserveEntrySignatures: 'exports-only',
      output: {
        dir: options.outDir,
        manualChunks: false,
        preserveModules: true,
        preserveModulesRoot: 'src',
        minifyInternalExports: false,
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});

// --- Build content scripts ---

for (const [id, path] of Object.entries(mapPaths(content_scripts))) {
  // Copy assets
  if (!path.endsWith('.js')) {
    shelljs.mkdir(
      '-p',
      resolve(options.outDir, id.split('/').slice(0, -1).join('/')),
    );
    shelljs.cp(path, resolve(options.outDir, id));
  } else {
    // build content scripts
    await build({
      ...config,
      build: {
        ...config.build,
        target: 'esnext',
        rollupOptions: {
          input: { [id]: path },
          output: {
            format: 'iife',
            dir: options.outDir,
            entryFileNames: '[name].js',
          },
        },
      },
    });
  }
}
