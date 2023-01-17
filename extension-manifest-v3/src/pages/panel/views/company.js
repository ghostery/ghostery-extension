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
import { categories } from '@ghostery/ui/labels';
import Stats, { Company } from '/store/stats';

function cleanUp(text) {
  return text.replace(/(\\"|\\n|\\t|\\r)/g, '').trim();
}

export default {
  [router.connect]: { dialog: true },
  tag: 'gh-panel-company-view',
  company: store(Company),
  stats: store(Stats),
  trackers: ({ company, stats }) =>
    store.ready(stats) && stats.trackers.filter((t) => t.company === company),
  trackersByCategory: ({ trackers }) => [
    ...trackers.reduce((acc, t) => {
      const list = acc.get(t.category) || [];
      list.push(t);
      return acc.set(t.category, list);
    }, new Map()),
  ],
  wtmUrl: ({ company }) =>
    `https://www.whotracks.me/trackers/${company.id}.html`,
  content: ({ company, trackers, trackersByCategory, wtmUrl }) => html`
    <template layout="column">
      <gh-panel-dialog>
        <ui-text slot="header" type="label-l">${company.name}</ui-text>
        ${trackers &&
        html`
          <ui-text slot="header" type="body-s" color="gray-600">
            trackers: ${trackers.length}
          </ui-text>
          ${company.description &&
          html`
            <div layout="column gap:0.5">
              <ui-text type="body-s">${cleanUp(company.description)}</ui-text>
              ${wtmUrl &&
              html`
                <ui-text type="label-xs" color="primary-700">
                  <a href="${wtmUrl}" target="_blank">
                    Read more on WhoTracks.me
                  </a>
                </ui-text>
              `}
            </div>
            <ui-line></ui-line>
          `}
          <section
            layout="
              grid:max|1 items:start:stretch content:start gap:1:3
              grow:1
              padding:bottom:4
            "
          >
            <ui-icon name="shield"></ui-icon>
            <div layout="column gap">
              <ui-text type="label-s">Trackers detected</ui-text>
              <div layout="column gap:2">
                ${trackersByCategory.map(
                  ([category, list]) => html`
                    <div layout="column gap">
                      <div layout="column gap:0.5">
                        <ui-text type="label-s" color="gray-600">
                          ${categories[category]}
                        </ui-text>

                        <ui-line></ui-line>
                      </div>
                      ${list.map(
                        ({ url }) =>
                          html`
                            <div
                              layout="row content:space-between items:center"
                            >
                              <ui-text type="body-s" color="gray-600" ellipsis>
                                ${url}
                              </ui-text>
                              <gh-panel-copy text="${url}"></gh-panel-copy>
                            </div>
                          `,
                      )}
                    </div>
                  `,
                )}
              </div>
            </div>
            ${company.website &&
            html`
              <ui-icon name="globe"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-s">Website</ui-text>
                <ui-text
                  type="body-s"
                  color="primary-700"
                  ellipsis
                  layout="padding margin:-1"
                >
                  <a href="${company.website}" target="_blank">
                    ${company.website}
                  </a>
                </ui-text>
              </div>
            `}
            ${company.privacyPolicy &&
            html`
              <ui-icon name="privacy"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-s">
                  <!-- | Panel Company -->Privacy policy
                </ui-text>
                <ui-text
                  type="body-s"
                  color="primary-700"
                  ellipsis
                  layout="padding margin:-1"
                >
                  <a href="${company.privacyPolicy}" target="_blank">
                    ${company.privacyPolicy}
                  </a>
                </ui-text>
              </div>
            `}
            ${company.contact &&
            html`
              <ui-icon name="mail"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-s">Contact</ui-text>
                <div layout="row content:space-between items:center">
                  <ui-text
                    type="body-s"
                    color="primary-700"
                    ellipsis
                    layout="padding margin:-1"
                  >
                    <a
                      href="${company.contact.startsWith('http')
                        ? ''
                        : 'mailto:'}${company.contact}"
                      target="_blank"
                    >
                      ${company.contact}
                    </a>
                  </ui-text>
                  ${!company.contact.startsWith('http') &&
                  html`
                    <gh-panel-copy text="${company.contact}"></gh-panel-copy>
                  `}
                </div>
              </div>
            `}
          </section>
        `}
      </gh-panel-dialog>
    </template>
  `,
};
