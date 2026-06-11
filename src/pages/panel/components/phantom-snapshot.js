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

import { getCategoryBgColor, sortCategories } from '/ui/categories.js';
import { numberFormatter } from '/ui/labels.js';

const BAR_HEIGHT = 92;

function segments(categories) {
  return Object.entries(categories)
    .sort(sortCategories((entry) => entry[0]))
    .map(([category, count]) => ({ color: getCategoryBgColor(category), count }));
}

export default {
  bars: undefined,
  domain: '',
  render: ({ bars = [], domain }) => {
    const max = Math.max(1, ...bars.map((bar) => bar.total));
    return html`
      <template layout="block">
        <div class="card" layout="column gap:1 padding:1.5">
          <div layout="row items:center content:space-between">
            <div class="title">Activities Ghostery handled</div>
            <ui-tooltip>
              <span slot="content">
                Phantom activities would load without Ghostery. Blocking key trackers keeps them off
                the page — more privacy and faster loading. Estimated from WhoTracks.Me data for
                ${domain}.
              </span>
              <ui-icon name="info" color="base-white" layout="size:2"></ui-icon>
            </ui-tooltip>
          </div>
          <div layout="row gap:0.5">
            ${bars.map(
              (bar) => html`
                <div class="track" layout="column grow items:center gap:0.5 padding:1">
                  <div class="value">${numberFormatter.format(bar.total)}</div>
                  <div class="label">${bar.label}</div>
                  <div class="region" style="${{ height: `${BAR_HEIGHT}px` }}">
                    <div class="bar" style="${{ height: `${(bar.total / max) * BAR_HEIGHT}px` }}">
                      ${segments(bar.categories).map(
                        (segment) =>
                          html`<div
                            class="segment"
                            style="${{ flex: segment.count, background: segment.color }}"
                          ></div>`,
                      )}
                    </div>
                  </div>
                </div>
              `,
            )}
          </div>
        </div>
      </template>
    `.css`
      .card {
        background: var(--color-wtm-900);
        border-radius: 12px;
        color: var(--color-base-white);
      }

      .title {
        font: var(--font-label-s);
        opacity: 0.65;
      }

      ui-icon {
        opacity: 0.65;
      }

      .track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
      }

      .value {
        font: var(--font-display-s);
      }

      .label {
        font: var(--font-label-xs);
        text-transform: uppercase;
        opacity: 0.6;
        text-align: center;
      }

      .region {
        width: 36px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }

      .bar {
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 100%;
      }

      .segment {
        border-radius: 2px;
        min-height: 3px;
      }
    `;
  },
};
