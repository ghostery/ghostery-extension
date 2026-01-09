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

import { mount, html } from 'hybrids';
import '/ui/index.js';

import * as notifications from '/utils/notifications.js';

const close = notifications.setupNotificationPage(420);

function dontAsk() {
  chrome.storage.local.set({ youtubeDontAsk: true });
  close();
}

function openBlog(slug) {
  chrome.runtime.sendMessage({
    action: 'openTabWithUrl',
    url: `https://www.ghostery.com/blog/${slug}?utm_source=gbe&utm_campaign=youtube`,
  });
}

function openPrivateWindow() {
  chrome.runtime.sendMessage({
    action: 'openPrivateWindowWithUrl',
    url: new URLSearchParams(window.location.search).get('url'),
  });

  // Close the notification, but only from the current tab
  close({ clear: false });
}

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-notification>
        <div layout="column gap:1.5">
          <div layout="row gap">
            <ui-text type="label-l">
              YouTube blocking you from watching ad-free videos?
            </ui-text>
            <ui-action>
              <button
                id="close"
                onclick="${() => close()}"
                layout="margin:-1 self:start shrink:0 padding"
              >
                <div layout="row center size:3">
                  <ui-icon
                    name="close"
                    color="tertiary"
                    layout="size:3"
                  ></ui-icon>
                </div>
              </button>
            </ui-action>
          </div>
          <ui-text type="body-s">
            We know you rely on Ghostery for a smooth YouTube experience. Until
            a more refined solution emerges, here’s a temporary fix.
          </ui-text>
          <div layout="column gap">
            <div layout="row gap:0.5">
              <ui-text type="label-m">
                <span translate="no">1.</span> Allow Ghostery in private windows
              </ui-text>
            </div>
            <div layout="row">
              <ui-button
                size="s"
                onclick="${() => openBlog('enable-extensions-in-incognito')}"
              >
                <button>Learn how</button>
              </ui-button>
            </div>
          </div>
          <div layout="column gap">
            <div layout="row gap:0.5">
              <ui-text type="label-m">
                <span translate="no">2.</span> Open YouTube in a private window
              </ui-text>
            </div>
            <div layout="row">
              <ui-button size="s" type="success" onclick="${openPrivateWindow}">
                <button>Open video</button>
              </ui-button>
            </div>
          </div>
          <ui-line></ui-line>
          <div layout="column gap:2">
            <ui-text type="body-s">
              Learn more about YouTube’s challenges to ad blockers
            </ui-text>
            <div layout="row:wrap gap">
              <ui-button
                size="s"
                onclick="${() => openBlog('whats-happening-with-youtube-ads')}"
              >
                <button>Visit our blog</button>
              </ui-button>
              <ui-button size="s" type="transparent" onclick="${dontAsk}">
                <button>Don't ask again</button>
              </ui-button>
            </div>
          </div>
        </div>
      </ui-notification>
    </template>
  `,
});
