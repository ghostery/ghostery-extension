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

import { html, define, store, msg, router } from 'hybrids';

import sites from '/rule_resources/sites.json';
import { statsFactory } from '/store/stats.js';
import Options, { DNR_RULES_LIST } from '/store/options.js';

import Detailed from './detailed.js';

const toggleLabels = {
  get ads() {
    return msg`Ad-Blocking`;
  },
  get tracking() {
    return msg`Anti-Tracking`;
  },
  get annoyances() {
    return msg`Never-Consent`;
  },
};

function toggleRuleset(ruleset) {
  return (host) => {
    const enabled = !host.options.dnrRules[ruleset];

    store.set(host.options, {
      dnrRules: { [ruleset]: enabled },
      autoconsent: ruleset === 'annoyances' && !enabled ? null : {},
    });
  };
}

async function pause(host) {
  store.set(host.options, {
    paused: [
      ...host.options.paused,
      { id: host.stats.domain, revokeAt: Date.now() + 60 * 1000 },
    ],
  });
}

async function resume(host) {
  store.set(host.options, {
    paused: host.options.paused.filter((p) => p.id !== host.stats.domain),
  });
}

export default define({
  [router.connect]: { stack: [Detailed] },
  tag: 'panel-simple-view',
  options: store(Options),
  stats: statsFactory(),
  render: ({ options, stats }) => html`
    ${store.ready(options) &&
    html`
      <ui-onboarding-state
        disabled="${!options.terms}"
        href="${chrome.runtime.getURL('/pages/onboarding/index.html')}"
      >
        <section class="toggles">
          ${DNR_RULES_LIST.map(
            (ruleset) =>
              html`<ui-toggle-switch
                name="${ruleset}"
                label="${toggleLabels[ruleset]}"
                disabled="${!options.dnrRules[ruleset]}"
                onclick=${toggleRuleset(ruleset)}
              ></ui-toggle-switch>`,
          )}
        </section>
        ${options.paused &&
        store.ready(stats) &&
        html`
          <section class="pause">
            ${options.paused.some(({ id }) => id === stats.domain)
              ? html`
                  <ui-button onclick="${resume}" type="outline">
                    <button>Resume</button>
                  </ui-button>
                `
              : html`
                  <ui-button onclick="${pause}" type="outline">
                    <button>Pause for a minute</button>
                  </ui-button>
                `}
          </section>
        `}
      </ui-onboarding-state>
    `}
    ${store.ready(stats) &&
    html`
      <ui-stats categories="${stats.categories}"></ui-stats>
      <section class="buttons">
        <span>
          ${store.ready(stats) &&
          sites.indexOf(stats.domain) > -1 &&
          html`
            <a
              href="https://www.whotracks.me/websites/${stats.domain}.html"
              target="_blank"
            >
              Statistical Report <ui-icon name="external-link"></ui-icon>
            </a>
          `}
        </span>
        <a href="${router.url(Detailed)}">
          Detailed View <ui-icon name="chevron-right"></ui-icon>
        </a>
      </section>

      <ui-page-load loadTime="${stats.loadTime}"></ui-page-load>
    `}
  `.css`
    h1 {
      color: var(--ui-black);
      font-size: 16px;
      text-align: center;
      font-weight: 600;
      white-space: nowrap;
      margin: 6px 0px 16px;
    }

    section.toggles {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      column-gap: 10px;
    }

    section.pause {
      margin: 16px 0;
    }

    section.buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
      margin-top: 10px;
    }

    section.buttons a,
    section.buttons a:visited {
      color: var(--ui-deep-blue);
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

    section.buttons a ui-icon {
      width: 10px;
      height: 10px;
      margin-left: 3px;
    }
  `,
});
