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
import '../../utils/shims.js';

import '@ghostery/ui/panel';
import { define } from 'hybrids';

define.from(import.meta.glob('./**/*.js', { eager: true, import: 'default' }), {
  root: ['components', 'views'],
  prefix: 'gh-panel',
});

/* Ping telemetry on panel open */
chrome.runtime.sendMessage({ action: 'telemetry', event: 'engaged' });

/*
  Safari extension popup has a bug, which focuses visibly the first element on the page
  when the popup is opened. This is a workaround to remove the focus.
*/
if (__PLATFORM__ === 'safari') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.focus();
      document.body.addEventListener(
        'focus',
        () => {
          document.body.removeAttribute('tabIndex');
        },
        { once: true },
      );
    }, 100);
  });
}

/*
  Firefox extension popup has a bug, which does not closes the popup when an anchor is clicked.
*/
if (__PLATFORM__ === 'firefox') {
  // Close window when anchor is clicked
  document.addEventListener('click', (event) => {
    let el = event.target;
    while (el && !el.href) el = el.parentElement;

    if (el?.target) requestIdleCallback(window.close);
  });
}
