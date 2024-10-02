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

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const config = {
  specs: [['specs/*.js']],
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [`--load-extension=${path.join(__dirname, '..', '..', 'dist')}`],
      },
    },
  ],
  injectGlobals: false,
  reporters: ['spec'],
  logLevel: 'warn',
  mochaOpts: { timeout: 24 * 60 * 60 * 1000 },
};
