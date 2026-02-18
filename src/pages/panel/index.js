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
import { getBrowser, getOS } from '/utils/browser-info.js';

// Mount the app
mount(document.body, {
  stack: router([Main]),
  browserName: { value: getBrowser().name, reflect: true },
  platformName: { value: getOS(), reflect: true },
  render: ({ stack }) => html`
    <template layout="row">
      <div id="alert-container" layout="fixed inset:1 top:0.5 bottom:auto layer:500"></div>
      ${stack}
    </template>
  `,
});

// Ping telemetry on panel open
chrome.runtime.sendMessage({ action: 'telemetry', event: 'engaged' });

// Sync options with background
chrome.runtime.sendMessage({ action: 'syncOptions' });
