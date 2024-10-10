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

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const WEB_EXT_PATH = path.join(__dirname, '..', 'web-ext-artifacts');
const FIREFOX_PATH = path.join(WEB_EXT_PATH, 'ghostery-firefox.zip');
const CHROME_PATH = path.join(WEB_EXT_PATH, 'ghostery-chromium');

const PAGE_PORT = 6789;
export const PAGE_URL = `http://page.localhost:${PAGE_PORT}/`;

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
    }
    return acc;
  },
  { target: ['firefox', 'chrome'], debug: false, clean: false },
);

export const config = {
  specs: ['onboarding.spec.js', 'privacy.spec.js'],
  reporters: ['spec'],
  logLevel: argv.debug ? 'error' : 'silent',
  mochaOpts: {
    retries: 2,
    timeout: argv.debug ? 24 * 60 * 60 * 1000 : 60 * 1000,
  },
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
        },
      },
    },
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: (argv.debug ? [] : ['headless', 'disable-gpu']).concat([
          `--load-extension=${CHROME_PATH}`,
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
            if (!existsSync(FIREFOX_PATH)) {
              execSync('npm run build -- firefox --silent', {
                stdio: 'inherit',
              });
              execSync(
                'web-ext build --overwrite-dest -n ghostery-firefox.zip',
                {
                  stdio: 'inherit',
                },
              );
            }
            break;
          }
          case 'chrome': {
            if (!existsSync(CHROME_PATH)) {
              execSync('npm run build -- --silent', { stdio: 'inherit' });
              cpSync(path.join(__dirname, '..', 'dist'), CHROME_PATH, {
                recursive: true,
              });
            }
            break;
          }
        }
      }
    } catch (e) {
      console.error('Error while building the extension');
      console.error(e);

      process.exit(1);
    }

    const file = readFileSync(path.join(__dirname, 'e2e', 'page.html'), 'utf8');
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(file);
    });

    // starts a simple http server locally on port 6789
    server.listen(PAGE_PORT, '127.0.0.1', () => {
      console.log('Testing page server listening on', PAGE_URL);
    });
  },
  before: async (capabilities, specs, browser) => {
    if (capabilities.browserName === 'firefox') {
      const extension = readFileSync(FIREFOX_PATH);
      await browser.installAddOn(extension.toString('base64'), true);
    }

    // Waits and closes the onboarding page opened by the extension
    // This is necessary to avoid the onboarding page opened in
    // random moment from clashing with the tests

    const currentUrl = await browser.getUrl();

    await browser.waitUntil(async function () {
      try {
        await browser.switchWindow('Welcome to Ghostery');
        return true;
      } catch {
        return false;
      }
    });

    await browser.closeWindow();
    await browser.switchWindow(currentUrl);
  },
};

if (argv.debug) {
  Object.assign(config, { specs: [config.specs] });
}
