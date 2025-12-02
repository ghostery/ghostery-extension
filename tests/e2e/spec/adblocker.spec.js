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
  setPrivacyToggle,
  setCustomFilters,
} from '../utils.js';

import { PAGE_DOMAIN, PAGE_URL as baseUrl } from '../wdio.conf.js';

const PAGE_URL = baseUrl + 'adblocker/index.html';

async function disableAllPrivacyToggle() {
  // Disable all community filters to ensure the pure adblocker capability
  // Community filters often ship generic hides to special hostnames like
  // localhost. However, still at least one engine is required to bring
  // redirect resources to the resulting engine.
  await setPrivacyToggle('ad-blocking', false);
  // We will bring the never-consent engine, which will have minimum effect
  // to the testing page.
  await setPrivacyToggle('never-consent', true);
  await setPrivacyToggle('anti-tracking', false);
}

async function enableAllPrivacyToggle() {
  await setPrivacyToggle('ad-blocking', true);
  await setPrivacyToggle('never-consent', true);
  await setPrivacyToggle('anti-tracking', true);
}

async function collectTestResults() {
  let result;
  for (let i = 0; i < 4; i++) {
    result = await browser.execute(function () {
      if (
        typeof suite === 'undefined' ||
        suite.collection.expected !== suite.collection.reports.length
      ) {
        return false;
      }
      return suite.collection.reports;
    });
    if (result === false) {
      await new Promise(function (resolve) {
        setTimeout(function () {
          resolve(null);
        }, 1000);
      });
    } else {
      return result;
    }
  }

  return result;
}

async function prepareTestPage(filters) {
  await setCustomFilters(
    filters.map(function ([id, filter]) {
      return id.startsWith('generic') ? PAGE_DOMAIN + filter : filter;
    }),
  );
  await browser.url(PAGE_URL);
}

describe.only('Adblocker Capabilities', function () {
  // NOTE: Only separate "enableExtension" before hook and merge everything else
  before(enableExtension);
  before(disableAllPrivacyToggle);

  after(enableAllPrivacyToggle);
  after(function () {
    setPrivacyToggle('custom-filters', false);
  });

  describe('All platforms', function () {
    const stylingFilters = [
      ['generic-selector-id', PAGE_DOMAIN + '###generic-target'],
      ['generic-selector-class', PAGE_DOMAIN + '##.generic-target'],
      ['generic-selector-attribute', PAGE_DOMAIN + '##[generic-target]'],
      [
        'generic-selector-has',
        PAGE_DOMAIN + '##.generic-outer-target:has(span)',
      ],
      [
        'generic-selector-lazy',
        PAGE_DOMAIN + '##[generic-lazy-target="100ms"]',
      ],
      [
        'generic-selector-adjunct',
        PAGE_DOMAIN + '##[generic-adjunct-target="100ms"]',
      ],
      ['selector-id', '###target'],
      ['selector-class', '##.target'],
      ['selector-attribute', '##[target]'],
      ['selector-has', '##.outer-target:has(span)'],
      ['selector-lazy', '##[lazy-target="100ms"]'],
      ['selector-adjunct', '##[adjunct-target="100ms"]'],
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
    ];
    const networkingFilters = [
      ['url', '/gen/url.js^'],
      ['regex', '/gen\\/regex.js\\?t=[a-z0-9]{6}/'],
      ['modscript', '/gen/modscript.js^$script'],
      ['modxhr', '/gen/modxhr.js^$xhr'],
      // $match-case (see Firefox)
      ['redirnoopjs', '/gen/redirnoop.js^$redirect=noopjs'],
      [
        'rediradsbygoogle',
        '/gen/rediradsbygoogle.js^$redirect=googlesyndication_adsbygoogle.js',
      ],
    ];

    const reports = {
      styling: [],
      scripting: [],
      networking: [],
    };

    before(async function () {
      await prepareTestPage([
        ...stylingFilters,
        ...scriptingFilters,
        ...networkingFilters,
      ]);
      for (const report of await collectTestResults()) {
        if (report.type === 'styling') {
          reports.styling.push(report);
        } else if (report.type === 'scripting') {
          reports.scripting.push(report);
        } else if (report.type === 'networking') {
          reports.networking.push(report);
        }
      }
    });

    describe('Styling', function () {
      for (const [id, filter] of stylingFilters) {
        it(filter, async function () {
          expect(
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
          expect(
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
          expect(reports.networking[0].results[id]).toBe(true);
        });
      }
    });
  });

  if (browser.isChromium) {
    describe('Chromium', function () {
      const networkingFilters = [
        // modmatchcase is not supported by adblocker library yet
        // refs https://github.com/ghostery/adblocker/pull/5296
        ['modmatchcase', '/gen\\/modmatchcase-UPPERCASE.js/$match-case'],
      ];

      let report;

      before(async function () {
        await prepareTestPage(networkingFilters);
        report = (await collectTestResults()).find(function (report) {
          return report.type === 'networking';
        });
      });

      describe('Networking', function () {
        for (const [id, filter] of networkingFilters) {
          it(filter, async function () {
            expect(report.results[id]).toBe(true);
          });
        }
      });
    });
  }

  if (browser.isFirefox) {
    describe('Firefox', function () {
      const networkingFilters = [
        [
          'redirfallback',
          '/gen/redirfallback.js^$redirect=something_does_not_exist.js',
        ],
      ];

      let report;

      before(async function () {
        await prepareTestPage(networkingFilters);
        report = (await collectTestResults()).find(function (report) {
          return report.type === 'networking';
        });
      });

      describe('Networking', function () {
        for (const [id, filter] of networkingFilters) {
          it(filter, async function () {
            expect(report.results[id]).toBe(true);
          });
        }
      });
    });
  }
});
