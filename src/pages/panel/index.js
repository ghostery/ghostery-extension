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

import { getBrowser, getOS } from '/utils/browser-info.js';

import './elements.js';
import './styles.css';

import Main from './views/main.js';
import WhatsNew from './views/whats-new.js';

const isWhatsNew = new URL(window.location.href).searchParams.has('whatsNew');

// The background may not restore the default popup if it is terminated while opening it
if (isWhatsNew) {
  (chrome.action || chrome.browserAction).setPopup({
    popup: chrome.runtime.getURL('/pages/panel/index.html'),
  });
} else {
  // Ping telemetry 'engaged' signal on panel being opened by the user
  chrome.runtime.sendMessage({ action: 'telemetry:ping', event: 'engaged' });

  // Sync options with background
  chrome.runtime.sendMessage({ action: 'syncOptions' });
}

// Mount the app
mount(document.body, {
  stack: router(isWhatsNew ? [WhatsNew, Main] : [Main]),
  browserName: { value: getBrowser().name, reflect: true },
  platformName: { value: getOS(), reflect: true },
  render: ({ stack }) => html`
    <template layout="row">
      <div id="alert-container" layout="fixed inset:1 top:1 bottom:auto layer:500"></div>
      ${stack}
    </template>
  `,
});

// This code keeps the services worker alive while the panel is open to ensure that
// pausing the website triggers an update keeping the old value of the option.
// If the SW would be restarts because of the option change, the options observers
// run as it would be a cold start.
setInterval(() => chrome.runtime.sendMessage({ action: 'keepAlive' }), 15000);
