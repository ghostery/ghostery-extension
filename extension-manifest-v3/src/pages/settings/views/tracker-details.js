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

import Tracker from '/store/tracker.js';
import { openTabWithUrl } from '/utils/tabs.js';

import assets from '../assets/index.js';

import Trackers, { updateException } from './trackers.js';
import TrackerAddException from './tracker-add-exception.js';
import { toggleExceptionDomain } from '/store/tracker-exception.js';

function removeDomain(domain) {
  return ({ tracker }) => {
    toggleExceptionDomain(
      tracker.exception,
      domain,
      tracker.blockedByDefault,
      false,
    );
  };
}

export default {
  [router.connect]: { stack: [TrackerAddException] },
  tracker: store(Tracker),
  otherTrackers: ({ tracker }) =>
    store.ready(tracker) && store.get([Tracker], { tracker: tracker.id }),
  domains: ({ tracker }) =>
    (store.ready(tracker) &&
      store.ready(tracker.exception) &&
      tracker.exception[
        tracker.exception.blocked ? 'trustedDomains' : 'blockedDomains'
      ]) ||
    [],
  content: ({ tracker, domains, otherTrackers }) => html`
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
                  <div layout="row gap:2 items:start self:stretch">
                    <div layout="column gap:0.5 grow">
                      <ui-text type="label-l">Protection status</ui-text>
                      <ui-text type="body-m" color="gray-600">
                        Modify the recommended blocking settings for every
                        website.
                      </ui-text>
                    </div>

                    <ui-panel-protection-status-toggle
                      value="${store.ready(tracker.exception)
                        ? tracker.exception.blocked
                        : tracker.blockedByDefault}"
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
                    ${msg`Our recommendation for this activity`}:
                    ${tracker.blockedByDefault ? msg`Blocked` : msg`Trusted`}
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
                            blocked="${tracker.blockedByDefault !==
                            tracker.exception.blocked}"
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
              <div layout="column gap:4">
                <div layout="column gap:4" layout@768px="grid:2fr|1fr">
                  ${tracker.organization?.name &&
                  html`
                    <div layout="column gap">
                      <ui-text type="label-xs" uppercase>Organization</ui-text>
                      <ui-text type="label-l" mobile-type="label-m">
                        ${tracker.organization.name}
                      </ui-text>
                      <ui-text color="gray-600">
                        ${tracker.organization.description}
                      </ui-text>
                    </div>
                  `}
                  <div layout="column gap">
                    <ui-text type="label-xs" uppercase>Category</ui-text>
                    <ui-text type="label-l" mobile-type="label-m">
                      ${labels.categories[tracker.category]}
                    </ui-text>
                    <ui-text color="gray-600">
                      ${tracker.categoryDescription}
                    </ui-text>
                  </div>
                </div>
                ${tracker.organization?.country &&
                html`
                  <div layout="column gap">
                    <ui-text type="label-xs" uppercase>Country</ui-text>
                    <ui-text type="label-s">
                      ${labels.regions.of(tracker.organization.country) ||
                      tracker.organization.country}
                    </ui-text>
                  </div>
                `}
                ${tracker.organization?.websiteUrl &&
                html` <div layout="column gap">
                  <ui-text type="label-xs" uppercase>
                    Organization's website
                  </ui-text>
                  <ui-text type="label-s" color="primary-700">
                    <a
                      href="${tracker.organization.websiteUrl}"
                      onclick="${openTabWithUrl}"
                    >
                      ${tracker.organization.websiteUrl}
                    </a>
                  </ui-text>
                </div>`}
                ${tracker.organization?.privacyPolicyUrl &&
                html`
                  <div layout="column gap">
                    <ui-text type="label-xs" uppercase>
                      Privacy policy
                    </ui-text>
                    <ui-text type="label-s" color="primary-700">
                      <a
                        href="${tracker.organization.privacyPolicyUrl}"
                        onclick="${openTabWithUrl}"
                      >
                        ${tracker.organization.privacyPolicyUrl}
                      </a>
                    </ui-text>
                  </div>
                `}
                ${tracker.organization?.contact &&
                html`
                  <div layout="column gap">
                    <ui-text type="label-xs" uppercase>Contact</ui-text>
                    <ui-text
                      type="label-s"
                      color="primary-700"
                      ellipsis
                      underline
                      layout="padding margin:-1"
                    >
                      <a
                        href="${tracker.organization.contact.startsWith('http')
                          ? ''
                          : 'mailto:'}${tracker.organization.contact}"
                        onclick="${openTabWithUrl}"
                      >
                        ${tracker.organization.contact}
                      </a>
                    </ui-text>
                  </div>
                `}
                ${store.ready(otherTrackers) &&
                !!otherTrackers.length &&
                html`
                  <div layout="column gap:1.5">
                    <ui-text type="label-l">More in this organization</ui-text>
                    <div layout="row:wrap gap:0.5">
                      ${otherTrackers.map(
                        (t) => html`
                          <ui-panel-action layout="block:start height:auto">
                            <a
                              href="${router.currentUrl({
                                tracker: t,
                                scrollToTop: true,
                              })}"
                              layout="column items:start padding:1:1.5"
                            >
                              <ui-text type="label-m">${t.name}</ui-text>
                              <ui-text type="label-xs" color="gray-500">
                                ${labels.categories[t.category]}
                              </ui-text>
                            </a>
                          </ui-panel-action>
                        `,
                      )}
                    </div>
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
