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

import { html, define, store, router } from 'hybrids';
import { t } from '/vendor/@whotracksme/ui/src/i18n.js';

import '/vendor/@whotracksme/ui/src/components/wtm-stats.js';
import {
  externalLink,
  chevronRight,
} from '/vendor/@whotracksme/ui/src/components/icons.js';

import { toggles } from '../utils/rulesets.js';

import Stats from '../store/stats.js';
import Settings from '../store/settings.js';

import Detailed from './detailed.js';

function wtmLink(stats) {
  const placeholder = html`<span></span>`;
  if (!store.ready(stats)) {
    return placeholder;
  }
  const { domain } = stats;
  const siteListUrl = chrome.runtime.getURL('assets/rule_resources/sites.json');
  const url = `https://www.whotracks.me/websites/${domain}.html`;
  const link = html`
    <a href="${url}" target="_blank">
      ${t('statistical_report')} ${externalLink}
    </a>
  `;

  const promise = fetch(siteListUrl)
    .then((res) => res.json())
    .then((res) => {
      if (res.indexOf(domain) > -1) {
        return link;
      }
      throw Error('No domain entry found');
    })
    .catch(() => placeholder);

  return html.resolve(promise, placeholder);
}

export default define({
  [router.connect]: { stack: [Detailed] },
  tag: 'gh-panel-simple-view',
  settings: store(Settings),
  stats: store(Stats),
  render: ({ settings, stats }) => html`
    <h1>${t('privacy_protection')}</h1>

    <section class="toggles">
      ${store.ready(settings) &&
      toggles.map(
        (toggle) =>
          html`<gh-panel-toggle-switch
            toggle=${toggle}
          ></gh-panel-toggle-switch>`,
      )}
    </section>

    ${store.ready(stats) &&
    html` <wtm-stats categories=${stats.categories}></wtm-stats> `}

    <section class="buttons">
      <span> ${wtmLink(stats)} </span>
      <a href="${router.url(Detailed)}">
        ${t('detailed_view')} ${chevronRight}
      </a>
    </section>

    <gh-panel-page-load></gh-panel-page-load>
  `.css`
    h1 {
      color: var(--black);
      font-size: 16px;
      text-align: center;
      font-weight: 600;
      white-space: nowrap;
      margin: 6px 0px 16px;
    }
    
    section.toggles {
      margin: 10px 0;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      column-gap: 10px;
    }
    
    section.buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
      margin-top: 10px;
    }
    
    section.buttons a,
    section.buttons a:visited {
      color: var(--deep-blue);
      padding: 10px 17px;
      flex: 1;
      text-align: center;
      cursor: pointer;
      text-decoration: none;
      background: #ffffff;
      box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
      border-radius: 7.4px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }
    
    section.buttons a svg {
      width: 10px;
      height: 10px;
      margin-left: 3px;
    }
  `,
});
