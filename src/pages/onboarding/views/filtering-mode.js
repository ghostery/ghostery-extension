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

import { html, router, store } from 'hybrids';

import modeGhosteryScreenshotUrl from '/ui/assets/mode-ghostery.svg';
import modeZapScreenshotUrl from '/ui/assets/mode-zap.svg';

import Options, {
  FILTERING_MODE_GHOSTERY,
  FILTERING_MODE_ZAP,
} from '/store/options.js';

import { TERMS_AND_CONDITIONS_URL } from '/utils/urls.js';

import Success from './success.js';

export default {
  [router.connect]: {},
  options: store(Options),
  render: ({ options }) => html`
    <template layout="column gap:2 width:full::800px">
      <ui-card
        layout="contents gap:2"
        layout@390px="gap:3"
        layout@768px="column"
      >
        <section layout="block:center column gap" layout@390px="margin:2:0:1">
          <ui-text type="display-m" mobile-type="display-xs">
            Select filtering mode
          </ui-text>
          <ui-text type="body-m" mobile-type="body-s">
            Because no two people surf alike, we're giving you the power to pick
            how you want to experience the web.
          </ui-text>
        </section>
        <div layout="column gap" layout@768px="grid:2">
          <ui-filtering-mode
            checked="${options.filteringMode === FILTERING_MODE_GHOSTERY}"
          >
            <input
              type="radio"
              name="filtering-mode"
              value="${FILTERING_MODE_GHOSTERY}"
              checked="${options.filteringMode === FILTERING_MODE_GHOSTERY}"
              onchange="${html.set(options, 'filteringMode')}"
            />
            <img
              src="${modeGhosteryScreenshotUrl}"
              alt="Ghostery Mode"
              layout="ratio:83/45 width:220px"
              layout@768px="width:100%"
            />
            <ui-icon
              name="logo-in-box"
              layout="width:83px"
              layout@768px="width:138px"
            ></ui-icon>
            <ui-text>
              We block it all for you - ads, trackers, distractions. You’re
              fully covered, no setup needed.
            </ui-text>
            <ui-text type="label-s" slot="footer">
              Best for full coverage and privacy enthusiasts.
            </ui-text>
          </ui-filtering-mode>
          <ui-text
            type="display-2xs"
            uppercase
            layout="block:center margin:0.5:0"
            layout@768px="hidden"
          >
            <!-- Ghostery mode "or" ZAP mode -->
            or
          </ui-text>
          <ui-filtering-mode
            checked="${options.filteringMode === FILTERING_MODE_ZAP}"
          >
            <input
              type="radio"
              name="filtering-mode"
              value="${FILTERING_MODE_ZAP}"
              checked="${options.filteringMode === FILTERING_MODE_ZAP}"
              onchange="${html.set(options, 'filteringMode')}"
            />
            <img
              src="${modeZapScreenshotUrl}"
              alt="ZAP Mode"
              layout="ratio:83/45 width:220px"
              layout@768px="width:100%"
            />
            <ui-icon
              name="logo-zap"
              layout="width:83px"
              layout@768px="width:116px"
            ></ui-icon>
            <ui-text>
              You zap ads away, one site at a time. One button, one page, and
              you build your own ad-free list.
            </ui-text>
            <ui-text type="label-s" slot="footer">
              Best for beginners or sharing with family.
            </ui-text>
          </ui-filtering-mode>
        </div>
        <div layout="column gap:2">
          <ui-button
            type="success"
            layout="height:5.5"
            data-qa="button:continue"
          >
            <a href="${router.url(Success)}">Continue</a>
          </ui-button>
        </div>
      </ui-card>
      <ui-button type="transparent" layout="self:center">
        <a href="${TERMS_AND_CONDITIONS_URL}" target="_blank">
          Terms & Conditions
        </a>
      </ui-button>
    </template>
  `,
};
