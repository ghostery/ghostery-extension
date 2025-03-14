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
import { parse } from 'tldts-experimental';

import TabStats from '/store/tab-stats.js';

import { hasWTMStats } from '/utils/wtm-stats.js';
import { WTM_PAGE_URL } from '/utils/urls.js';
import { openTabWithUrl } from '/utils/tabs.js';

export default {
  [router.connect]: { dialog: true },
  stats: store(TabStats),
  domain: ({ stats }) => store.ready(stats) && parse(stats.hostname).domain,
  wtmLink: ({ domain }) =>
    domain && hasWTMStats(domain) ? `${WTM_PAGE_URL}/websites/${domain}` : '',
  render: ({ domain, wtmLink }) => html`
    <template layout="column">
      <panel-dialog>
        <ui-text slot="header" type="label-m" layout="padding:1:0">
          WhoTracks.Me Reports
        </ui-text>
        <div layout="column gap:2 padding:1:0">
          <ui-action>
            <a
              href="${chrome.runtime.getURL('/pages/whotracksme/index.html')}"
              onclick="${openTabWithUrl}"
              layout="row gap:2"
            >
              <ui-icon
                name="whotracksme"
                color="tertiary"
                layout="size:3"
              ></ui-icon>
              <div layout="column gap:0.5">
                <ui-text type="label-m">WhoTracks.Me Privacy Report</ui-text>
                <ui-text type="body-s" color="tertiary">
                  Generates a global transparency report on web tracking in your
                  Ghostery-protected browser.
                </ui-text>
              </div>
              <ui-icon name="chevron-right-s" color="quaternary"></ui-icon>
            </a>
          </ui-action>
          ${wtmLink &&
          html`
            <ui-action>
              <a
                href="${wtmLink}"
                onclick="${openTabWithUrl}"
                layout="row gap:2"
              >
                <ui-icon
                  name="stats-report"
                  color="tertiary"
                  layout="size:3"
                ></ui-icon>
                <div layout="column gap:0.5">
                  <ui-text type="label-m">
                    WhoTracks.Me Statistical Report
                  </ui-text>
                  <ui-text type="body-s" color="tertiary">
                    Displays unique insights into observed activities on
                    ${domain}, revealing affiliation, categories, and presence
                    across the site.
                  </ui-text>
                </div>
                <ui-icon
                  name="link-external-m"
                  color="quaternary"
                  layout="size:2"
                ></ui-icon>
              </a>
            </ui-action>
          `}
        </div>
      </panel-dialog>
    </template>
  `,
};
