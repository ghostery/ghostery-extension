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
import TrackerException from '/store/tracker-exception.js';
import Tracker from '/store/tracker.js';

import { WTM_PAGE_URL } from '/utils/urls.js';
import { hasWTMStats } from '/utils/wtm-stats.js';

import TrackerDetails from './tracker-details.js';

function removeDomain(tracker) {
  return async ({ domain }) => {
    const { exception } = tracker;
    const status = exception.getDomainStatus(domain);

    store.set(
      exception,
      status.type === 'block'
        ? {
            blockedDomains: exception.blockedDomains.filter(
              (d) => d !== domain,
            ),
          }
        : {
            trustedDomains: exception.trustedDomains.filter(
              (d) => d !== domain,
            ),
          },
    );
  };
}

function revokePaused({ options, domain }) {
  store.set(options, {
    paused: { [domain]: null },
  });
}

export default {
  [router.connect]: { stack: () => [TrackerDetails] },
  domain: '',
  trackers: ({ domain }) => {
    const exceptions = store.get([TrackerException]);
    if (!store.ready(exceptions)) return [];

    return exceptions
      .filter(
        ({ blockedDomains, trustedDomains }) =>
          blockedDomains.includes(domain) || trustedDomains.includes(domain),
      )
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(({ id }) => store.get(Tracker, id));
  },
  options: store(Options),
  paused: ({ options, domain }) =>
    (store.ready(options) && options.paused[domain]) || {},
  render: ({ domain, trackers, paused }) => html`
    <template layout="contents">
      <settings-page-layout layout="gap:4">
        <div layout="column items:start gap">
          <ui-action>
            <a href="${router.backUrl()}" layout="self:start padding">
              <ui-text type="label-s" layout="row gap items:center">
                <ui-icon name="chevron-left"></ui-icon> Back
              </ui-text>
            </a>
          </ui-action>
          <ui-text type="headline-l">${domain}</ui-text>

          ${paused.revokeAt !== undefined &&
          html`
            <div layout="row items:center gap">
              <settings-protection-status
                revokeAt="${paused.revokeAt}"
              ></settings-protection-status>
              <ui-action>
                <button layout@768px="order:1">
                  <ui-icon
                    name="trash"
                    layout="size:2.5"
                    color="gray-400"
                    onclick="${revokePaused}"
                  ></ui-icon>
                </button>
              </ui-action>
            </div>
          `}
        </div>
        <div
          layout="column gap:2"
          style="${paused.revokeAt !== undefined
            ? {
                opacity: 0.5,
                pointerEvents: 'none',
              }
            : {}}"
        >
          <div layout="column gap:0.5 grow">
            <ui-text type="label-l">Protection exceptions</ui-text>
          </div>
          <settings-table>
            <div
              slot="header"
              layout="grid:2 gap:2"
              layout@768px="grid:2fr|2fr|3fr gap:4"
            >
              <ui-text type="label-m" mobile-type="label-s">Name</ui-text>
              <ui-text type="label-m" layout="hidden" layout@768px="block">
                Category
              </ui-text>
              <ui-text type="label-m" mobile-type="label-s">
                Protection status
              </ui-text>
            </div>
            ${!trackers.length &&
            html`
              <div layout="column center gap padding:5:0">
                <ui-icon
                  name="block-m"
                  layout="size:4"
                  color="gray-400"
                ></ui-icon>
                <ui-text layout="block:center width:::180px">
                  No protection exceptions added yet
                </ui-text>
              </div>
            `}
            ${trackers.map(
              (tracker) =>
                store.ready(tracker) &&
                html`
                  <div
                    layout="grid:2 gap:2"
                    layout@768px="grid:2fr|2fr|3fr gap:4"
                  >
                    <div layout="column gap:0.5">
                      <ui-action>
                        <a
                          href="${router.url(TrackerDetails, {
                            tracker: tracker.id,
                          })}"
                        >
                          <ui-text type="label-m" mobile-type="label-s">
                            ${tracker.name}
                          </ui-text>
                        </a>
                      </ui-action>
                      ${tracker.organization &&
                      html`
                        <ui-text type="body-s" color="gray-600">
                          ${tracker.organization.name}
                        </ui-text>
                      `}
                    </div>
                    <ui-text
                      type="label-m"
                      layout="hidden"
                      layout@768px="row items:center"
                    >
                      ${labels.categories[tracker.category]}
                    </ui-text>
                    <div layout="row gap items:center content:space-between">
                      ${tracker.exception.getDomainStatus(domain).type ===
                      'block'
                        ? html`<settings-badge type="info">
                            <ui-icon name="block-s"></ui-icon> Blocked
                          </settings-badge>`
                        : html`<settings-badge type="info">
                            <ui-icon name="trust-s"></ui-icon> Trusted
                          </settings-badge>`}
                      <ui-action>
                        <button layout@768px="order:1">
                          <ui-icon
                            name="trash"
                            layout="size:3"
                            color="gray-400"
                            onclick="${removeDomain(tracker)}"
                          ></ui-icon>
                        </button>
                      </ui-action>
                    </div>
                  </div>
                `,
            )}
          </settings-table>
        </div>
        ${hasWTMStats(domain) &&
        html`
          <div layout="margin:3:0">
            <ui-action>
              <a href="${`${WTM_PAGE_URL}websites/${domain}`}" target="_blank">
                <settings-wtm-link>
                  WhoTracks.Me Statistical Report
                </settings-wtm-link>
              </a>
            </ui-action>
          </div>
        `}
      </settings-page-layout>
    </template>
  `,
};
