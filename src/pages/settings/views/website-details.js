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

import Options from '/store/options.js';
import Tracker from '/store/tracker.js';
import CustomContentBlocks from '/store/custom-content-blocks.js';

import * as exceptions from '/utils/exceptions.js';
import { WTM_PAGE_URL } from '/utils/urls.js';
import { hasWTMStats } from '/utils/wtm-stats.js';

import TrackerDetails from './tracker-details.js';

function removeDomain(tracker) {
  return ({ options, domain }) =>
    exceptions.toggleDomain(options, tracker.id, domain);
}

function revokePaused({ options, domain }) {
  store.set(options, { paused: { [domain]: null } });
}

function enableCustomContentBlocks(host) {
  const saveButton = host.render().querySelector('#save-custom-content-blocks');
  saveButton.disabled = false;
}

async function saveCustomContentBlocks(host, event) {
  event.preventDefault();

  const selectors = event.target.selectors.value
    .split('\n')
    .map((selector) => selector.trim())
    .filter((selector) => selector);

  await store.set(host.customContentBlocks, {
    selectors: {
      [host.domain]: selectors.length > 0 ? selectors : null,
    },
  });

  host.render().querySelector('#save-custom-content-blocks').disabled = true;
}

async function clearCustomContentBlocks(host) {
  const textarea = host.render().querySelector('textarea');
  textarea.value = '';

  enableCustomContentBlocks(host);
}

export default {
  [router.connect]: { stack: () => [TrackerDetails] },
  domain: '',
  topLevelDomain: ({ domain }) => parse(domain).domain,
  options: store(Options),
  paused: ({ options, domain }) =>
    (store.ready(options) && options.paused[domain]) || {},
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
  customContentBlocks: store(CustomContentBlocks),
  selectors: ({ customContentBlocks, domain }) =>
    (store.ready(customContentBlocks) &&
      customContentBlocks.selectors[domain]?.join('\n')) ||
    '',
  render: ({ domain, topLevelDomain, trackers, paused, selectors }) => html`
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
                    color="tertiary"
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
        <form layout="column gap:2" onsubmit="${saveCustomContentBlocks}">
          <div layout="column gap:0.5">
            <ui-text type="label-l">Blocked elements on this site</ui-text>
            <ui-text layout="width:::540px">
              Displays all content blocks manually hidden on this site. You can
              remove them individually or clear the entire list.
            </ui-text>
          </div>
          <ui-input>
            <textarea
              name="selectors"
              rows="8"
              value="${selectors}"
              spellcheck="false"
              autocorrect="off"
              oninput="${enableCustomContentBlocks}"
              style="white-space:nowrap"
            ></textarea>
          </ui-input>
          <div layout="row gap:2">
            <ui-button id="save-custom-content-blocks" disabled>
              <button type="submit">Save</button>
            </ui-button>
            <ui-button onclick="${clearCustomContentBlocks}">
              <button type="button">Clear</button>
            </ui-button>
          </div>
        </form>
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
