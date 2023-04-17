import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import { build } from 'vite';
import shelljs from 'shelljs';
import webExt from 'web-ext';

const pwd = process.cwd();

const options = {
  srcDir: resolve(pwd, 'src'),
  outDir: resolve(pwd, 'dist'),
  assets: ['_locales', 'assets'],
};

const TARGET_TO_MANIFEST_MAP = {
  chrome: 'chromium',
  opera: 'chromium',
  edge: 'chromium',
  firefox: 'firefox',
  safari: 'safari',
};

// Generate arguments from command line
const argv = process.argv.slice(2).reduce(
  (acc, arg) => {
    if (arg.startsWith('--')) {
      acc[arg.slice(2)] = true;
    } else {
      acc.target = arg;
    }
    return acc;
  },
  { target: 'chrome' },
);

const pkg = JSON.parse(readFileSync(resolve(pwd, 'package.json'), 'utf8'));
const manifest = JSON.parse(
  readFileSync(
    resolve(
      options.srcDir,
      `manifest.${TARGET_TO_MANIFEST_MAP[argv.target]}.json`,
    ),
    'utf8',
  ),
);

const config = {
  configFile: false,
  root: options.srcDir,
  resolve: {
    preserveSymlinks: true,
  },
  define: { __PLATFORM__: JSON.stringify(argv.target) },
  build: {
    outDir: options.outDir,
    assetsDir: '',
    emptyOutDir: false,
    minify: false,
    modulePreload: {
      polyfill: false,
    },
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

// copy adblocker engines
shelljs.mkdir('-p', resolve(options.outDir, 'rule_resources'));

const engines = ['ads', 'tracking', 'annoyances'];
const engineType = argv.target === 'firefox' ? '' : '-cosmetics';

engines.forEach((engine) => {
  const path = `engine-${engine}${engineType}.bytes`;
  shelljs.cp(
    resolve(options.srcDir, 'rule_resources', path),
    resolve(options.outDir, 'rule_resources'),
  );
});

// copy trackerdb engine
shelljs.cp(
  resolve(options.srcDir, 'rule_resources', 'engine-trackerdb.bytes'),
  resolve(options.outDir, 'rule_resources'),
);

// generate license file
import('../../tools/licenses.js');

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
if (manifest.options_ui?.page) {
  source.push(manifest.options_ui?.page);
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

const buildPromise = build({
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
    shelljs.cp(
      path.replace('node_modules', '../node_modules'),
      resolve(options.outDir, id),
    );
  } else {
    // build content scripts
    build({
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

if (argv.watch) {
  buildPromise.then((watchEmitter) =>
    watchEmitter.on('event', function callback(e) {
      if (e.code === 'BUNDLE_END') {
        watchEmitter.off('event', callback);

        let settings;
        switch (argv.target) {
          case 'safari':
            exec('xed xcode');
            return;
          case 'firefox':
            settings = {
              target: 'firefox-desktop',
              firefoxBinary:
                '/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin',
            };
            break;
          case 'opera':
            settings = {
              target: 'chromium',
              chromiumBinary: '/Applications/Opera.app/Contents/MacOS/Opera',
            };
            break;
          case 'edge':
            settings = {
              target: 'chromium',
              chromiumBinary:
                '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
            };
            break;
          default:
            settings = { target: 'chromium' };
            break;
        }

        webExt.cmd.run({
          ...settings,
          noReload: true,
          sourceDir: options.outDir,
        });
      }
    }),
  );
}
