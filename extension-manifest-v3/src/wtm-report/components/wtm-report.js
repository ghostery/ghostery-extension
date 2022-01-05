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

import { html, define } from '/hybrids.js';
import '../../ui/components/wtm-stats/index.js';
import { t } from '../../common/i18n.js';
import { externalLink, close } from '../../ui/icons.js';

const domain = new URLSearchParams(window.location.search).get('domain');

const Stats = new Promise((resolve, reject) => {
  chrome.runtime.sendMessage(
    { action: 'getWTMReport', links: [`https://${domain}`] },
    (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response.wtmStats[0]);
    },
  );
});

function requestClose() {
  window.parent.postMessage('WTMReportClosePopups', '*');
}

define({
  tag: 'wtm-report',
  render: () => html`
    ${html.resolve(
      Stats.then(
        (stats) => html`
          <panel-header domain=${stats.domain}>
            <button class="svg-button" onclick="${requestClose}">
              ${close}
            </button>
          </panel-header>
        `,
      ),
    )}

    <main>
      <h1>${t('android_site_blocking_header')}</h1>

      ${html.resolve(
        Stats.then(
          (stats) => html` <wtm-stats categories=${stats.stats}></wtm-stats> `,
        ),
      )}

      <section class="buttons">
        ${html.resolve(
          Stats.then(
            (stats) => html`
              <a
                target="_blank"
                href="https://whotracks.me/websites/${stats.domain}.html"
              >
                ${t('statistical_report')} ${externalLink}
              </a>
            `,
          ),
        )}
      </section>
    </main>
  `.css`
    :host {
      height: 100%;
      display: block;
      margin: 0 auto;
      background-color: #F8F8F8;
    }

    panel-header {
      position: fixed;
      top: 0px;
      width: 100%;
      box-sizing: border-box;
    }

    main {
      padding: 50px 12px 12px 12px;
      background-color: #F8F8F8;
    }

    h1 {
      font-size: 20px;
      text-align: center;
      color: var(--black);
      white-space: nowrap;
      font-weight: 600;
      margin: 0px;
    }

    .svg-button {
      padding: 0;
      color: white;
      background: none;
      border: 0;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 22px;
      width: 22px;
    }

    .svg-button svg {
      height: 16px;
      width: 16px;
    }

    .buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
      margin-top: 10px;
    }

    .buttons a {
      color: var(--deep-blue);
      padding: 10px 17px;
      flex: 1;
      text-align: center;
      cursor: pointer;
      text-decoration: none;
      background: #FFFFFF;
      box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
      border-radius: 7.4px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }

    .buttons a svg {
      width: 10px;
      height: 10px;
      margin-left: 3px;
    }
  `,
});
