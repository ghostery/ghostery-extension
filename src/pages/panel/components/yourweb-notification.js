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

import { html } from 'hybrids';

import { openHref } from '/utils/tabs.js';

import badge from '../assets/yourweb-badge.svg';

const YOURWEB_URL = chrome.runtime.getURL('/pages/yourweb/index.html');

export default {
  render: () => html`
    <template layout="block padding:1:1.5:1.5">
      <ui-action>
        <a
          href="${YOURWEB_URL}"
          onclick="${openHref}"
          layout="row items:center gap:2 padding:1.5"
          data-qa="button:yourweb:notification"
        >
          <div id="illustration" layout="relative row center shrink:0 size:6:7 overflow">
            <div id="rings">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <img src="${badge}" alt="" layout="relative size:3.5" />
          </div>
          <div layout="column grow gap:0.25">
            <ui-text type="label-m">Your web, lately</ui-text>
            <ui-text type="body-s">
              View the web you built – by the numbers (Last 3 months)
            </ui-text>
          </div>
          <div id="action" layout="row center shrink:0 size:4">
            <ui-icon name="arrow-right-s" layout="size:2"></ui-icon>
          </div>
        </a>
      </ui-action>
    </template>
  `.css`
    a {
      background: var(--background-wtm-secondary);
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
    }

    #illustration {
      /* Matches the radial brand gradient anchored in the top-left corner of the design */
      background: radial-gradient(150% 238% at 0% 0%, #0092c3 0%, #2d3f9b 32%, #320065 100%);
      border-radius: 8px;
      box-shadow: 0px 2px 6px var(--shadow-card);
    }

    #rings {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    #rings div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
    }

    #rings div:nth-child(1) { width: 90px; height: 90px; }
    #rings div:nth-child(2) { width: 75px; height: 75px; }
    #rings div:nth-child(3) { width: 60px; height: 60px; }
    #rings div:nth-child(4) { width: 45px; height: 45px; }

    #action {
      background: var(--background-wtm-strong);
      border-radius: 50%;
      color: var(--color-onbrand);
    }
  `,
};
