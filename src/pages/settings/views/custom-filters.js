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

import { longDateFormatter, numberFormatter } from '/ui/labels.js';

import Options from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';
import { CUSTOM_FILTERS_MAX_DYNAMIC_RULES } from '/utils/dnr.js';
import { isUserScriptsSupported } from '/utils/user-scripts.js';
import { asyncAction } from '../utils/actions.js';
import RemoteUrl from '../store/remote-url.js';

async function update(host, event) {
  asyncAction(
    event,
    chrome.runtime.sendMessage({
      action: 'customFilters:updateRules',
      input: host.input,
    }),
  );
}

async function addRemoteUrl(host, event) {
  event.preventDefault();

  const { url } = await store.submit(host.remoteUrl);
  host.remoteUrl = null;

  await store.set(host.options, {
    customFilters: { remoteUrls: { [url]: { enabled: true } } },
  });
}

function removeRemoteUrl(url) {
  return ({ options }) => store.set(options, { customFilters: { remoteUrls: { [url]: null } } });
}

function toggleRemoteUrl(url, key) {
  return ({ options }, event) =>
    store.set(options, {
      customFilters: {
        remoteUrls: { [url]: { [key]: event.target.checked ?? event.target.value } },
      },
    });
}

function openExtensionSettings(host, event) {
  event.preventDefault();
  chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
}

export default {
  options: store(Options),
  customFilters: store(CustomFilters),
  input: ({ customFilters }, value) =>
    value ?? ((store.ready(customFilters) && customFilters.text) || ''),
  remoteUrl: store(RemoteUrl, { draft: true }),
  userScripts: {
    value: isUserScriptsSupported,
    connect: (host, key, invalidate) => {
      // Re-check the support after the user potentially enables "Allow user
      // scripts" in the browser settings and returns to the tab
      window.addEventListener('focus', invalidate);
      return () => window.removeEventListener('focus', invalidate);
    },
  },
  render: ({ options, customFilters, input, remoteUrl, userScripts }) => html`
    <template layout="contents">
      <settings-toggle
        value="${options.customFilters.enabled}"
        onchange="${html.set(options, 'customFilters.enabled')}"
        icon="detailed-view"
        data-qa="toggle:custom-filters"
      >
        Custom Filters
        <span slot="description">
          Facilitates the creation of your own ad-blocking rules to customize your Ghostery
          experience.
        </span>
        <ui-text type="label-s" color="primary" slot="footer">
          <a
            href="https://github.com/ghostery/adblocker/wiki/Compatibility-Matrix"
            target="_blank"
            rel="noreferrer"
            layout="row items:center gap:2px"
          >
            Learn more on supported syntax
            <ui-icon name="chevron-right-s"></ui-icon>
          </a>
        </ui-text>
        ${options.customFilters.enabled &&
        store.ready(customFilters) &&
        html`
          <div layout="column gap:2" slot="card-footer">
            <div layout="column gap:0.5">
              <ui-text type="headline-xs">Local Filter Rules</ui-text>
              <ui-text type="body-s" color="tertiary">
                Create your own filter rules to block specific content or bypass blocking on certain
                sites. The syntax is the same as for regular filter lists, but only a subset of
                supported rules is allowed. Changes are applied immediately after saving.
              </ui-text>
            </div>
            <ui-input>
              <textarea
                rows="6"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                oninput="${html.set('input')}"
                defaultValue="${input}"
                data-qa="input:custom-filters"
              ></textarea>
            </ui-input>

            <label layout="row gap items:center ::user-select:none">
              <ui-input>
                <input
                  type="checkbox"
                  checked="${options.customFilters.trustedScriptlets}"
                  onchange="${html.set(options, 'customFilters.trustedScriptlets')}"
                  data-qa="checkbox:custom-filters:trusted-scriptlets"
                />
              </ui-input>
              <ui-text type="body-s">Allow trusted scriptlets</ui-text>
            </label>

            <ui-button layout="self:start" onclick="${update}" data-qa="button:custom-filters:save">
              <button>Save</button>
            </ui-button>
          </div>
          <div layout="column gap:2" slot="card-footer">
            <div layout="column gap:0.5">
              <ui-text type="headline-xs">Remote Filter Lists</ui-text>
              <ui-text type="body-s" color="tertiary">
                Add URLs of filter lists to have them automatically updated and applied. Only lists
                in the supported format will be added successfully.
              </ui-text>
            </div>
            ${__CHROMIUM__ &&
            !userScripts &&
            html`
              <div
                layout="column gap:0.5"
                slot="card-footer"
                data-qa="component:custom-filters:user-scripts-warning"
              >
                <div layout="row gap:0.5 items:center">
                  <ui-icon name="warning" color="warning-secondary" layout="size:2"></ui-icon>
                  <ui-text type="body-s" color="warning-secondary" underline>
                    To use remote filter lists, enable "Allow user scripts" in your browser's
                    <a
                      href="${`chrome://extensions/?id=${chrome.runtime.id}`}"
                      onclick="${openExtensionSettings}"
                      >extension settings</a
                    >.
                  </ui-text>
                </div>
              </div>
            `}
            <div
              layout="column gap:2"
              inert="${__CHROMIUM__ && !userScripts}"
              style="${{ opacity: __CHROMIUM__ && !userScripts ? 0.5 : undefined }}"
            >
              <form layout="row gap items:start" data-qa="form:custom-filters:remote-url">
                <ui-input error="${store.error(remoteUrl)}" layout="grow">
                  <input
                    type="url"
                    placeholder="${msg`Enter filter list URL`}"
                    value="${remoteUrl.url}"
                    oninput="${html.set(remoteUrl, 'url')}"
                    data-qa="input:custom-filters:remote-url"
                  />
                </ui-input>
                <ui-button onclick="${addRemoteUrl}">
                  <button type="submit" data-qa="button:custom-filters:add-remote-url">Add</button>
                </ui-button>
              </form>
              ${!!Object.keys(options.customFilters.remoteUrls).length &&
              html`
                <div
                  layout="column gap:2 margin:top"
                  data-qa="component:custom-filters:remote-urls"
                >
                  ${Object.entries(options.customFilters.remoteUrls)
                    .sort()
                    .map(([url, { enabled, trustedScriptlets }]) => {
                      const name = customFilters.remoteUrls[url]?.name;
                      return html`
                        <div layout="column gap">
                          <ui-toggle
                            value="${enabled}"
                            onchange="${toggleRemoteUrl(url, 'enabled')}"
                          >
                            <div layout="row gap items:center">
                              <div layout="column gap:0.5 grow overflow">
                                <ui-text type="label-s">${name || url}</ui-text>
                                ${name &&
                                html`<ui-text type="body-s" color="secondary" ellipsis
                                  >${url}</ui-text
                                >`}
                                <div layout="row gap items:center">
                                  <ui-text type="body-s" color="tertiary">
                                    ${customFilters.remoteUrls[url]?.lastUpdatedAt
                                      ? html`Last updated:
                                        ${longDateFormatter.format(
                                          customFilters.remoteUrls[url].lastUpdatedAt,
                                        )}`
                                      : html`Pending update...`}
                                  </ui-text>
                                </div>
                                ${!!customFilters.remoteUrls[url]?.error &&
                                html`
                                  <ui-text type="body-s" color="danger-secondary">
                                    Failed update: ${customFilters.remoteUrls[url].error}
                                  </ui-text>
                                `}
                              </div>
                            </div>
                          </ui-toggle>
                          <div layout="row gap:2 items:center">
                            <label layout="row gap items:center ::user-select:none">
                              <ui-input>
                                <input
                                  type="checkbox"
                                  checked="${trustedScriptlets}"
                                  onchange="${toggleRemoteUrl(url, 'trustedScriptlets')}"
                                  data-qa="checkbox:custom-filters:remote-url-trusted-scriptlets"
                                />
                              </ui-input>
                              <ui-text type="body-s">Allow trusted scriptlets</ui-text>
                            </label>
                            <ui-action>
                              <button
                                onclick="${removeRemoteUrl(url)}"
                                data-qa="button:custom-filters:remove-remote-url"
                                layout="row gap:0.5 items:center"
                              >
                                <ui-icon name="trash" layout="size:2" color="tertiary"></ui-icon>
                                <ui-text type="body-s">Remove</ui-text>
                              </button>
                            </ui-action>
                          </div>
                        </div>
                      `.key(url);
                    })}
                </div>
              `}
            </div>
          </div>
          ${!!customFilters.errors.length &&
          html`
            <div
              layout="column gap:0.5"
              data-qa="component:custom-filters:errors"
              slot="card-footer"
            >
              <ui-text type="headline-xs">
                Compilation errors (${customFilters.errors.length})
              </ui-text>
              <ui-text type="body-s" color="danger-secondary">
                <ol>
                  ${customFilters.errors.map(
                    (error) => html`<li layout="margin:bottom:0.5">${error}</li>`,
                  )}
                </ol>
              </ui-text>
            </div>
          `}
          <div
            layout="column gap margin:top"
            data-qa="component:custom-filters:usage"
            slot="card-footer"
          >
            <div layout="row gap:2">
              ${__CHROMIUM__ &&
              html`<ui-text type="body-s" color="secondary">
                DNR rules: ${numberFormatter.format(customFilters.dnrRules)} /
                ${numberFormatter.format(CUSTOM_FILTERS_MAX_DYNAMIC_RULES)}
              </ui-text>`}
              ${__FIREFOX__ &&
              html`<ui-text type="body-s" color="secondary">
                Network filters: ${numberFormatter.format(customFilters.networkFilters)}
              </ui-text>`}
              <ui-text type="body-s" color="secondary">
                Cosmetic filters: ${numberFormatter.format(customFilters.cosmeticFilters)}
              </ui-text>
            </div>
          </div>
        `}
      </settings-toggle>
    </template>
  `,
};
