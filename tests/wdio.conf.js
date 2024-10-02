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
import { promises as fs } from 'node:fs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const extPath = path.join(__dirname, '..', 'web-ext-artifacts');

export const config = process.env.DEBUG
  ? {
      specs: [['*.spec.js']],
      capabilities: [
        {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [`--load-extension=${path.join(__dirname, '..', 'dist')}`],
          },
        },
      ],
      injectGlobals: false,
      reporters: ['spec'],
      logLevel: 'warn',
      mochaOpts: { timeout: 24 * 60 * 60 * 1000 },
    }
  : {
      specs: ['*.spec.js'],
      capabilities: [
        {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              'headless',
              'disable-gpu',
              `--load-extension=${path.join(extPath, 'ghostery-chromium')}`,
            ],
          },
        },
        {
          browserName: 'firefox',
          'moz:firefoxOptions': { args: ['-headless'] },
        },
      ],
      injectGlobals: false,
      reporters: ['spec'],
      logLevel: 'silent',
      mochaOpts: { timeout: 24 * 60 * 60 * 1000 },
      before: async (capabilities, specs, browser) => {
        if (capabilities.browserName === 'firefox') {
          const extension = await fs.readFile(
            path.join(extPath, 'ghostery-firefox.zip'),
          );
          await browser.installAddOn(extension.toString('base64'), true);
        }
      },
    };
