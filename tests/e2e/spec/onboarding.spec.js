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
import { setupExtension, getExtensionElement, sendMessage } from '../utils.js';

async function setAttribution(values) {
  await browser.url('ghostery:onboarding');

  // The new window does not take over the session, so `browser` stays on the onboarding page
  const page = await browser.newWindow('https://www.ghostery.com/');

  await page.execute(function (v) {
    sessionStorage.setItem('attribution', v);
  }, values);

  await sendMessage({ action: 'e2e:captureAttribution' });

  await page.closeWindow();
}

describe('Onboarding', function () {
  if (browser.isFirefox) {
    it('keeps ghostery disabled', async function () {
      await browser.url('ghostery:onboarding');

      await getExtensionElement('button:skip').click();
      await expect(getExtensionElement('view:skip')).toBeDisplayed();

      await browser.url('ghostery:panel');
      await expect(getExtensionElement('button:enable')).toBeDisplayed();
    });
  }

  if (browser.isChromium) {
    it('shows the dialog with Privacy Policy', async function () {
      await browser.url('ghostery:onboarding');

      await getExtensionElement('text:description', 'a:last-of-type').click();

      await expect(getExtensionElement('text:privacy-policy', 'p')).toBeDisplayed();
    });
  }

  it('enables ghostery', setupExtension);

  it('captures attribution from ghostery.com sessionStorage', async () => {
    await setAttribution('s=source&c=campaign');

    await browser.url('ghostery:settings');

    await expect(getExtensionElement('text:utm-source')).toHaveText('source');
    await expect(getExtensionElement('text:utm-campaign')).toHaveText('campaign');
  });
});
