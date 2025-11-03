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

import * as labels from '/ui/labels.js';

import Config from '/store/config.js';
import Options from '/store/options.js';
import Tracker from '/store/tracker.js';
import ElementPickerSelectors from '/store/element-picker-selectors.js';

import { isWebkit } from '/utils/browser-info.js';
import * as exceptions from '/utils/exceptions.js';
import { PAUSE_ASSISTANT_LEARN_MORE_URL, WTM_PAGE_URL } from '/utils/urls.js';
import { hasWTMStats } from '/utils/wtm-stats.js';

import TrackerDetails from './tracker-details.js';
import WebsiteClearCookies from './website-clear-cookies.js';

function removeDomain(tracker) {
  return ({ options, domain }) =>
    exceptions.toggleDomain(options, tracker.id, domain);
}

function revokePaused({ options, domain }) {
  store.set(options, { paused: { [domain]: null } });
}

function enableElementPickerSelectors(host) {
  const saveButton = host.render().querySelector('#save-custom-content-blocks');
  saveButton.disabled = false;
}

async function saveElementPickerSelectors(host, event) {
  event.preventDefault();

  const selectors = event.target.selectors.value
    .split('\n')
    .map((selector) => selector.trim())
    .filter((selector) => selector);

  await store.set(host.elementPickerSelectors, {
    hostnames: {
      [host.domain]: selectors.length > 0 ? selectors : null,
    },
  });

  host.render().querySelector('#save-custom-content-blocks').disabled = true;
}

async function clearElementPickerSelectors(host) {
  const textarea = host.render().querySelector('textarea');
  textarea.value = '';

  enableElementPickerSelectors(host);
}

export default {
  [router.connect]: {
    stack: () => [TrackerDetails, WebsiteClearCookies],
    replace: true,
  },
  domain: '',
  topLevelDomain: ({ domain }) => parse(domain).domain,
  options: store(Options),
  config: store(Config),
  paused: ({ options, domain }) =>
    (store.ready(options) && options.paused[domain]) || {},
  issueUrl: ({ config, domain }) =>
    store.ready(config) && config.domains[domain]?.issueUrl,
  trackers: ({ options, domain }) =>
    store.ready(options)
      ? Object.entries(options.exceptions)
          .filter(([, { domains }]) => domains.includes(domain))
          .map(([id]) => id)
          .sort((a, b) => a.localeCompare(b))
          .map((id) => store.get(Tracker, id))
          .map((tracker) =>
            store.error(tracker)
              ? { id: tracker.id, name: tracker.id }
              : tracker,
          )
      : [],
  elementPickerSelectors: store(ElementPickerSelectors),
  selectors: ({ elementPickerSelectors, domain }) =>
    (store.ready(elementPickerSelectors) &&
      elementPickerSelectors.hostnames[domain]?.join('\n')) ||
    '',
  clearedCookies: false,
  render: ({
    domain,
    topLevelDomain,
    paused,
    issueUrl,
    trackers,
    selectors,
    clearedCookies,
  }) => html`
    <template layout="contents">
      <settings-page-layout layout="gap:4">
        <div layout="column items:start gap">
          <settings-link
            href="${router.backUrl()}"
            data-qa="button:back"
            layout="self:start"
          >
            <ui-icon name="chevron-left" color="primary"></ui-icon>
            <ui-text type="headline-s" layout="row gap items:center">
              Back
            </ui-text>
          </settings-link>
          <ui-text type="headline-l" style="word-break:break-word">
            ${domain}
          </ui-text>

          ${paused.revokeAt !== undefined &&
          !paused.assist &&
          html`
            <div layout="row items:center gap">
              <settings-protection-status
                revokeAt="${paused.revokeAt}"
              ></settings-protection-status>
              ${!paused.managed &&
              html`
                <ui-action>
                  <button layout@768px="order:1">
                    <ui-icon
                      name="trash"
                      layout="size:2.5"
                      color="tertiary"
                      onclick="${revokePaused}"
                    ></ui-icon>
                  </button>
                </ui-action>
              `}
            </div>
          `}
          ${paused.revokeAt !== undefined &&
          paused.assist &&
          html`
            <settings-card type="pause-assistant" layout="self:stretch">
              <div layout="column gap:2" layout@768px="row gap:2 items:center">
                <div layout="grow">
                  <ui-text type="label-m" color="onbrand">
                    Paused by Browsing Assistant
                  </ui-text>
                  <ui-text type="body-s" color="onbrand">
                    Automatically paused to prevent adblocker breakage
                  </ui-text>
                  <div layout="row:wrap gap:4:2 margin:top">
                    ${issueUrl &&
                    html`
                      <ui-button type="transparent" style="height:auto">
                        <a
                          href="${issueUrl}"
                          target="_blank"
                          rel="noopener noreferrer"
                          layout="padding:0"
                        >
                          <ui-icon
                            name="doc-m"
                            color="onbrand"
                            layout="size:2"
                          ></ui-icon>
                          <ui-text type="label-s" color="onbrand">
                            Broken page report
                          </ui-text>
                        </a>
                      </ui-button>
                    `}
                    <ui-button type="transparent" style="height:auto">
                      <a
                        href="${PAUSE_ASSISTANT_LEARN_MORE_URL}"
                        target="_blank"
                        layout="padding:0"
                      >
                        <ui-icon
                          name="info"
                          color="onbrand"
                          layout="size:2"
                        ></ui-icon>
                        <ui-text type="label-s" color="onbrand">
                          Learn more
                        </ui-text>
                      </a>
                    </ui-button>
                  </div>
                </div>
                <ui-button>
                  <button onclick="${revokePaused}">
                    <ui-icon name="play"></ui-icon>
                    Resume
                  </button>
                </ui-button>
              </div>
            </settings-card>
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
                  color="tertiary"
                ></ui-icon>
                <ui-text layout="block:center width:::180px">
                  No protection exceptions added yet
                </ui-text>
              </div>
            `}
            ${trackers.map(
              (tracker) =>
                !store.pending(tracker) &&
                html`
                  <div
                    layout="grid:2 gap:2"
                    layout@768px="grid:2fr|2fr|3fr gap:4"
                  >
                    ${store.ready(tracker) &&
                    html`<ui-action>
                      <a
                        href="${router.url(TrackerDetails, {
                          tracker: tracker.id,
                        })}"
                        layout="column gap:0.5"
                      >
                        <ui-text type="label-m" mobile-type="label-s">
                          ${tracker.name}
                        </ui-text>
                        ${tracker.organization &&
                        html`
                          <ui-text type="body-s" color="secondary">
                            ${tracker.organization.name}
                          </ui-text>
                        `}
                      </a>
                    </ui-action>`}
                    ${!store.ready(tracker) &&
                    html`<ui-text type="label-m" mobile-type="label-s">
                      ${tracker.name}
                    </ui-text>`}
                    <ui-text
                      type="label-m"
                      layout="hidden"
                      layout@768px="row items:center"
                    >
                      ${labels.categories[tracker.category]}
                    </ui-text>
                    <div layout="row gap items:center content:space-between">
                      <settings-badge>
                        <ui-icon name="trust-s"></ui-icon> Trusted
                      </settings-badge>
                      <ui-action>
                        <button layout@768px="order:1">
                          <ui-icon
                            name="trash"
                            layout="size:3"
                            color="tertiary"
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
        <form layout="column gap:2" onsubmit="${saveElementPickerSelectors}">
          <settings-option static icon="hide-element">
            Blocked elements on this site
            <span slot="description">
              Displays all content blocks manually hidden on this site. You can
              remove them individually or clear the entire list.
            </span>
          </settings-option>
          <ui-input>
            <textarea
              name="selectors"
              rows="8"
              value="${selectors}"
              spellcheck="false"
              autocorrect="off"
              oninput="${enableElementPickerSelectors}"
              style="white-space:pre"
            ></textarea>
          </ui-input>
          <div layout="row gap:2">
            <ui-button id="save-custom-content-blocks" type="success" disabled>
              <button type="submit">Save</button>
            </ui-button>
            <ui-button onclick="${clearElementPickerSelectors}">
              <button type="button">Clear</button>
            </ui-button>
          </div>
        </form>

        ${(__PLATFORM__ === 'firefox' || !isWebkit()) &&
        html`
          <div layout="row gap:5">
            <settings-option static icon="cookie">
              Clear Cookies
              <span slot="description">
                Remove all cookies stored by this site to protect your privacy
                and reset your browsing data.
              </span>
              ${clearedCookies &&
              html`
                <ui-text slot="footer" type="body-s" color="success-primary">
                  Cookies successfully cleared
                </ui-text>
              `}
            </settings-option>
            <ui-button disabled="${clearedCookies}">
              <a
                href="${router.url(WebsiteClearCookies, { domain })}"
                data-qa="button:clear-cookies"
              >
                Clear Cookies
              </a>
            </ui-button>
          </div>
        `}
        ${hasWTMStats(topLevelDomain) &&
        html`
          <div layout="margin:3:0">
            <ui-action>
              <a
                href="${`${WTM_PAGE_URL}/websites/${topLevelDomain}`}"
                target="_blank"
              >
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
