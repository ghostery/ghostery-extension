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

const close = notifications.setupNotificationPage(460);

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
  close(false);
}

mount(document.body, {
  render: () => html`
    <template layout="block overflow">
      <ui-card layout="padding:2">
        <div layout="row items:start gap:2">
          <div layout="relative">
            <ui-icon name="ghosty" color="gray-300" layout="size:4"></ui-icon>
            <ui-icon
              name="alert"
              color="error-500"
              layout="absolute bottom:-1 right:-1"
            ></ui-icon>
          </div>
          <div layout="column gap:1.5">
            <div layout="margin:bottom:-1 row">
              <ui-text type="label-m">
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
                      color="gray-400"
                      layout="size:3"
                    ></ui-icon>
                  </div>
                </button>
              </ui-action>
            </div>
            <ui-text type="body-s">
              We know you rely on Ghostery for a smooth YouTube experience.
              Until a more refined solution emerges, here’s a temporary fix.
            </ui-text>
            <div layout="column gap">
              <div layout="row gap:0.5">
                <ui-text type="label-m">
                  <span translate="no">1.</span> Allow Ghostery in private
                  windows
                </ui-text>
              </div>
              <div layout="row">
                <ui-button>
                  <button
                    onclick="${() =>
                      openBlog('enable-extensions-in-incognito')}"
                  >
                    Learn how
                  </button>
                </ui-button>
              </div>
            </div>
            <div layout="column gap">
              <div layout="row gap:0.5">
                <ui-text type="label-m">
                  <span translate="no">2.</span> Open YouTube in a private
                  window
                </ui-text>
              </div>
              <div layout="row">
                <ui-button type="success">
                  <button onclick="${openPrivateWindow}">Open video</button>
                </ui-button>
              </div>
            </div>
            <ui-line></ui-line>
            <div layout="column gap:2">
              <ui-text type="body-s">
                Learn more about YouTube’s challenges to ad blockers
              </ui-text>
              <div layout="row:wrap gap">
                <ui-button>
                  <button
                    onclick="${() =>
                      openBlog('whats-happening-with-youtube-ads')}"
                  >
                    Visit our blog
                  </button>
                </ui-button>
                <ui-button type="transparent">
                  <button onclick="${dontAsk}">Don't ask again</button>
                </ui-button>
              </div>
            </div>
          </div>
        </div>
      </ui-card>
    </template>
  `,
});
