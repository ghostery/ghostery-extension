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
import { browser } from '@wdio/globals';
import {
  enableExtension,
  setCustomFilters,
  disableCustomFilters,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

const WORLD_PAGE_URL = PAGE_URL + 'adblocker/world.html';

function waitForPageProbe(probe, timeoutMsg) {
  return browser.waitUntil(() => browser.execute(probe), {
    timeout: 5000,
    timeoutMsg,
  });
}

// Kept in its own spec file so CI can target it by path on the minimum
// supported Firefox — a missing file fails loudly, unlike a mocha grep.
describe('Adblocker Execution World', function () {
  before(enableExtension);
  after(disableCustomFilters);

  it('injects scriptlets into their declared ISOLATED world', async function () {
    // `set-attr` declares `world: 'ISOLATED'`. The page sabotages its own
    // `Element.prototype.setAttribute`, which only affects the MAIN world.
    await setCustomFilters([`${PAGE_DOMAIN}##+js(set-attr, #world-target, data-world, true)`]);

    await browser.url(WORLD_PAGE_URL);

    await waitForPageProbe(function () {
      return document.getElementById('world-target')?.getAttribute('data-world') === 'true';
    }, 'ISOLATED scriptlet did not apply — it was likely injected into the MAIN world');
  });

  it('runs MAIN and ISOLATED scriptlets together on the same page', async function () {
    // `set-attr` is ISOLATED (must survive the page's setAttribute override) and
    // `set` is MAIN (must define a page-visible global). Both target one hostname,
    // so both worlds have to be injected and applied on a single load.
    await setCustomFilters([
      `${PAGE_DOMAIN}##+js(set-attr, #world-target, data-world, true)`,
      `${PAGE_DOMAIN}##+js(set, mainWorldProbe, true)`,
    ]);

    await browser.url(WORLD_PAGE_URL);

    await waitForPageProbe(function () {
      return (
        document.getElementById('world-target')?.getAttribute('data-world') === 'true' &&
        window.mainWorldProbe === true
      );
    }, 'MAIN and ISOLATED scriptlets did not both apply on the same page');
  });
});
