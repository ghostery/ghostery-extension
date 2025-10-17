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

import TabStats from '/store/tab-stats.js';
import Config from '/store/config.js';

import { openTabWithUrl } from '/utils/tabs.js';
import { PAUSE_ASSISTANT_LEARN_MORE_URL } from '/utils/urls.js';

export default {
  [router.connect]: { dialog: true },
  stats: store(TabStats),
  config: store(Config),
  issueUrl: ({ stats, config }) =>
    store.ready(stats, config) &&
    Object.entries(config.domains).find(([domain]) =>
      stats.hostname.includes(domain),
    )?.[1].issueUrl,
  render: ({ issueUrl }) => html`
    <template layout="column">
      <panel-dialog>
        <ui-text slot="header" type="label-m" layout="padding:1:0">
          Paused by Browsing Assistant
        </ui-text>
        <div layout="column gap:2 padding:1:0">
          ${issueUrl &&
          html`
            <ui-action>
              <a
                href="${issueUrl}"
                onclick="${openTabWithUrl}"
                layout="row gap:2"
              >
                <ui-icon
                  name="doc-m"
                  color="tertiary"
                  layout="size:3"
                ></ui-icon>
                <div layout="column grow gap:0.5">
                  <ui-text type="label-m">Broken page report</ui-text>
                  <ui-text type="body-s" color="tertiary">
                    Detailed analysis report highlighting key metrics on
                    trackers and advertisements associated with the website.
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
          <ui-action>
            <a
              href="${PAUSE_ASSISTANT_LEARN_MORE_URL}"
              onclick="${openTabWithUrl}"
              layout="row gap:2"
            >
              <ui-icon name="info" color="tertiary" layout="size:3"></ui-icon>
              <div layout="column grow gap:0.5">
                <ui-text type="label-m">How browsing assistant works</ui-text>
                <ui-text type="body-s" color="tertiary">
                  Discover more insights on the Ghostery blog.
                </ui-text>
              </div>
              <ui-icon
                name="link-external-m"
                color="quaternary"
                layout="size:2"
              ></ui-icon>
            </a>
          </ui-action>
        </div>
      </panel-dialog>
    </template>
  `,
};
