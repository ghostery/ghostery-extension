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

import { html, define } from 'hybrids';
import { t } from '/vendor/@whotracksme/ui/src/i18n.js';

export default define({
  tag: 'gh-panel-page-load',
  loadTime: {
    get: (_, val = 0) => val,
    set: (_, val) => Math.round(val),
  },
  color: ({ loadTime }) => {
    if (loadTime < 100) {
      return '#779D3E';
    } else if (loadTime < 500) {
      return '#BB9556';
    } else {
      return '#8D4144';
    }
  },
  render: ({ loadTime, color }) => html`
    <div class="info">${t('page_load')}</div>
    <div class="circle">
      <svg
        width="73"
        height="72"
        viewBox="0 0 73 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="36.5003"
          cy="36.2249"
          r="30.7273"
          stroke="currentColor"
          stroke-width="10"
          stroke-dasharray="1 3"
        />
      </svg>
      <strong>${loadTime}</strong>
    </div>
    <div></div>
  `.css`
    :host {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      margin-top: 13px;
    }

    .info {
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
      color: var(--black);
      font-size: 13px;
    }

    .circle {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
    }

    .circle {
      color: ${loadTime !== 0 ? color : 'var(--text)'};
    }

    .circle::after {
      content: 'ms';
      display: block;
      position: absolute;
      top: calc(50% - 7px);
      font-size: 13px;
      line-height: 13px;
      right: -6px;
      color: var(--black);
    }

    strong {
      display: block;
      position: absolute;
      top: calc(50% - 12px);
      color: var(--black);
      font-size: 18px;
      line-height: 25px;
      font-weight: 600;
      text-align: center;
    }
  `,
});
