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

import { html, router, store, msg } from 'hybrids';
import * as labels from '@ghostery/ui/labels';

import Tracker from '../store/tracker.js';
import assets from '../assets/index.js';

import Trackers, { updateException } from './trackers.js';
import TrackerAddException from './tracker-add-exception.js';

function removeDomain(domain) {
  return ({ tracker, listType }) => {
    store.set(tracker.exception, {
      [listType]: tracker.exception[listType].filter((d) => d !== domain),
    });
  };
}

export default {
  [router.connect]: { stack: [TrackerAddException] },
  tracker: store(Tracker),
  listType: ({ tracker }) =>
    tracker.exception.overwriteStatus === tracker.blockedByDefault
      ? 'blocked'
      : 'allowed',
  domains: (host) =>
    (store.ready(host.tracker) && host.tracker.exception[host.listType]) || [],
  content: ({ tracker, domains }) => html`
    <template layout="contents">
      <gh-settings-page-layout>
        <div layout="column gap">
          <ui-action>
            <a href="${router.url(Trackers)}" layout="self:start padding">
              <ui-text type="label-s" layout="row gap items:center">
                <ui-icon name="chevron-left"></ui-icon> Back
              </ui-text>
            </a>
          </ui-action>
          ${store.ready(tracker) &&
          html`
            <div layout="column gap:5">
              <div layout="column gap">
                <ui-text type="headline-m">${tracker.name}</ui-text>
                <div layout="row gap:3 items:center">
                  <div layout="row items:center gap">
                    <ui-panel-category-icon
                      name="${tracker.category}"
                      layout="size:3 padding:0.5"
                    ></ui-panel-category-icon>
                    <ui-text type="body-l" color="gray-500">
                      ${labels.categories[tracker.category]}
                    </ui-text>
                  </div>
                  ${tracker.organization &&
                  html`
                    <div layout="row items:center gap">
                      <ui-panel-category-icon
                        name="organization"
                        layout="size:3 padding:0.5"
                      ></ui-panel-category-icon>
                      <ui-text type="body-l" color="gray-500">
                        ${tracker.organization.name}
                      </ui-text>
                    </div>
                  `}
                </div>
              </div>
              <div layout="row gap:5 items:start">
                <gh-settings-help-image
                  static
                  layout="hidden"
                  layout@768px="block"
                >
                  <img
                    src="${assets.selective_blocking}"
                    alt="Selective blocking"
                  />
                </gh-settings-help-image>
                <div layout="column items:start gap:2 grow">
                  <div layout="row gap:2 items:start">
                    <div layout="column gap:0.5">
                      <ui-text type="label-l">Protection status</ui-text>
                      <ui-text type="body-m" color="gray-600">
                        Modify the recommended blocking settings for every
                        website.
                      </ui-text>
                    </div>

                    <ui-panel-protection-status-toggle
                      value="${tracker.exception.overwriteStatus}"
                      blockByDefault="${tracker.blockedByDefault}"
                      responsive
                      onchange="${updateException(tracker)}"
                      layout="shrink:0"
                    ></ui-panel-protection-status-toggle>
                  </div>
                  <gh-settings-badge
                    type="primary"
                    layout="row content:start padding"
                  >
                    <ui-icon name="info-filled"></ui-icon>
                    ${tracker.blockedByDefault
                      ? msg`Our recommendation for this activity: Blocked`
                      : msg`Our recommendation for this activity: Trusted`}
                  </gh-settings-badge>
                </div>
              </div>
              <div layout="column gap:2">
                <div layout="row gap items:center content:space-between">
                  <ui-text type="label-l">Website exceptions</ui-text>
                  <ui-button size="small">
                    <a href="${router.url(TrackerAddException, { tracker })}">
                      Add
                    </a>
                  </ui-button>
                </div>
                <gh-settings-table>
                  <div slot="header" layout="grid:2 gap:4">
                    <ui-text type="label-m"> Website </ui-text>
                    <ui-text type="label-m"> Protection status </ui-text>
                  </div>

                  ${domains.map(
                    (domain) => html`
                      <div layout="grid:2 items:center:stretch gap:4">
                        <ui-text>${domain}</ui-text>
                        <div layout="row content:space-between gap">
                          <gh-settings-protection-badge
                            blocked="${tracker.exception.overwriteStatus ===
                            tracker.blockedByDefault}"
                          ></gh-settings-protection-badge>
                          <ui-action>
                            <button
                              layout@768px="order:1 padding:0.5"
                              onclick="${removeDomain(domain)}"
                            >
                              <ui-icon
                                name="trash"
                                layout="size:3"
                                color="gray-400"
                              ></ui-icon>
                            </button>
                          </ui-action>
                        </div>
                      </div>
                    `,
                  )}
                </gh-settings-table>
                ${!domains.length &&
                html`
                  <div layout="column center gap padding:5:0">
                    <ui-icon
                      name="no-websites"
                      layout="size:4"
                      color="gray-400"
                    ></ui-icon>
                    <ui-text layout="block:center width:::180px">
                      No websites exceptions added yet
                    </ui-text>
                  </div>
                `}
              </div>
            </div>
          `}
        </div>
      </gh-settings-page-layout>
    </template>
  `,
};
