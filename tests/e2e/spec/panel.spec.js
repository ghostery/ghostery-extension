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
import { expect, $ } from '@wdio/globals';
import {
  enableExtension,
  getExtensionElement,
  switchToPanel,
  switchToNewTabContext,
} from '../utils.js';

describe('Panel', function () {
  before(enableExtension);

  it('opens licenses page', async function () {
    await switchToPanel(async () => {
      await getExtensionElement('button:menu').click();

      await switchToNewTabContext(
        await getExtensionElement('button:licenses'),
        async function () {
          const bodyText = await $('body').getText();
          await expect(bodyText.includes('MIT')).toBe(true);
        },
      );
    });
  });
});
