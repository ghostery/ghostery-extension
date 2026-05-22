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
import { browser, expect } from '@wdio/globals';

import {
  enableExtension,
  getExtensionElement,
  loadThirdPartyScript,
  setToggle,
  PAGE_URL,
} from '../utils.js';

async function setDistractionToggle(name, value) {
  await browser.url('ghostery:settings');
  await getExtensionElement('button:distractions').click();
  await setToggle(`distractions:${name}`, value);
}

describe('Distractions', function () {
  before(enableExtension);

  after(() => setDistractionToggle('signInWithGoogle', false));

  describe('Google Sign-In', function () {
    it('loads the client script when the toggle is disabled', async function () {
      await setDistractionToggle('signInWithGoogle', false);

      await browser.url(PAGE_URL);

      await expect(await loadThirdPartyScript('https://accounts.google.com/gsi/client')).toBe(
        'loaded',
      );
    });

    it('blocks the client script when the toggle is enabled', async function () {
      await setDistractionToggle('signInWithGoogle', true);

      await browser.url(PAGE_URL);

      await expect(await loadThirdPartyScript('https://accounts.google.com/gsi/client')).toBe(
        'blocked',
      );
    });
  });
});
