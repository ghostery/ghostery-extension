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
import FilterList from '../store/filter-list.js';

async function update(host, event) {
  asyncAction(
    event,
    chrome.runtime.sendMessage({
      action: 'customFilters:updateRules',
      input: host.input,
    }),
  );
}

async function addFilterList(host, event) {
  event.preventDefault();

  const { url } = await store.submit(host.filterList);
  host.filterList = null;

  await store.set(host.options, {
    customFilters: { filterLists: { [url]: { enabled: true } } },
  });
}

function removeFilterList(url) {
  return ({ options }) => store.set(options, { customFilters: { filterLists: { [url]: null } } });
}

function toggleFilterList(url, key) {
  return ({ options }, event) =>
    store.set(options, {
      customFilters: {
        filterLists: { [url]: { [key]: event.target.checked ?? event.target.value } },
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
  filterList: store(FilterList, { draft: true }),
  userScripts: {
    value: isUserScriptsSupported,
    connect: (host, key, invalidate) => {
      // Re-check the support after the user potentially enables "Allow user
      // scripts" in the browser settings and returns to the tab
      window.addEventListener('focus', invalidate);
      return () => window.removeEventListener('focus', invalidate);
    },
  },
  render: ({ options, customFilters, input, filterList, userScripts }) => html`
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
              <ui-text color="tertiary">
                Create custom filter rules to block specific content or bypass blocking on certain
                sites. The syntax is the same as for standard filter lists, but only a subset of
                rules is supported.
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

            ${!!customFilters.errors.length &&
            html`
              <div
                layout="column gap:0.5"
                data-qa="component:custom-filters:errors"
                slot="card-footer"
              >
                <ui-text type="body-s" color="danger-secondary" layout="inline">
                  <details>
                    <summary>Errors (${customFilters.errors.length})</summary>
                    <ol>
                      ${customFilters.errors.map(
                        (error) => html`<li layout="margin:bottom:0.5">${error}</li>`,
                      )}
                    </ol>
                  </details>
                </ui-text>
              </div>
            `}

            <label layout="row gap items:center ::user-select:none">
              <ui-input>
                <input
                  type="checkbox"
                  checked="${options.customFilters.trustedScriptlets}"
                  onchange="${html.set(options, 'customFilters.trustedScriptlets')}"
                  data-qa="checkbox:custom-filters:trusted-scriptlets"
                />
              </ui-input>
              <div layout="row gap:0.5 items:center">
                <ui-text type="body-s">Allow trusted scriptlets</ui-text>
                <ui-tooltip autohide="0" wrap delay="0" position="bottom" focusable>
                  <div slot="content" layout="width::250px">
                    Trusted scriptlets can use powerful rule modifiers. Only use filter lists from
                    authors you trust.
                  </div>
                  <ui-icon name="warning" color="warning-primary" layout="size:2"></ui-icon>
                </ui-tooltip>
              </div>
            </label>

            <ui-button layout="self:start" onclick="${update}" data-qa="button:custom-filters:save">
              <button>Save</button>
            </ui-button>
          </div>
          <div layout="column gap:2" slot="card-footer">
            <div layout="column gap:0.5">
              <ui-text color="tertiary">
                Add filter list URLs to have them automatically updated and applied.
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
                    ${msg.html`To use filter lists, enable "Allow user scripts"
                      in your browser's <a onclick="${openExtensionSettings}">extension settings</a>.`}
                  </ui-text>
                </div>
              </div>
            `}
            <div
              layout="column gap:2"
              inert="${__CHROMIUM__ && !userScripts}"
              style="${{ opacity: __CHROMIUM__ && !userScripts ? 0.5 : undefined }}"
            >
              <form layout="row gap items:start" data-qa="form:custom-filters:filter-list">
                <ui-input error="${store.error(filterList)}" layout="grow">
                  <input
                    type="url"
                    placeholder="${msg`Add a filter list URL`}"
                    value="${filterList.url}"
                    oninput="${html.set(filterList, 'url')}"
                    data-qa="input:custom-filters:filter-list"
                  />
                </ui-input>
                <ui-button onclick="${addFilterList}">
                  <button type="submit" data-qa="button:custom-filters:add-filter-list">Add</button>
                </ui-button>
              </form>
              ${!!Object.keys(options.customFilters.filterLists).length &&
              html`
                <div
                  layout="column gap:2 margin:top"
                  data-qa="component:custom-filters:filter-lists"
                >
                  ${Object.entries(options.customFilters.filterLists)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([url, { enabled, trustedScriptlets }]) => {
                      const name = customFilters.filterLists[url]?.name;
                      return html`
                        <div layout="column gap">
                          <ui-toggle
                            value="${enabled}"
                            onchange="${toggleFilterList(url, 'enabled')}"
                          >
                            <div layout="column gap:0.5 grow width:0">
                              <ui-text type="label-s">${name || url}</ui-text>
                              ${name &&
                              html`<ui-text type="body-s" color="secondary" ellipsis>
                                ${url}
                              </ui-text>`}
                              <div layout="row gap items:center">
                                <ui-text type="body-s" color="tertiary">
                                  ${customFilters.filterLists[url]?.lastUpdatedAt
                                    ? html`Last update:
                                      ${longDateFormatter.format(
                                        customFilters.filterLists[url].lastUpdatedAt,
                                      )}`
                                    : html`Pending update...`}
                                </ui-text>
                              </div>
                              ${!!customFilters.filterLists[url]?.error &&
                              html`
                                <ui-text type="body-s" color="danger-secondary">
                                  Failed update: ${customFilters.filterLists[url].error}
                                </ui-text>
                              `}
                            </div>
                          </ui-toggle>
                          ${!!customFilters.filterLists[url]?.errors.length &&
                          html`
                            <ui-text type="body-s" color="danger-secondary">
                              <details>
                                <summary>
                                  Errors (${customFilters.filterLists[url].errors.length})
                                </summary>
                                <ol>
                                  ${customFilters.filterLists[url].errors.map(
                                    (error) => html`<li layout="margin:bottom:0.5">${error}</li>`,
                                  )}
                                </ol>
                              </details>
                            </ui-text>
                          `}
                          <div layout="row gap:2 items:center">
                            <label layout="row gap items:center ::user-select:none">
                              <ui-input>
                                <input
                                  type="checkbox"
                                  checked="${trustedScriptlets}"
                                  onchange="${toggleFilterList(url, 'trustedScriptlets')}"
                                  data-qa="checkbox:custom-filters:filter-list-trusted-scriptlets"
                                />
                              </ui-input>
                              <div layout="row gap:0.5 items:center">
                                <ui-text type="body-s">Allow trusted scriptlets</ui-text>
                                <ui-tooltip autohide="0" wrap delay="0" position="bottom" focusable>
                                  <div slot="content" layout="width::250px">
                                    Trusted scriptlets can use powerful rule modifiers. Only use
                                    filter lists from authors you trust.
                                  </div>
                                  <ui-icon
                                    name="warning"
                                    color="warning-primary"
                                    layout="size:2"
                                  ></ui-icon>
                                </ui-tooltip>
                              </div>
                            </label>
                            <ui-action>
                              <button
                                onclick="${removeFilterList(url)}"
                                data-qa="button:custom-filters:remove-filter-list"
                                layout="row gap:0.5 items:center padding:0.25"
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
