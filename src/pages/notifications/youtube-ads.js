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

import { mount, html, msg } from 'hybrids';
import '/ui/index.js';

import * as notifications from '/utils/notifications.js';
import { getCurrentTab } from '/utils/tabs.js';

const close = notifications.setupNotificationPage(390);

async function openExtensionSettings() {
  const currentTab = await getCurrentTab();

  await chrome.runtime.sendMessage({
    action: 'openTabWithUrl',
    url: `chrome://extensions/?id=${chrome.runtime.id}`,
  });

  // on focus to current tab close the notification
  if (currentTab?.id) {
    chrome.tabs.onActivated.addListener(function listener(activeInfo) {
      if (activeInfo.tabId === currentTab.id) {
        chrome.tabs.onActivated.removeListener(listener);

        close();
        chrome.runtime.reload();
      }
    });
  }
}

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-notification-dialog onclose="${close}">
        <span slot="title">YouTube ads getting through?</span>
        <ui-text color="secondary">
          Blocking them needs a browser permission that’s off by default. Once you grant it,
          Ghostery can do a lot more on YouTube.
        </ui-text>
        <ui-text color="secondary">
          ${msg.html`
            Enable <strong>“Allow User Scripts”</strong> in your extension settings and refresh the page.
          `}
        </ui-text>
        <div layout="row gap">
          <ui-button type="success" size="s" onclick="${openExtensionSettings}">
            <button>Grant permission</button>
          </ui-button>

          <ui-button type="transparent" size="s" onclick="${close}">
            <button>Maybe later</button>
          </ui-button>
        </div>
      </ui-notification-dialog>
    </template>
  `,
});
