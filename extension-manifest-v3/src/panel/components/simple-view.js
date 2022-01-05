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

import { html, define, store, dispatch } from '/hybrids.js';
import '../../ui/components/wtm-stats/index.js';
import './simple-view/toggle-switch.js';
import './simple-view/page-load.js';
import { toggles } from '../../common/rulesets.js';
import { t } from '../../common/i18n.js';
import { externalLink, chevronRight } from '../../ui/icons.js';

function toggleDetailedView(host) {
  dispatch(host, 'toggle-detailed-view');
}

function wtmLink(stats) {
  const placeholder = html`<span></span>`;
  if (!store.ready(stats)) {
    return placeholder;
  }
  const { domain } = stats;
  const siteListUrl = chrome.runtime.getURL('rule_resources/sites.json');
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

define({
  tag: 'simple-view',
  settings: null,
  stats: null,
  content: ({ settings, stats }) => html`
    <main>
      <h1>${t('privacy_protection')}</h1>

      <section class="toggles">
        ${store.ready(settings) &&
        toggles.map(
          (toggle) => html`
            <toggle-switch
              toggle=${toggle}
              settings=${settings}
            ></toggle-switch>
          `,
        )}
      </section>

      ${store.ready(stats) &&
      html` <wtm-stats categories=${stats.categories}></wtm-stats> `}

      <section class="buttons">
        <span> ${wtmLink(stats)} </span>
        <a onclick="${toggleDetailedView}"
          >${t('detailed_view')} ${chevronRight}</a
        >
      </section>

      <page-load stats=${stats}></page-load>
    </main>
  `,
});
