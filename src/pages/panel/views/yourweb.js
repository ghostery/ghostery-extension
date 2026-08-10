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

import { html, msg, router, store } from 'hybrids';

import { numberFormatter } from '/ui/labels.js';

import { MergedStats } from '/store/daily-stats.js';

import { openHref } from '/utils/tabs.js';
import { getPeriod } from '/utils/yourweb.js';

import Main from './main.js';

const { dateFrom, dateTo } = getPeriod();

const YOURWEB_URL = chrome.runtime.getURL('/pages/yourweb/index.html');

export default {
  mergedStats: store(MergedStats, { id: () => ({ dateFrom, dateTo }) }),
  render: ({ mergedStats }) => html`
    <template layout="column grow">
      <panel-yourweb-header>Your web, lately</panel-yourweb-header>
      <panel-container>
        <div layout="column padding:0:1.5:1">
          <panel-yourweb-stats
            value="${store.ready(mergedStats) ? numberFormatter.format(mergedStats.trackers.length) : ''}"
            label="${msg`Observed activities`}"
          >
            <div layout="row items:center gap:0.5">
              <ui-icon name="calendar-days" color="tertiary" layout="size:2"></ui-icon>
              <ui-text type="label-s">Last 3 months</ui-text>
            </div>
            <div layout="row items:center gap:0.5">
              <ui-icon name="globe" color="tertiary" layout="size:2"></ui-icon>
              <ui-text type="label-s">All sites</ui-text>
            </div>
          </panel-yourweb-stats>
        </div>
      </panel-container>
      <panel-yourweb-actions>
        <div layout="row center gap padding:1:0.5">
          <ui-icon name="category-organization" color="brand-primary" layout="size:2.5"></ui-icon>
          <ui-text type="label-m" color="brand-primary" layout="block:center">
            And we found who wanted your data...
          </ui-text>
        </div>
        <ui-button type="primary" layout="height:6">
          <a href="${YOURWEB_URL}" onclick="${openHref}" data-qa="button:yourweb:recap">
            See your recap
          </a>
        </ui-button>
        <ui-button layout="height:6">
          <a href="${router.url(Main)}" data-qa="button:yourweb:close">Close</a>
        </ui-button>
      </panel-yourweb-actions>
    </template>
  `,
};
