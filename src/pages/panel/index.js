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
import { mount, router, html } from 'hybrids';

import '/ui/index.js';

import './elements.js';
import './styles.css';

import Main from './views/main.js';

// Mount the app
mount(document.body, {
  stack: router([Main]),
  render: ({ stack }) => html`
    <template layout="row width:full:350px">${stack}</template>
  `,
});

// Ping telemetry on panel open
chrome.runtime.sendMessage({ action: 'telemetry', event: 'engaged' });

// Sync options with background
chrome.runtime.sendMessage({ action: 'syncOptions' });

// Safari extension popup has a bug, which focuses visibly the first element on the page
// when the popup is opened. This is a workaround to remove the focus.
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

// Close window when anchor is clicked
document.addEventListener('click', (event) => {
  let el = event.target;
  while (el && !el.href) el = el.parentElement;

  if (!el) return;

  // Timeout is required to prevent from closing the window before the anchor is opened
  if (el.origin !== location.origin || el.pathname !== location.pathname) {
    setTimeout(window.close, 50);
  }
});
