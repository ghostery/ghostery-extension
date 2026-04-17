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

import { html, msg, store } from 'hybrids';
import { FLAG_MODES } from '@ghostery/config';

import modeGhosteryScreenshotUrl from '/ui/assets/lottie-mode-default.json?url';
import modeZapScreenshotUrl from '/ui/assets/lottie-mode-zap.json?url';

import Config from '/store/config.js';
import ManagedConfig from '/store/managed-config.js';
import Options, { MODE_DEFAULT, MODE_ZAP } from '/store/options.js';

import { isOpera, isWebkit } from '/utils/browser-info.js';

import * as backup from '../utils/backup.js';

async function importSettings(host, event) {
  try {
    host.importStatus = {
      type: 'secondary',
      msg: msg`Importing settings...`,
    };
    host.importStatus = {
      type: 'success-secondary',
      msg: await backup.importFromFile(event),
    };
  } catch (error) {
    host.importStatus = { type: 'danger-secondary', msg: error.message };
  }
}

function updateMode(value) {
  return async (host) => {
    await store.set(host.options, { mode: value });
    chrome.runtime.sendMessage({ action: 'telemetry:modeTouched' });
  };
}

export default {
  options: store(Options),
  config: store(Config),
  managedConfig: store(ManagedConfig),
  importStatus: undefined,
  render: ({ options, config, managedConfig, importStatus }) => html`
    <template layout="contents">
      <settings-page-layout>
        <section layout="column gap:4" layout@768px="gap:5">
          <div layout="column gap" layout@992px="margin:bottom">
            <ui-text type="headline-m">My Ghostery</ui-text>
          </div>
          <div layout="column gap:4">
            ${config.hasFlag(FLAG_MODES) &&
            !managedConfig.disableModes &&
            html`
              <settings-option icon="ghosty-m">
                Filtering Mode
                <span slot="description">
                  Because no two people surf alike, we're giving you the power to pick how you want
                  to experience the web.
                </span>
                <div slot="card-footer" layout="column gap" layout@768px="grid:2">
                  <ui-mode-radio
                    checked="${options.mode === MODE_DEFAULT}"
                    id="mode-option-default"
                  >
                    <input
                      type="radio"
                      name="filtering-mode"
                      value="${MODE_DEFAULT}"
                      checked="${options.mode === MODE_DEFAULT}"
                      onchange="${updateMode(MODE_DEFAULT)}"
                      data-qa="input:filtering-mode:ghostery"
                    />
                    <ui-lottie
                      src="${modeGhosteryScreenshotUrl}"
                      layout="ratio:83/45 width:220px"
                      layout@768px="width:100%"
                      play-on-hover="mode-option-default"
                    ></ui-lottie>
                    <ui-icon
                      name="logo-in-box"
                      layout="width:83px"
                      layout@768px="width:138px"
                    ></ui-icon>
                    <ui-text>
                      We block it all for you - ads, trackers, distractions. You’re fully covered,
                      no setup needed.
                    </ui-text>
                    <ui-text type="label-s" slot="footer">
                      Best for full coverage and privacy enthusiasts.
                    </ui-text>
                  </ui-mode-radio>
                  <ui-mode-radio checked="${options.mode === MODE_ZAP}" id="mode-option-zap">
                    <input
                      type="radio"
                      name="filtering-mode"
                      value="${MODE_ZAP}"
                      checked="${options.mode === MODE_ZAP}"
                      onchange="${updateMode(MODE_ZAP)}"
                      data-qa="input:filtering-mode:zap"
                    />
                    <ui-lottie
                      src="${modeZapScreenshotUrl}"
                      layout="ratio:83/45 width:220px"
                      layout@768px="width:100%"
                      play-on-hover="mode-option-zap"
                    ></ui-lottie>
                    <ui-icon
                      name="logo-zap"
                      layout="width:83px"
                      layout@768px="width:116px"
                    ></ui-icon>
                    <ui-text>
                      You zap ads away, one site at a time. One button, one page, and you build your
                      own ad-free list.
                    </ui-text>
                    <ui-text type="label-s" slot="footer">
                      Best for beginners or sharing with family.
                    </ui-text>
                  </ui-mode-radio>
                </div>
              </settings-option>
            `}
            ${!managedConfig.disableUserAccount &&
            html`
              <div layout="column gap">
                ${(__FIREFOX__ || (!isOpera() && !isWebkit())) &&
                html`
                  <settings-toggle
                    icon="globe"
                    value="${options.sync}"
                    onchange="${html.set(options, 'sync')}"
                  >
                    Settings Sync
                    <span slot="description">
                      Saves and synchronizes your custom settings between different devices.
                    </span>
                  </settings-toggle>
                `}

                <settings-option icon="external-link">
                  Settings Backup
                  <span slot="description">
                    Save your custom settings to a file, or restore them from a file.
                  </span>
                  <ui-text type="body-xs" color="tertiary" slot="footer">
                    Importing supports uBlock Origin file format with selected features.
                  </ui-text>

                  ${importStatus &&
                  html`
                    <ui-text type="body-s" color="${importStatus.type}" slot="footer">
                      ${importStatus.msg}
                    </ui-text>
                  `}
                  <div slot="action" layout="row:wrap gap" layout@768px="content:end">
                    <ui-button size="s" onclick="${backup.exportToFile}">
                      <button><ui-icon name="arrow-square-up"></ui-icon> Export to file</button>
                    </ui-button>
                    <ui-button size="s">
                      <label for="import-settings-input">
                        <ui-icon name="arrow-square-down"></ui-icon> Import from file
                      </label>
                      <input
                        id="import-settings-input"
                        type="file"
                        accept=".json,.txt"
                        onchange="${importSettings}"
                      />
                    </ui-button>
                  </div>
                </settings-option>
              </div>
            `}
            <div layout="column gap">
              <settings-toggle
                icon="info"
                value="${options.panel.notifications}"
                onchange="${html.set(options, 'panel.notifications')}"
              >
                In-Panel Notifications
                <span slot="description">
                  Turns Ghostery notifications displayed in the panel on or off.
                </span>
              </settings-toggle>

              <settings-option icon="websites">
                Theme
                <span slot="description">Changes application color theme.</span>
                <ui-input slot="action">
                  <select value="${options.theme}" onchange="${html.set(options, 'theme')}">
                    <option value="">Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </ui-input>
              </settings-option>
            </div>
          </div>
        </section>
      </settings-page-layout>
    </template>
  `,
};
