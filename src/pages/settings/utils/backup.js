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

import { store, msg } from 'hybrids';
import { saveAs } from 'file-saver';

import Options, { SYNC_OPTIONS } from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';
import ElementPickerSelectors from '/store/element-picker-selectors.js';

import getBrowserInfo from '/utils/browser-info.js';

const DATA_VERSION = 1;

export async function exportToFile() {
  const options = await store.resolve(Options);
  const customFilters = await store.resolve(CustomFilters);
  const elementPickerSelectors = await store.resolve(ElementPickerSelectors);

  const data = {
    timestamp: Date.now(),
    version: DATA_VERSION,
    options: Object.fromEntries(SYNC_OPTIONS.map((key) => [key, options[key]])),
  };

  if (customFilters.text) {
    data.customFilters = customFilters.text;
  }

  if (Object.keys(elementPickerSelectors.hostnames).length > 0) {
    data.blockedElements = elementPickerSelectors.hostnames;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  if (__PLATFORM__ === 'safari') {
    const browserInfo = await getBrowserInfo();

    if (browserInfo.os === 'ios' || browserInfo.os === 'ipados') {
      const fileReader = new FileReader();

      fileReader.onload = function (e) {
        const url = e.target.result;
        chrome.tabs.create({ url });
      };
      fileReader.readAsDataURL(blob);

      return;
    }
  }

  saveAs(blob, `ghostery-settings-${new Date().toISOString()}.json`);
}

function resolveBackupFormat(text) {
  const data = JSON.parse(text);

  if (!data || typeof data !== 'object') {
    throw new Error(msg`Error: invalid file format.`);
  }

  return {
    timestamp: data.timestamp || data.timeStamp,
    version: typeof data.version === 'number' ? data.version : DATA_VERSION,
    options: data.options || {
      theme: data.userSettings?.uiTheme || '',
      customFilters: {
        enabled: !!data.userFilters,
        trustedScriptlets: data.userSettings?.userFiltersTrusted,
      },
      paused:
        data.whitelist?.reduce((acc, id) => {
          acc[id] = { revokeAt: 0 };
          return acc;
        }, {}) || {},
    },
    customFilters: data.customFilters || data.userFilters || '',
    blockedElements: data.blockedElements || null,
  };
}

export function importFromFile(event) {
  const input = event.target;
  if (!input.files || input.files.length === 0) return;

  const file = event.target.files[0];

  const reader = new FileReader();
  const result = new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      input.value = '';

      try {
        const data = resolveBackupFormat(e.target.result);

        if (typeof data.timestamp !== 'number') {
          throw new Error(msg`Error: invalid file format.`);
        }

        if (data.version !== DATA_VERSION) {
          throw new Error(
            msg`Error: unsupported file version ${data.version} - expected ${DATA_VERSION}.`,
          );
        }

        // Set custom filters value
        await store.set(CustomFilters, { text: data.customFilters });

        // Set element picker selectors
        await store.set(ElementPickerSelectors, {
          hostnames: data.blockedElements,
        });

        // Clean up paused domains and exceptions
        await store.set(Options, { paused: null, exceptions: null });

        const options = Object.fromEntries(
          SYNC_OPTIONS.map((key) => [key, data.options[key]]).filter(
            ([, value]) => value !== undefined,
          ),
        );

        // Overwrite options
        await store.set(Options, options);

        resolve(
          msg`The backup from ${new Date(data.timestamp).toLocaleString()} imported successfully.`,
        );
      } catch (error) {
        reject(error);
      }
    };
  });

  reader.readAsText(file);

  return result;
}
