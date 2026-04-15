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
import * as labels from '/ui/labels.js';

import Options from '/store/options.js';
import Tracker from '/store/tracker.js';

import * as exceptions from '/utils/exceptions.js';
import { WTM_PAGE_URL } from '/utils/urls.js';

import TrackerAddException from './tracker-add-exception.js';
import WebsiteDetails from './website-details.js';

function toggleDomain(domain) {
  return ({ options, tracker }, event) => {
    event.preventDefault();
    event.stopPropagation();

    exceptions.toggleDomain(options, tracker.id, domain);
  };
}

function toggleGlobal({ options, tracker }) {
  return exceptions.toggleGlobal(options, tracker.id);
}

export default {
  [router.connect]: { stack: () => [TrackerAddException], replace: true },
  options: store(Options),
  tracker: store(Tracker),
  otherTrackers: ({ tracker }) =>
    store.ready(tracker) && store.get([Tracker], { tracker: tracker.id }),
  domains: ({ options, tracker }) =>
    (store.ready(options, tracker) && options.exceptions[tracker.id]?.domains) || [],
  exceptionStatus: ({ options, tracker }) =>
    store.ready(options, tracker) && exceptions.getStatus(options, tracker.id),
  render: ({ options, tracker, otherTrackers, domains, exceptionStatus }) => html`
    <template layout="contents">
      <settings-page-layout>
        <div layout="column gap">
          <settings-back-button></settings-back-button>
          ${store.ready(options, tracker) &&
          html`
            <div layout="column gap:5">
              <div layout="column gap">
                <ui-text type="headline-m">${tracker.name}</ui-text>
                <div layout="row gap:3 items:center">
                  <div layout="row items:center gap">
                    <ui-category-icon
                      name="${tracker.category}"
                      layout="size:3 padding:0.5"
                    ></ui-category-icon>
                    <ui-text type="body-l" color="secondary">
                      ${labels.categories[tracker.category]}
                    </ui-text>
                  </div>
                  ${store.ready(tracker.organization) &&
                  html`
                    <div layout="row items:center gap">
                      <ui-category-icon
                        name="organization"
                        layout="size:3 padding:0.5"
                      ></ui-category-icon>
                      <ui-text type="body-l" color="secondary">
                        ${tracker.organization.name}
                      </ui-text>
                    </div>
                  `}
                </div>
              </div>
              <div layout="column gap">
                <settings-option icon="shield">
                  Protection status
                  <span slot="description">
                    Modify the recommended blocking settings for every website.
                  </span>

                  <settings-exception-toggle
                    value="${exceptionStatus.trusted}"
                    responsive
                    onchange="${toggleGlobal}"
                    layout="shrink:0"
                    slot="action"
                  ></settings-exception-toggle>
                </settings-option>
                <settings-option icon="no-websites">
                  Website exceptions
                  <span slot="description">
                    Manage the list of websites that are allowed to load this tracker.
                  </span>
                  <ui-button
                    slot="action"
                    disabled="${exceptionStatus.trusted && exceptionStatus.global}"
                    layout="self:center"
                  >
                    <a href="${router.url(TrackerAddException, { tracker })}">Add</a>
                  </ui-button>
                  <settings-table
                    disabled="${exceptionStatus.trusted && exceptionStatus.global}"
                    slot="card-footer"
                  >
                    <div slot="header" layout="grid:2 gap:4">
                      <ui-text type="label-m" mobile-type="label-s">Website</ui-text>
                      <ui-text type="label-m" mobile-type="label-s">Protection status</ui-text>
                    </div>
                    ${!domains.length &&
                    html`
                      <div layout="column center gap padding:3:0">
                        <ui-icon name="block-m" color="tertiary" layout="size:3"></ui-icon>
                        <ui-text color="tertiary" layout="block:center width:::180px">
                          No exceptions added yet
                        </ui-text>
                      </div>
                    `}
                    ${domains.map(
                      (domain) => html`
                        <ui-action layout="block">
                          <a
                            href="${router.url(WebsiteDetails, {
                              domain,
                            })}"
                            layout="grid:2 items:center:stretch gap:4"
                          >
                            <ui-text type="label-m" mobile-type="label-s"> ${domain} </ui-text>
                            <div layout="row content:space-between gap">
                              <settings-protection-badge></settings-protection-badge>
                              <ui-action>
                                <button
                                  layout@768px="order:1 padding:0.5"
                                  onclick="${toggleDomain(domain)}"
                                >
                                  <ui-icon name="trash" layout="size:3" color="tertiary"></ui-icon>
                                </button>
                              </ui-action>
                            </div>
                          </a>
                        </ui-action>
                      `,
                    )}
                  </settings-table>
                </settings-option>
                <div layout="margin:2:0">
                  <ui-action>
                    <a href="${`${WTM_PAGE_URL}/trackers/${tracker.id}`}" target="_blank">
                      <settings-wtm-link> WhoTracks.Me Statistical Report </settings-wtm-link>
                    </a>
                  </ui-action>
                </div>
                ${store.ready(tracker.organization) &&
                html`
                  <settings-card static>
                    <div layout="column gap:4">
                      <div layout="column gap:4" layout@768px="grid:2fr|1fr">
                        ${tracker.organization.name &&
                        html`
                          <div layout="column gap">
                            <ui-text type="label-xs" uppercase>Organization</ui-text>
                            <ui-text type="label-l" mobile-type="label-m">
                              ${tracker.organization.name}
                            </ui-text>
                            <ui-text color="secondary">
                              ${tracker.organization.description}
                            </ui-text>
                          </div>
                        `}
                        <div layout="column gap">
                          <ui-text type="label-xs" uppercase>Category</ui-text>
                          <ui-text type="label-l" mobile-type="label-m">
                            ${labels.categories[tracker.category]}
                          </ui-text>
                          <ui-text color="secondary"> ${tracker.categoryDescription} </ui-text>
                        </div>
                      </div>
                      ${tracker.organization.country &&
                      html`
                        <div layout="column gap">
                          <ui-text type="label-xs" uppercase>Country</ui-text>
                          <ui-text type="label-s">
                            ${labels.regions.of(tracker.organization.country) ||
                            tracker.organization.country}
                          </ui-text>
                        </div>
                      `}
                      ${tracker.organization.websiteUrl &&
                      html` <div layout="column gap">
                        <ui-text type="label-xs" uppercase> Organization's website </ui-text>
                        <ui-text type="label-s" color="brand-primary" underline>
                          <a href="${tracker.organization.websiteUrl}" target="_blank">
                            ${tracker.organization.websiteUrl}
                          </a>
                        </ui-text>
                      </div>`}
                      ${tracker.organization.privacyPolicyUrl &&
                      html`
                        <div layout="column gap">
                          <ui-text type="label-xs" uppercase> Privacy policy </ui-text>
                          <ui-text type="label-s" color="brand-primary" underline>
                            <a href="${tracker.organization.privacyPolicyUrl}" target="_blank">
                              ${tracker.organization.privacyPolicyUrl}
                            </a>
                          </ui-text>
                        </div>
                      `}
                      ${tracker.organization.contact &&
                      html`
                        <div layout="column gap">
                          <ui-text type="label-xs" uppercase>Contact</ui-text>
                          <ui-text
                            type="label-s"
                            color="brand-primary"
                            ellipsis
                            underline
                            layout="padding margin:-1"
                          >
                            <a
                              href="${tracker.organization.contact.startsWith('http')
                                ? ''
                                : 'mailto:'}${tracker.organization.contact}"
                              target="_blank"
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
                                <ui-action-button layout="block:start height:auto">
                                  <a
                                    href="${router.currentUrl({ tracker: t })}"
                                    layout="column items:start padding:1:1.5"
                                  >
                                    <ui-text type="label-m">${t.name}</ui-text>
                                    <ui-text type="label-xs" color="secondary">
                                      ${labels.categories[t.category]}
                                    </ui-text>
                                  </a>
                                </ui-action-button>
                              `,
                            )}
                          </div>
                        </div>
                      `}
                    </div>
                  </settings-card>
                `}
              </div>
            </div>
          `}
        </div>
      </settings-page-layout>
    </template>
  `,
};
