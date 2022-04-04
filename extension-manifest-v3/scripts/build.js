import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { build } from 'vite';
import shelljs from 'shelljs';

const pwd = process.cwd();

const options = {
  srcDir: resolve(pwd, 'src'),
  outDir: resolve(pwd, 'dist'),
  assets: ['_locales', 'assets', 'vendor/@whotracksme/ui/src/images'],
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
  root: process.cwd(),
  plugins: [
    // Required for disabling module preload feature
    {
      name: 'remove-vite-build-import-analysis',
      enforce: 'pre',
      options: (options) => {
        options.plugins = options.plugins.filter(
          (p) => p.name !== 'vite:build-import-analysis',
        );
        return options;
      },
    },
    // Required for cleaning up scripts tag generation in html files
    {
      name: 'clean-imports-for-html-generation',
      generateBundle(options, bundle) {
        Object.values(bundle).forEach((chunk) => {
          if (
            chunk.type === 'chunk' &&
            !chunk.isEntry &&
            !chunk.facadeModuleId?.endsWith('.html') &&
            chunk.imports &&
            chunk.imports.length
          ) {
            chunk.imports = [];
          }
        });
      },
    },
    // Required for correct html assets path because of the root dir
    {
      name: 'clean-html-src-path',
      enforce: 'post',
      generateBundle: (options, bundle) => {
        Object.values(bundle).forEach((chunk) => {
          if (
            chunk.type === 'asset' &&
            chunk.fileName.endsWith('.html') &&
            !chunk.fileName.includes('node_modules')
          ) {
            chunk.fileName = chunk.fileName.replace('src/', '');
          }
        });
      },
    },
  ],
  resolve: {
    preserveSymlinks: true,
    alias: [
      { find: '/hybrids.js', replacement: 'hybrids' },
      { find: '/vendor', replacement: '/src/vendor' },
    ],
  },
  build: {
    outDir: options.outDir,
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
    acc[src] = src.startsWith('node_modules')
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
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId.endsWith('.css')) {
            return 'common/[name].css';
          }
          if (chunkInfo.isEntry) {
            return chunkInfo.facadeModuleId.replace(/^.*\//, '');
          }
          return '[name].js';
        },
        assetFileNames: (chunkInfo) => {
          return chunkInfo.name.includes('/') && chunkInfo.name.endsWith('.css')
            ? chunkInfo.name.replace('.css', '')
            : 'assets/[name].[ext]';
        },
      },
    },
  },
});

// --- Build content scripts ---

for (const [id, path] of Object.entries(mapPaths(content_scripts))) {
  await build({
    ...config,
    build: {
      ...config.build,
      target: 'esnext',
      rollupOptions: {
        input: { [id]: path },
        output: {
          format: path.endsWith('.css') ? 'es' : 'iife',
          dir: options.outDir,
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.facadeModuleId.endsWith('.css')) {
              return 'common/[name].css';
            }
            if (chunkInfo.isEntry) {
              return chunkInfo.facadeModuleId
                .replace(options.srcDir, '')
                .replace(config.root, '')
                .replace(/^\//, '');
            }
            return '[name].js';
          },
          assetFileNames: (chunkInfo) => {
            return chunkInfo.name.includes('/') &&
              chunkInfo.name.endsWith('.css')
              ? chunkInfo.name.replace('.css', '')
              : 'assets/[name].[ext]';
          },
        },
      },
    },
  });
}
