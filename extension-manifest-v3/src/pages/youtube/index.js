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

import '@ghostery/ui/youtube';
import { setupIframe, closeIframe } from '@ghostery/ui/iframe';

function dontAsk() {
  chrome.storage.local.set({
    youtubeDontAsk: true,
  });
  closeIframe();
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
  closeIframe();
}

setupIframe();

mount(document.body, {
  render: () => html`
    <template layout="block">
      <ui-youtube-wall
        onclose="${() => closeIframe()}"
        ondontask="${() => dontAsk()}"
        onopenblog1="${() => openBlog('enable-extensions-in-incognito')}"
        onopenblog2="${() => openBlog('whats-happening-with-youtube-ads')}"
        onopenprivatewindow="${openPrivateWindow}"
      ></ui-youtube-wall>
    </template>
  `,
});
