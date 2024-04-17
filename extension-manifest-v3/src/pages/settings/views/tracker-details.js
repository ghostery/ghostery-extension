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
import * as labels from '@ghostery/ui/labels';

import Tracker from '../store/tracker.js';
import assets from '../assets/index.js';

import { updateException } from './trackers.js';

export default {
  tracker: store(Tracker),
  content: ({ tracker }) => html`
    <template layout="contents">
      <gh-settings-page-layout>
        <div layout="column gap">
          <ui-action>
            <a href="${router.backUrl()}" layout="self:start padding">
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
                <div layout="column gap grow">
                  <ui-text type="label-l">Protection status</ui-text>
                  <ui-text type="body-m" color="gray-600">
                    Modify the recommended blocking settings for every website.
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
              <div layout="column gap:2">
                <ui-text type="label-l">Website exceptions</ui-text>
                <gh-settings-table>
                  <div slot="header" layout="grid:2 gap:4">
                    <ui-text type="label-m"> Website </ui-text>
                    <ui-text type="label-m"> Protection status </ui-text>
                  </div>
                </gh-settings-table>
              </div>
            </div>
          `}
        </div>
      </gh-settings-page-layout>
    </template>
  `,
};
