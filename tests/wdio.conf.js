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

import path from 'node:path';
import url from 'node:url';
import { promises as fs, cpSync, existsSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { execSync } from 'node:child_process';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const WEB_EXT_PATH = path.join(__dirname, '..', 'web-ext-artifacts');
const FIREFOX_PATH = path.join(WEB_EXT_PATH, 'ghostery-firefox.zip');
const CHROME_PATH = path.join(WEB_EXT_PATH, 'ghostery-chromium');
const PAGE_PORT = 6789;
export const PAGE_URL = `http://page.localhost:${PAGE_PORT}/`;

export const config = {
  specs: ['onboarding.spec.js', 'privacy.spec.js'],
  reporters: ['spec'],
  logLevel: 'silent',
  specFileRetries: 2,
  specFileRetriesDelay: 15,
  mochaOpts: { timeout: 60 * 1000 },
  capabilities: [
    {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: ['-headless'],
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
        args: ['headless', 'disable-gpu', `--load-extension=${CHROME_PATH}`],
      },
    },
  ],
  onPrepare: async (config, capabilities) => {
    if (!process.env.DEBUG) {
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

    const file = await fs.readFile(
      path.join(__dirname, 'e2e', 'page.html'),
      'utf8',
    );
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
      const extension = await fs.readFile(FIREFOX_PATH);
      await browser.installAddOn(extension.toString('base64'), true);
    }
  },
};

if (process.env.DEBUG) {
  Object.assign(config, {
    specs: [config.specs],
    specFileRetries: 0,
    capabilities: [
      {
        browserName: 'firefox',
        'moz:firefoxOptions': {
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
          args: ['--disk-cache-size=0', `--load-extension=${CHROME_PATH}`],
        },
      },
    ],
    logLevel: 'error',
    mochaOpts: { timeout: 24 * 60 * 60 * 1000 },
  });
}
