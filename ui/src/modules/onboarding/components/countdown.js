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

const DAYS_IN_MS = 86400000;
const HOURS_IN_MS = 3600000;

export default {
  timestamp: 0,
  countdown: ({ timestamp }) => {
    const now = Date.now();
    const diff = timestamp - now;

    if (!timestamp || diff < 0) return null;

    const days = Math.floor(diff / DAYS_IN_MS);
    const hours = Math.ceil((diff % DAYS_IN_MS) / HOURS_IN_MS);

    return {
      days: String(days + (hours === 24 ? 1 : 0)).padStart(2, 0),
      hours: String(hours === 24 ? 0 : hours).padStart(2, 0),
    };
  },
  render: ({ countdown }) =>
    countdown
      ? html`
          <template layout="row items:center gap:0.5 padding:2">
            <ui-text
              type="label-m"
              color="gray-600"
              layout="grow margin:right:1.5"
            >
              <slot></slot>
            </ui-text>
            <div
              class="countdown"
              layout="column items:center gap:0.5 padding:0.5:2"
            >
              <ui-text type="display-m">${countdown.days}</ui-text>
              <ui-text type="label-s">days</ui-text>
            </div>
            <div
              class="countdown"
              layout="column items:center gap:0.5  padding:0.5:2"
            >
              <ui-text type="display-m">${countdown.hours}</ui-text>
              <ui-text type="label-s">hours</ui-text>
            </div>
          </template>
        `.css`
          :host {
            background: var(--ui-color-gray-100);
            border-radius: 8px;
          }

          .countdown {
            background: var(--ui-color-white);
            border: 1px solid var(--ui-color-gray-200);
            border-radius: 8px;
          }
        `
      : html``.css`:host { display: none }`,
};
