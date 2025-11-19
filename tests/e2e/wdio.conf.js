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

/*
 * Usage:
 *   wdio tests/wdio.conf.js [--target=firefox,chrome] [--debug] [--clean]
 *
 * Options:
 *   --target: comma separated list of browsers to run the tests on (default: firefox,chrome)
 *   --debug: run the tests in debug mode (default: false)
 *   --clean: clean the build artifacts before running the tests (default: false)
 */

import path from 'node:path';
import url from 'node:url';
import { readFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { execSync } from 'node:child_process';
import { $ } from '@wdio/globals';

import { setConfigFlags, setExtensionBaseUrl } from './utils.js';
import {
  FLAG_PAUSE_ASSISTANT,
  FLAG_FIREFOX_CONTENT_SCRIPT_SCRIPTLETS,
  FLAG_EXTENDED_SELECTORS,
  FLAG_DYNAMIC_DNR_FIXES,
  FLAG_CHROMIUM_INJECT_COSMETICS_ON_RESPONSE_STARTED,
} from '../../src/utils/config-types.js';

export const WEB_EXT_PATH = path.join(process.cwd(), 'web-ext-artifacts');

export const FIREFOX_PATH = path.join(WEB_EXT_PATH, 'ghostery-firefox.zip');
export const CHROME_PATH = path.join(WEB_EXT_PATH, 'ghostery-chromium');

const PAGE_PORT = 6789;
export const PAGE_DOMAIN = `page.localhost`;
export const PAGE_URL = `http://${PAGE_DOMAIN}:${PAGE_PORT}/`;

// Generate arguments from command line
export const argv = process.argv.slice(2).reduce(
  (acc, arg) => {
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, value] = arg.slice(2).split('=');
        acc[key] = value.split(',').filter((v) => v);
      } else {
        acc[arg.slice(2)] = true;
      }
    }
    return acc;
  },
  {
    target: ['firefox', 'chrome'],
    clean: false,
    debug: false,
    flags: [
      FLAG_PAUSE_ASSISTANT,
      FLAG_FIREFOX_CONTENT_SCRIPT_SCRIPTLETS,
      FLAG_EXTENDED_SELECTORS,
      FLAG_DYNAMIC_DNR_FIXES,
      FLAG_CHROMIUM_INJECT_COSMETICS_ON_RESPONSE_STARTED,
    ],
  },
);

function execSyncNode(command) {
  execSync(command, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: '' },
  });
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export function setupTestPage() {
  const file = readFileSync(path.join(__dirname, 'page.html'), 'utf8');
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(file);
  });

  // starts a simple http server locally on port 6789
  server.listen(PAGE_PORT, '127.0.0.1', () => {
    console.log(`Testing page server listening on ${PAGE_URL}\n`);
  });
}

export function buildForFirefox() {
  if (!existsSync(FIREFOX_PATH)) {
    execSyncNode('npm run build -- firefox --silent --debug');
    execSyncNode('web-ext build --overwrite-dest -n ghostery-firefox.zip');
  }
}

export function buildForChrome() {
  if (!existsSync(CHROME_PATH)) {
    execSyncNode('npm run build -- --silent --debug');
    rmSync(CHROME_PATH, { recursive: true, force: true });
    cpSync(path.join(process.cwd(), 'dist'), CHROME_PATH, {
      recursive: true,
    });
  }
}

export const config = {
  specs: [
    [
      // Must be the first to enable the extension
      'spec/onboarding.spec.js',
      'spec/index.spec.js',
    ],
  ],
  reporters: [['spec', { showPreface: false }]],
  logLevel: argv.debug ? 'error' : 'silent',
  mochaOpts: {
    timeout: argv.debug ? 24 * 60 * 60 * 1000 : 60 * 1000,
    retries: 2,
  },
  maxInstances: process.env.GITHUB_ACTIONS ? 1 : 2,
  capabilities: [
    {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: argv.debug ? [] : ['-headless'],
        prefs: {
          'browser.cache.disk.enable': false,
          'browser.cache.memory.enable': false,
          'browser.cache.offline.enable': false,
          'network.http.use-cache': false,
          'intl.accept_languages': 'en-GB',
        },
      },
    },
    {
      browserName: 'chrome',
      browserVersion: 'stable',
      'goog:chromeOptions': {
        args: (argv.debug ? [] : ['headless', 'disable-gpu']).concat([
          `--load-extension=${CHROME_PATH}`,
          '--accept-lang=en-GB',
          '--no-sandbox',
        ]),
      },
    },
  ].filter((capability) => argv.target.includes(capability.browserName)),
  onPrepare: async (config, capabilities) => {
    if (argv.clean) {
      rmSync(WEB_EXT_PATH, { recursive: true, force: true });
    }

    try {
      for (const capability of capabilities) {
        switch (capability.browserName) {
          case 'firefox': {
            buildForFirefox();
            break;
          }
          case 'chrome': {
            buildForChrome();
            break;
          }
        }
      }

      setupTestPage();
    } catch (e) {
      console.error('Error while preparing test environment', e);
      process.exit(1);
    }
  },
  before: async (capabilities, specs, browser) => {
    try {
      if (capabilities.browserName === 'firefox') {
        const extension = readFileSync(FIREFOX_PATH);
        await browser.installAddOn(extension.toString('base64'), true);

        // Get the extension ID from extensions settings page
        await browser.url('about:debugging#/runtime/this-firefox');

        const url = (
          await $('>>>a.qa-manifest-url').getProperty('href')
        ).replace('manifest.json', 'pages');

        setExtensionBaseUrl(url);
      }

      // Disable cache for Chrome to avoid caching issues
      if (capabilities.browserName === 'chrome') {
        await browser.sendCommand('Network.setCacheDisabled', {
          cacheDisabled: true,
        });

        // Get the extension ID from extensions settings page
        await browser.url('chrome://extensions');

        const extensionId = await $('>>>extensions-item').getAttribute('id');
        setExtensionBaseUrl(`chrome-extension://${extensionId}/pages`);

        // Enable developer mode for reloading extension
        await $('>>>#devMode').click();
        await browser.pause(2000);
      }

      await setConfigFlags(argv.flags);
    } catch (e) {
      console.error('Error while setting up test environment', e);

      // close the browser session
      await browser.deleteSession();

      // send a signal to the parent process to stop the tests
      process.kill(process.pid, 'SIGTERM');
    }
  },
};
