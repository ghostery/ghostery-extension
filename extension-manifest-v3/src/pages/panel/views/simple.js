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

import {
  externalLink,
  chevronRight,
} from '/vendor/@whotracksme/ui/src/components/icons.js';

import sites from '/rule_resources/sites.json';

import Stats from '/store/stats.js';
import Options, { DNR_RULES_LIST } from '/store/options.js';

import Detailed from './detailed.js';

function toggleRuleset(ruleset) {
  return (host) => {
    store.set(host.options, {
      dnrRules: {
        [ruleset]: !host.options.dnrRules[ruleset],
      },
    });
  };
}

export default define({
  [router.connect]: { stack: [Detailed] },
  tag: 'gh-panel-simple-view',
  options: store(Options),
  stats: store(Stats),
  render: ({ options, stats }) => html`
    <h1>${t('privacy_protection')}</h1>

    <section class="toggles">
      ${store.ready(options) &&
      DNR_RULES_LIST.map(
        (ruleset) =>
          html`<gh-panel-toggle-switch
            name="${ruleset}"
            disabled="${!options.dnrRules[ruleset]}"
            onclick=${toggleRuleset(ruleset)}
          ></gh-panel-toggle-switch>`,
      )}
    </section>

    ${store.ready(stats) &&
    html`
      <wtm-stats categories=${stats.categories}></wtm-stats>
      <section class="buttons">
        <span>
          ${store.ready(stats) &&
          sites.indexOf(stats.domain) > -1 &&
          html`
            <a
              href="https://www.whotracks.me/websites/${stats.domain}.html"
              target="_blank"
            >
              ${t('statistical_report')} ${externalLink}
            </a>
          `}
        </span>
        <a href="${router.url(Detailed)}">
          ${t('detailed_view')} ${chevronRight}
        </a>
      </section>

      <gh-panel-page-load loadTime="${stats.loadTime}"></gh-panel-page-load>
    `}
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
