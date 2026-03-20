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
import { readFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { $, $$ } from '@wdio/globals';

import { setupTestPage } from './page/server.js';

import { getExtensionPageURL, setExtensionBaseUrl, PAGE_PORT, PAGE_URL } from './utils.js';

export const WEB_EXT_PATH = path.join(process.cwd(), 'web-ext-artifacts');
export const FIREFOX_PATH = path.join(WEB_EXT_PATH, 'ghostery-firefox.zip');
export const CHROME_PATH = path.join(WEB_EXT_PATH, 'ghostery-chromium');

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
  },
);

function execSyncNode(command) {
  execSync(command, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: '' },
  });
}

export function buildForFirefox() {
  if (!existsSync(FIREFOX_PATH)) {
    execSyncNode('npm run build -- firefox --silent --debug --clean');
    execSyncNode('web-ext build --overwrite-dest -n ghostery-firefox.zip');
  }
}

export function buildForChrome() {
  if (!existsSync(CHROME_PATH)) {
    execSyncNode('npm run build -- chromium --silent --debug --clean');
    rmSync(CHROME_PATH, { recursive: true, force: true });
    cpSync(path.join(process.cwd(), 'dist'), CHROME_PATH, {
      recursive: true,
    });
  }
}

export const config = {
  specs: [
    // Main features
    [
      'spec/onboarding.spec.js',
      'spec/managed.spec.js',
      'spec/main.spec.js',
      'spec/zapped.spec.js',
      'spec/adblocker.spec.js',
    ],
    // The rest explicitly defined (a pattern would match main features too)
    [
      'spec/exceptions.spec.js',
      'spec/custom-filters.spec.js',
      'spec/redirect-protection.spec.js',
      'spec/clear-cookies.spec.js',
      'spec/panel.spec.js',
      'spec/pause-assistant.spec.js',
      'spec/whotracksme.spec.js',
    ],
  ],
  reporters: [['spec', { showPreface: false, realtimeReporting: !process.env.GITHUB_ACTIONS }]],
  logLevel: argv.debug ? 'error' : 'silent',
  mochaOpts: {
    timeout: argv.debug ? 24 * 60 * 60 * 1000 : 60 * 1000,
    retries: 2,
  },
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'firefox',
      browserVersion: 'stable',
      cacheDir: '.wdio',
      'moz:firefoxOptions': {
        args: argv.debug ? [] : ['-headless', '--width=1024', '--height=768'],
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
      cacheDir: '.wdio',
      'goog:chromeOptions': {
        args: (argv.debug ? [] : ['headless', 'disable-gpu']).concat([
          `--load-extension=${CHROME_PATH}`,
          '--accept-lang=en-GB',
          '--no-sandbox',
          '--window-size=1024,768',
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

      setupTestPage(PAGE_PORT);
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

        const url = (await $('>>>a.qa-manifest-url').getProperty('href')).replace(
          'manifest.json',
          'pages',
        );

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

      const SETTINGS_PAGE_URL = getExtensionPageURL('settings');

      // Modify browser.url
      browser.overwriteCommand('url', async function (fn, ...args) {
        // Generate the target url for extension pages using `ghostery:` protocol
        if (args[0].startsWith('ghostery:')) {
          const pageArgs = args[0].split(':').slice(1);
          args[0] = getExtensionPageURL(...pageArgs);
        }

        const targetUrl = args[0];

        // Force full reload when navigating to:
        // * PAGE_URL - testing page for clearing cached version of page
        // * SETTINGS_PAGE_URL - to reload the page completely so it loads the main privacy section
        if (targetUrl === PAGE_URL || targetUrl === SETTINGS_PAGE_URL) {
          await fn.call(this, 'about:blank');
        }

        // Load the target url
        const result = await fn.call(this, ...args);

        // Wait until body contents is not empty
        if (targetUrl !== 'about:blank') {
          // At first add a small pause to ensure that the navigation has started
          // and the previous page is unloaded
          await browser.pause(100);

          // Then wait until the page is fully loaded by checking
          // if body has any child elements
          await browser.waitUntil(async () => (await $$('body > *').getElements()).length > 0, {
            timeout: 10000,
            timeoutMsg: `Page did not load: ${targetUrl}`,
            interval: 200,
          });
        }

        return result;
      });
    } catch (e) {
      console.error('Error while setting up test environment', e);

      // close the browser session
      await browser.deleteSession();

      // send a signal to the parent process to stop the tests
      process.kill(process.pid, 'SIGTERM');
    }
  },
};
