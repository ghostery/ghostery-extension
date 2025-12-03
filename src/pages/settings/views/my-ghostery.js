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

import modeGhosteryScreenshotUrl from '/ui/assets/mode-ghostery.svg';
import modeZapScreenshotUrl from '/ui/assets/mode-zap.svg';

import Config from '/store/config.js';
import ManagedConfig from '/store/managed-config.js';
import Options, { MODE_DEFAULT, MODE_ZAP } from '/store/options.js';

import { FLAG_MODES } from '/utils/config-types.js';
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
              <settings-card
                type="content"
                layout="contents"
                layout@768px="block padding:2 gap:2"
                layout@1280px="padding:5 gap:4"
              >
                <settings-option static>
                  Filtering Mode
                  <span slot="description">
                    Because no two people surf alike, we're giving you the power
                    to pick how you want to experience the web.
                  </span>
                </settings-option>
                <div layout="column gap" layout@768px="grid:2">
                  <ui-filtering-mode checked="${options.mode === MODE_DEFAULT}">
                    <input
                      type="radio"
                      name="filtering-mode"
                      value="${MODE_DEFAULT}"
                      checked="${options.mode === MODE_DEFAULT}"
                      onchange="${html.set(options, 'mode')}"
                      data-qa="input:filtering-mode:ghostery"
                    />
                    <img
                      src="${modeGhosteryScreenshotUrl}"
                      alt="Ghostery Mode"
                      layout="ratio:83/45 width:220px"
                      layout@768px="width:100%"
                    />
                    <ui-icon
                      name="logo-in-box"
                      layout="width:83px"
                      layout@768px="width:138px"
                    ></ui-icon>
                    <ui-text>
                      We block it all for you - ads, trackers, distractions.
                      You’re fully covered, no setup needed.
                    </ui-text>
                    <ui-text type="label-s" slot="footer">
                      Best for full coverage and privacy enthusiasts.
                    </ui-text>
                  </ui-filtering-mode>
                  <ui-filtering-mode checked="${options.mode === MODE_ZAP}">
                    <input
                      type="radio"
                      name="filtering-mode"
                      value="${MODE_ZAP}"
                      checked="${options.mode === MODE_ZAP}"
                      onchange="${html.set(options, 'mode')}"
                      data-qa="input:filtering-mode:zap"
                    />
                    <img
                      src="${modeZapScreenshotUrl}"
                      alt="ZAP Mode"
                      layout="ratio:83/45 width:220px"
                      layout@768px="width:100%"
                    />
                    <ui-icon
                      name="logo-zap"
                      layout="width:83px"
                      layout@768px="width:116px"
                    ></ui-icon>
                    <ui-text>
                      You zap ads away, one site at a time. One button, one
                      page, and you build your own ad-free list.
                    </ui-text>
                    <ui-text type="label-s" slot="footer">
                      Best for beginners or sharing with family.
                    </ui-text>
                  </ui-filtering-mode>
                </div>
              </settings-card>
            `}
            ${!managedConfig.disableUserAccount &&
            html`
              ${(__PLATFORM__ === 'firefox' || (!isOpera() && !isWebkit())) &&
              html`
                <ui-toggle
                  value="${options.sync}"
                  onchange="${html.set(options, 'sync')}"
                >
                  <settings-option>
                    Settings Sync
                    <span slot="description">
                      Saves and synchronizes your custom settings between
                      different devices.
                    </span>
                  </settings-option>
                </ui-toggle>
              `}

              <div layout="column gap:2" layout@768px="row">
                <settings-option static>
                  Settings Backup
                  <span slot="description">
                    Save your custom settings to a file, or restore them from a
                    file.
                  </span>
                  <ui-text type="body-xs" color="tertiary" slot="footer">
                    Importing supports uBlock Origin file format with selected
                    features.
                  </ui-text>

                  ${importStatus &&
                  html`
                    <ui-text
                      type="body-s"
                      color="${importStatus.type}"
                      slot="footer"
                    >
                      ${importStatus.msg}
                    </ui-text>
                  `}
                </settings-option>
                <div layout="row:wrap gap" layout@768px="content:end">
                  <ui-button size="s" onclick="${backup.exportToFile}">
                    <button>
                      <ui-icon name="arrow-square-up"></ui-icon> Export to file
                    </button>
                  </ui-button>
                  <ui-button size="s">
                    <label for="import-settings-input">
                      <ui-icon name="arrow-square-down"></ui-icon> Import from
                      file
                    </label>
                    <input
                      id="import-settings-input"
                      type="file"
                      accept=".json,.txt"
                      onchange="${importSettings}"
                    />
                  </ui-button>
                </div>
              </div>
              <ui-line></ui-line>
            `}

            <ui-toggle
              value="${options.panel.notifications}"
              onchange="${html.set(options, 'panel.notifications')}"
            >
              <settings-option>
                In-Panel Notifications
                <span slot="description">
                  Turns Ghostery notifications displayed in the panel on or off.
                </span>
              </settings-option>
            </ui-toggle>

            <div layout="row gap:2">
              <settings-option static>
                Theme
                <span slot="description">
                  Changes application color theme.
                </span>
              </settings-option>
              <ui-input>
                <select
                  value="${options.theme}"
                  onchange="${html.set(options, 'theme')}"
                >
                  <option value="">Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </ui-input>
            </div>
          </div>
        </section>
      </settings-page-layout>
    </template>
  `,
};
