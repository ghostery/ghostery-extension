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

import { store } from 'hybrids';
import { parse } from 'tldts-experimental';

import Tracker from '/store/tracker.js';
import { getTrackerByURL } from '/utils/trackerdb.js';

const Target = {
  url: '',
  hostname: '',
  tracker: Tracker,
  [store.connect]: async () => {
    let url = '';

    if (__FIREFOX__) {
      const params = new URLSearchParams(window.location.search);
      const encodedUrl = params.get('url');

      try {
        url = atob(encodedUrl);
      } catch (e) {
        console.error('[redirect-protection] Failed to decode URL:', e);
      }
    } else {
      const response = await chrome.runtime.sendMessage({
        action: 'getRedirectUrl',
      });
      url = response.url;
    }

    return {
      url,
      hostname: url && parse(url).hostname,
      tracker: url && (await getTrackerByURL(url)),
    };
  },
};

export default Target;
