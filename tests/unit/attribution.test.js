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

import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import detectAttribution from '../../src/background/telemetry/attribution.js';

const GHOSTERY_TAB = { id: 1, url: 'https://www.ghostery.com/' };

function stubChrome({ tabs = [], sessionStorage = null, cookie = null }) {
  chrome.tabs = {
    query: async () => tabs,
  };
  chrome.scripting = {
    executeScript: async () => [{ result: sessionStorage }],
  };
  chrome.cookies = {
    getAllCookieStores: async () => [],
    get: async () => (cookie ? { value: cookie } : null),
  };
}

describe('detectAttribution', () => {
  afterEach(() => {
    delete chrome.tabs;
    delete chrome.scripting;
    delete chrome.cookies;
  });

  it('reads attribution from session storage without a source suffix', async () => {
    stubChrome({ tabs: [GHOSTERY_TAB], sessionStorage: 's=source&c=campaign' });

    assert.deepEqual(await detectAttribution(), {
      utm_source: 'source',
      utm_campaign: 'campaign',
    });
  });

  it('marks cookie attribution with a _c source suffix', async () => {
    stubChrome({ tabs: [], cookie: 's=source&c=campaign' });

    assert.deepEqual(await detectAttribution(), {
      utm_source: 'source_c',
      utm_campaign: 'campaign',
    });
  });

  it('prefers session storage over the cookie', async () => {
    stubChrome({
      tabs: [GHOSTERY_TAB],
      sessionStorage: 's=session&c=session-campaign',
      cookie: 's=cookie&c=cookie-campaign',
    });

    assert.deepEqual(await detectAttribution(), {
      utm_source: 'session',
      utm_campaign: 'session-campaign',
    });
  });

  it('falls back to UTM params when neither source is present', async () => {
    stubChrome({
      tabs: [
        {
          id: 2,
          url: 'https://www.ghostery.com/?utm_source=utm&utm_campaign=utm-campaign',
        },
      ],
      sessionStorage: null,
      cookie: null,
    });

    assert.deepEqual(await detectAttribution(), {
      utm_source: 'utm',
      utm_campaign: 'utm-campaign',
    });
  });
});
