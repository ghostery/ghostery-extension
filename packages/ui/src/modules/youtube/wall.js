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

const SELECTORS = [
  // Based on https://github.com/AdguardTeam/AdguardFilters/blob/e5ae8e3194f8d18bdcc660d4c42282e4a96ca5b9/AnnoyancesFilter/Popups/sections/antiadblock.txt#L2044
  'ytd-watch-flexy:not([hidden]) ytd-enforcement-message-view-model > div.ytd-enforcement-message-view-model',

  'yt-playability-error-supported-renderers#error-screen ytd-enforcement-message-view-model',
  'tp-yt-paper-dialog .ytd-enforcement-message-view-model',
];

export default function detectWall(cb) {
  let currentHref = '';

  const observer = new MutationObserver(() => {
    if (currentHref === location.href) return;
    currentHref = location.href;

    if (document.querySelector(SELECTORS)?.clientHeight > 0) {
      cb();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ['src', 'style'],
    });
  });
}
