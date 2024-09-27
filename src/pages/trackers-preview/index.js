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
import { getWTMStats } from '/utils/wtm-stats.js';

import '/ui/index.js';
import './elements.js';

function close() {
  window.parent.postMessage('WTMReportClosePopups', '*');
}

function disable() {
  window.parent.postMessage('WTMReportDisable', '*');
}

const domain = new URLSearchParams(window.location.search).get('domain');

// The page attached in the iframe is a child of the parent window
if (window.parent !== window) {
  const resizeObserver = new ResizeObserver(() => {
    const height = document.body.clientHeight;
    window.parent.postMessage(`WTMReportResize:${height}`, '*');
  });
  resizeObserver.observe(document.body, {
    box: 'border-box',
  });
}

mount(document.body, {
  render: () => html`
    <template layout="block">
      <trackers-preview-layout
        stats="${getWTMStats(domain)}"
        domain="${domain}"
        onclose="${close}"
        ondisable="${disable}"
      ></trackers-preview-layout>
    </template>
  `,
});
