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
import { mount, router, html, store } from 'hybrids';

import '/ui/index.js';

import TabStats from '/store/tab-stats.js';
import { getBrowser, getOS } from '/utils/browser-info.js';
import { getCurrentTab } from '/utils/tabs.js';

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

// Firefox Android 139+ lets a popup close itself only while its session history has
// exactly one entry (https://bugzilla.mozilla.org/show_bug.cgi?id=1959610). Each router
// navigation adds an entry, and no API can remove it again. So after a visit to the Menu,
// `window.close()` does nothing: "Hide content block" leaves the panel open, and links
// load inside the panel instead of a new tab.
//
// The router keeps its full view stack in `history.state`, so one entry is enough.
// A push replaces the state of that entry. `history.go(-n)` drops the top n views from
// the stack and fires `popstate`, which is what the router waits for.
//
// Trade-off: the Android back button now closes the panel from any view. It cannot go
// back one view, because that needs one history entry per view.
if (__FIREFOX__ && getOS() === 'android') {
  history.pushState = history.replaceState;
  history.go = (delta) => {
    history.replaceState(history.state.slice(-delta), '');
    dispatchEvent(new PopStateEvent('popstate'));
  };
}

// The views get the stats of the current tab from the router params
const tab = await getCurrentTab();

// Mount the app
mount(document.body, {
  stack: router(isWhatsNew ? [WhatsNew, Main] : [Main], { params: ['stats'] }),
  stats: store(TabStats, { id: () => tab?.id }),
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
