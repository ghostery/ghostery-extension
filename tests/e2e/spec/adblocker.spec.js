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
  setToggle,
  waitForIdleBackgroundTasks,
  setCustomFilters,
  disableCustomFilters,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

const ADBLOCKER_PAGE_URL = PAGE_URL + 'adblocker/index.html';

async function togglePrivacyFeatures(value) {
  await browser.url('ghostery:settings');

  await setToggle('ad-blocking', value);
  await setToggle('never-consent', value);
  await setToggle('anti-tracking', value);

  await waitForIdleBackgroundTasks();
}

async function collectTestPageResponse() {
  let response;

  for (let i = 0; i < 4; i++) {
    response = await browser.execute(function () {
      if (
        typeof suite === 'undefined' ||
        suite.collection.expected !== suite.collection.reports.length
      ) {
        return false;
      }
      return suite.collection.reports;
    });

    if (response === false) {
      await new Promise(function (resolve) {
        setTimeout(function () {
          resolve(null);
        }, 1000);
      });
    } else {
      return response;
    }
  }

  return false;
}

async function test(filters) {
  await setCustomFilters(
    filters.map(function ([, filter]) {
      return filter;
    }),
  );
  await browser.url(ADBLOCKER_PAGE_URL);

  const response = await collectTestPageResponse();
  const reports = {
    styling: [],
    scripting: [],
    networking: [],
  };

  for (const report of response) {
    if (report.type === 'styling') {
      reports.styling.push(report);
    } else if (report.type === 'scripting') {
      reports.scripting.push(report);
    } else if (report.type === 'networking') {
      reports.networking.push(report);
    }
  }

  return reports;
}

describe('Adblocker Capabilities', function () {
  before(enableExtension);
  before(async () => {
    // Disable all community filters to ensure the pure adblocker capability
    // Community filters often ship generic hides to special hostnames like
    // localhost. However, still at least one engine is required to bring
    // redirect resources to the resulting engine.
    await togglePrivacyFeatures(false);
  });

  after(async () => {
    await togglePrivacyFeatures(true);
    await disableCustomFilters();
  });

  describe('All platforms', function () {
    const stylingFilters = [
      ['generic-selector-id', '###generic-target'],
      ['generic-selector-class', '##.generic-target'],
      ['generic-selector-attribute', '##[generic-target]'],
      ['generic-selector-has', '##.generic-outer-target:has(span)'],
      ['generic-selector-lazy', '##[generic-lazy-target="100ms"]'],
      ['generic-selector-adjunct', '##[generic-adjunct-target="100ms"]'],
      ['selector-id', PAGE_DOMAIN + '###target'],
      ['selector-class', PAGE_DOMAIN + '##.target'],
      ['selector-attribute', PAGE_DOMAIN + '##[target]'],
      ['selector-has', PAGE_DOMAIN + '##.outer-target:has(span)'],
      ['selector-lazy', PAGE_DOMAIN + '##[lazy-target="100ms"]'],
      ['selector-adjunct', PAGE_DOMAIN + '##[adjunct-target="100ms"]'],
    ];
    const scriptingFilters = [
      ['globals-safeself', PAGE_DOMAIN + '##+js(json-prune, globals-safeself)'],
      ['aopr', PAGE_DOMAIN + '##+js(aopr, encodeURIComponent)'],
      ['aopw', PAGE_DOMAIN + '##+js(aopw, __checkadb__custom)'],
      ['aeld', PAGE_DOMAIN + '##+js(aeld, click)'],
      ['call-nothrow', PAGE_DOMAIN + '##+js(call-nothrow, atob)'],
      ['json-prune', PAGE_DOMAIN + '##+js(json-prune, __checkadb__custom)'],
      ['set', PAGE_DOMAIN + '##+js(set, checkadb, true)'],
      ['nostif0', PAGE_DOMAIN + '##+js(nostif, , 0)'],
      ['nostif50', PAGE_DOMAIN + '##+js(nostif, , 50)'],
      ['nosiif50', PAGE_DOMAIN + '##+js(nosiif, , 50)'],
      ['subdocument', PAGE_DOMAIN + '>>##+js(set, subdocument, true)'],
    ];
    const networkingFilters = [
      ['url', '/gen/url.js^'],
      ['regex', '/gen\\/regex.js\\?t=[a-z0-9]{6}/'],
      ['modscript', '/gen/modscript.js^$script'],
      ['modxhr', '/gen/modxhr.js^$xhr'],
      ['modmatchcase', '/gen\\/modmatchcase-UPPERCASE.js/$match-case'],
      ['redirnoopjs', '/gen/redirnoop.js^$redirect=noopjs'],
      ['rediradsbygoogle', '/gen/rediradsbygoogle.js^$redirect=googlesyndication_adsbygoogle.js'],
      ['redirgoogleima', '/gen/redirgoogleima.js^$redirect=google-ima.js'],
    ];

    let reports;

    before(async function () {
      reports = await test([...stylingFilters, ...scriptingFilters, ...networkingFilters]);
    });

    describe('Styling', function () {
      for (const [id, filter] of stylingFilters) {
        it(filter, async function () {
          await expect(
            reports.styling.map(function (timing) {
              return timing.results[id];
            }),
          ).toContain(true);
        });
      }
    });

    describe('Scripting', function () {
      for (const [id, filter] of scriptingFilters) {
        it(filter, async function () {
          await expect(
            reports.scripting.map(function (timing) {
              return timing.results[id];
            }),
          ).toContain(true);
        });
      }
    });

    describe('Networking', function () {
      for (const [id, filter] of networkingFilters) {
        it(filter, async function () {
          // The networking test only have one timing candidate
          await expect(reports.networking[0].results[id]).toBe(true);
        });
      }
    });
  });

  if (browser.isFirefox) {
    describe('Firefox', function () {
      const networkingFilters = [
        ['redirfallback', '/gen/redirfallback.js^$redirect=something_does_not_exist.js'],
      ];

      let reports;

      before(async function () {
        reports = await test(networkingFilters);
      });

      describe('Networking', function () {
        for (const [id, filter] of networkingFilters) {
          it(filter, async function () {
            await expect(reports.networking[0].results[id]).toBe(true);
          });
        }
      });
    });
  }

  describe(' Controls', function () {
    it('$elemhide exception', async function () {
      const reports = await test([
        ['', `@@||${PAGE_DOMAIN}^$elemhide`],
        ['', PAGE_DOMAIN + '###target'],
        ['', '###generic-target'],
      ]);

      await expect(
        reports.styling.map(function (timing) {
          return timing.results['generic-selector-id'];
        }),
      ).not.toContain(true);
      await expect(
        reports.styling.map(function (timing) {
          return timing.results['selector-id'];
        }),
      ).not.toContain(true);
    });

    it('$ghide exception', async function () {
      const reports = await test([
        ['', `@@||${PAGE_DOMAIN}^$ghide`],
        ['', '###generic-target'],
      ]);

      await expect(
        reports.styling.map(function (timing) {
          return timing.results['generic-selector-id'];
        }),
      ).not.toContain(true);
    });

    it('$shide exception', async function () {
      const reports = await test([
        ['', `@@||${PAGE_DOMAIN}^$shide`],
        ['', PAGE_DOMAIN + '###target'],
      ]);

      await expect(
        reports.styling.map(function (timing) {
          return timing.results['selector-id'];
        }),
      ).not.toContain(true);
    });
  });
});
