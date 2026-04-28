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

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { filterMetadata } from '../../scripts/utils/filter-metadata.js';

describe('Preprocessor', () => {
  describe('#filterMetadata', () => {
    it('filterMetadata', () => {
      const metadata = {
        adguard: { preprocessor: 'adguard' },
        notAdguard: { preprocessor: '!adguard' },
        notAdguardOrSafari: { preprocessor: '!adguard||ext_safari' },
        adguardOrSafari: { preprocessor: 'adguard||ext_safari' },
        chromiumAndNotChromium: { preprocessor: 'env_chromium&&!env_chromium' },
        chromiumOrNotChromium: { preprocessor: 'env_chromium||!env_chromium' },
        chromiumAndGhostery: { preprocessor: 'env_chromium&&ext_ghostery' },
        notEdge: { preprocessor: '!env_edge' },
        notAdguardAndNotEdge: { preprocessor: '!adguard&&!env_edge' },
      };

      assert.deepEqual(filterMetadata(metadata), {
        adguard: { preprocessor: 'adguard' },
        adguardOrSafari: { preprocessor: 'adguard||ext_safari' },
        chromiumAndNotChromium: { preprocessor: 'env_chromium&&!env_chromium' },
        notEdge: { preprocessor: '!env_edge' },
        notAdguardAndNotEdge: { preprocessor: '!adguard&&!env_edge' },
      });
    });
  });
});
