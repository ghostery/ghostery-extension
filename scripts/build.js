/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { resolve, dirname, join, basename } from 'node:path';
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  mkdirSync,
  cpSync,
  existsSync,
} from 'node:fs';
import { exec, execSync } from 'node:child_process';
import { build } from 'vite';
import webExt from 'web-ext';

import REGIONS from '../src/utils/regions.js';
import { convertToSafariFormat } from '../src/utils/dnr-converter-safari.js';

const pwd = process.cwd();

const options = {
  srcDir: resolve(pwd, 'src'),
  outDir: resolve(pwd, 'dist'),
  assets: ['_locales', 'icons', 'static_pages'],
  pages: ['dnr-converter', 'logger', 'onboarding', 'whotracksme'],
};

// Generate arguments from command line
const argv = process.argv.slice(2).reduce(
  (acc, arg) => {
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, value] = arg.slice(2).split('=');
        acc[key] = value;
      } else {
        acc[arg.slice(2)] = true;
      }
    } else {
      acc.target = arg;
    }
    return acc;
  },
  { target: 'chromium' },
);

const pkg = JSON.parse(readFileSync(resolve(pwd, 'package.json'), 'utf8'));
const silent = argv.silent;

// Get manifest from source directory
if (!silent) console.log(`Reading manifest.${argv.target}.json...`);

const manifest = JSON.parse(
  readFileSync(resolve(options.srcDir, `manifest.${argv.target}.json`), 'utf8'),
);

// --- Add flags ---

if (argv.debug) {
  manifest.debug = true;
}

if (argv.staging) {
  // Force re-download of resources to be sure we have the latest version
  // when building with staging CDN
  argv.clean = true;

  manifest.staging = true;
}

// --- Download rule resources ---

if (argv.clean) {
  rmSync(resolve('src', 'rule_resources'), { recursive: true, force: true });
}

execSync(
  'node scripts/download-engines.js' + (argv.staging ? ' --staging' : ''),
  { stdio: silent ? '' : 'inherit' },
);

execSync('node scripts/download-wtm-bloomfilter.js', {
  stdio: silent ? '' : 'inherit',
});

execSync('node scripts/download-wtm-stats.js', {
  stdio: silent ? '' : 'inherit',
});

// --- Generate static pages ---

const staticPath = resolve('src', 'static_pages');

if (argv.clean) {
  rmSync(staticPath, { recursive: true, force: true });
}

if (!existsSync(staticPath)) mkdirSync(staticPath, { recursive: true });

// licenses.html...
const licensesPath = resolve(staticPath, 'licenses.html');
if (!existsSync(licensesPath)) {
  writeFileSync(
    licensesPath,
    execSync(`npx license-report --config=scripts/license-report.json`)
      .toString()
      .replace(
        '<html>',
        `
<html lang="en">
  <head>
    <title>Software Licenses</title>
    <meta charset="utf-8">
    <link rel="icon" type="image/png" href="/assets/favicon.png" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  </head>
`,
      )
      .trim(),
  );
}

// privacy-policy.html...
if (argv.target !== 'firefox') {
  const policyPath = resolve(staticPath, 'privacy-policy.html');
  const url = `https://www.${argv.debug ? 'ghosterystage' : 'ghostery'}.com/privacy-policy?embed=true`;

  if (!existsSync(policyPath)) {
    const policy = await fetch(url);
    if (policy.ok) {
      const text = await policy.text();
      writeFileSync(policyPath, text);
    } else {
      throw new Error(
        `Failed to fetch Privacy Policy from '${url}': ${policy.status}`,
      );
    }
  }
}

// --- Base Vite Config ---

const config = {
  logLevel: silent ? 'silent' : undefined,
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
rmSync(options.outDir, { recursive: true, force: true });
mkdirSync(options.outDir, { recursive: true });

// copy static assets
options.assets.forEach((path) => {
  mkdirSync(resolve(options.outDir, path), { recursive: true });
  for (const file of readdirSync(resolve(options.srcDir, path))) {
    cpSync(
      resolve(options.srcDir, path, file),
      resolve(options.outDir, path, file),
      { recursive: true },
    );
  }
});

// copy adblocker engines
mkdirSync(resolve(options.outDir, 'rule_resources'), { recursive: true });

const engines = [
  'ads',
  'tracking',
  'annoyances',
  'fixes',
  ...REGIONS.map((region) => `lang-${region}`),
];

engines.forEach((engine) => {
  const path = `engine-${engine}.dat`;
  cpSync(
    resolve(options.srcDir, 'rule_resources', path),
    resolve(options.outDir, 'rule_resources', path),
  );
});

// copy trackerdb engine
cpSync(
  resolve(options.srcDir, 'rule_resources', 'engine-trackerdb.dat'),
  resolve(options.outDir, 'rule_resources', 'engine-trackerdb.dat'),
);

// copy managed storage configuration
if (manifest.storage?.managed_schema) {
  const path = resolve(options.srcDir, manifest.storage.managed_schema);
  cpSync(path, resolve(options.outDir, manifest.storage.managed_schema));
}

// copy declarative net request lists
if (manifest.declarative_net_request?.rule_resources) {
  let rulesCount = 0;

  // Add regional DNR rules to Chromium
  if (argv.target === 'chromium') {
    REGIONS.forEach((region) => {
      manifest.declarative_net_request.rule_resources.push({
        id: `lang-${region}`,
        enabled: false,
        path: `rule_resources/dnr-lang-${region}.json`,
      });
    });
  }

  manifest.declarative_net_request.rule_resources.forEach(({ path }) => {
    const dir = dirname(path);
    const file = basename(path);
    const sourcePath = resolve(options.srcDir, path);
    const destPath = resolve(options.outDir, dir);
    const outputPath = resolve(destPath, file);

    mkdirSync(destPath, { recursive: true });

    if (argv.target === 'safari') {
      const list = JSON.parse(readFileSync(sourcePath, 'utf8'))
        .map((rule) => {
          try {
            return convertToSafariFormat(rule);
          } catch {
            // ignore incompatible rules
          }
        })
        .filter(Boolean);
      rulesCount += list?.length;
      writeFileSync(outputPath, JSON.stringify(list));
      return;
    }

    cpSync(sourcePath, outputPath);
  });

  if (argv.target === 'safari') {
    console.log('Declarative Net Request rules:', rulesCount);

    // https://github.com/WebKit/WebKit/blob/c85962a5c0e929991e5963811da957b75d1501db/Source/WebCore/contentextensions/ContentExtensionCompiler.cpp#L199
    if (rulesCount > 75000) {
      throw new Error(
        `Warning: The number of rules exceeds the limit of 75k rules.`,
      );
    }
  }
}

// copy redirect rule resources
mkdirSync(resolve(options.outDir, 'rule_resources/redirects'), {
  recursive: true,
});
for (const file of readdirSync(
  resolve(options.srcDir, 'rule_resources', 'redirects'),
)) {
  if (argv.target !== 'firefox' && file.includes('MIME_TYPE_STUB')) {
    continue;
  }
  cpSync(
    resolve(options.srcDir, 'rule_resources', 'redirects', file),
    resolve(options.outDir, 'rule_resources', 'redirects', file),
  );
}

// append web_accessible_resources
const redirectResources = readdirSync(
  resolve(options.outDir, 'rule_resources/redirects'),
);

if (manifest.manifest_version === 3) {
  manifest.web_accessible_resources.push({
    resources: redirectResources.map((filename) =>
      join('rule_resources/redirects', filename),
    ),
    matches: ['<all_urls>'],
    use_dynamic_url: true,
  });
} else {
  redirectResources.forEach((filename) => {
    manifest.web_accessible_resources.push(
      join('rule_resources/redirects', filename),
    );
  });
}

// --- Generate entry points ---

const source = options.pages.map((page) => `pages/${page}/index.html`);
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
manifest.content_scripts = manifest.content_scripts.filter(
  ({ js = [], css = [], run_at }) => {
    [...js, ...css].forEach((src) => content_scripts.push(src));
    return run_at !== 'background_execute_script';
  },
);

// web-accessible resources
manifest.web_accessible_resources?.forEach((entry) => {
  const paths = [];

  if (typeof entry === 'string') {
    paths.push(entry);
  } else {
    entry.resources.forEach((src) => paths.push(src));
  }

  paths.forEach((path) => {
    if (path.includes('/redirects/')) return;

    if (path.match(/\.(html)$/)) {
      source.push(path);
    } else if (path.match(/\.(js)$/)) {
      content_scripts.push(path);
    } else {
      throw new Error(`Unsupported web_accessible_resource: ${path}`);
    }
  });
});

// background
if (manifest.background) {
  source.push(
    manifest.background.service_worker || manifest.background.scripts[0],
  );
}

// --- Save manifest ---

// set manifest version from package.json
manifest.version = pkg.version;

if (manifest.permissions.includes('declarativeNetRequest') && argv.watch) {
  manifest.permissions.push('declarativeNetRequestFeedback');
}

writeFileSync(
  resolve(options.outDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
);

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
      // Prevent from loading re2-wasm dependency of the @ghostery/urlfilter2dnr package
      // as it is used only in node environment
      external: ['@adguard/re2-wasm'],
      preserveEntrySignatures: 'exports-only',
      output: {
        banner:
          argv.target === 'firefox' &&
          'globalThis.chrome = globalThis.browser;\n',
        dir: options.outDir,
        manualChunks: false,
        preserveModules: true,
        preserveModulesRoot: 'src',
        minifyInternalExports: false,
        entryFileNames: (chunk) =>
          `${chunk.name.replace(/\.(png|jpg|jpeg|gif|svg|webp)$/, '')}.js`,

        assetFileNames: 'assets/[name]-[hash].[ext]',
        sanitizeFileName: (name) => {
          name = name
            .replace(/[\0?*]+/g, '_')
            .replace('node_modules', 'npm')
            .replace('_virtual', 'virtual');

          const path = name.replace(pwd, '');
          if (path.length > 110 && !argv['no-filename-limit']) {
            throw new Error(
              `Filename too long: ${path} (${path.length}) (pass --no-filename-limit to disable; for instance, "npm run build firefox -- --no-filename-limit")`,
            );
          }

          return name;
        },
      },
    },
  },
  plugins: [
    // Keep offscreen documents from @whotracksme/reporting
    {
      name: 'copy-reporting-assets',
      buildStart() {
        const srcDir = resolve(
          process.cwd(),
          'node_modules/@whotracksme/reporting/reporting/src/offscreen/doublefetch/',
        );
        const outDir = resolve(process.cwd(), 'dist/offscreen/doublefetch/');
        if (!existsSync(outDir)) {
          mkdirSync(outDir, { recursive: true });
        }
        const files = readdirSync(srcDir);
        files.forEach((file) => {
          cpSync(resolve(srcDir, file), resolve(outDir, file));
        });
      },
    },

    // This custom plugin cleans ups chunks imports of the `.html` inputs
    //  to only include CSS files. This is necessary because Vite generates
    // every imported JS file as script tag in the resulting HTML file.
    // It is related to our custom usage, where we don't bundle JS into single files.
    {
      name: 'clean-up-html-imports',
      enforce: 'pre',
      generateBundle(options, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.fileName.endsWith('.html.js')) {
            for (const name of chunk.imports) {
              const importChunk = bundle[name];
              if (importChunk.type === 'chunk') {
                // Imports of the single chunk generated from HTML should only include CSS files
                importChunk.imports = importChunk.imports.filter((name) =>
                  name.endsWith('.css.js'),
                );
              }
            }
          }
        }
      },
    },
  ],
});

// --- Build content scripts ---

for (const [id, path] of Object.entries(mapPaths(content_scripts))) {
  // Copy assets
  if (!path.endsWith('.js')) {
    mkdirSync(resolve(options.outDir, id.split('/').slice(0, -1).join('/')), {
      recursive: true,
    });
    cpSync(path, resolve(options.outDir, id));
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
            banner:
              argv.target === 'firefox' &&
              'globalThis.chrome = globalThis.browser;\n',
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
              devtools: true,
              firefoxBinary:
                '/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin',
            };
            break;
          case 'chromium': {
            settings = { target: 'chromium' };

            switch (argv.browser) {
              case 'brave':
                settings.chromiumBinary =
                  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
                break;
              case 'edge':
                settings.chromiumBinary =
                  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
                break;
              case 'opera':
                settings.chromiumBinary =
                  '/Applications/Opera.app/Contents/MacOS/Opera';
                break;
            }

            break;
          }
          default:
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
