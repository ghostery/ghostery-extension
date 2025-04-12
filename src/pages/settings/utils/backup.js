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

import Options, { SYNC_PROTECTED_OPTIONS } from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';

const DATA_VERSION = 1;

export async function exportToFile() {
  const options = await store.resolve(Options);
  const customFilters = await store.resolve(CustomFilters);

  const data = {
    timestamp: Date.now(),
    version: DATA_VERSION,
    options: Object.fromEntries(
      SYNC_PROTECTED_OPTIONS.map((key) => [key, options[key]]),
    ),
    customFilters: customFilters.text,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: `ghostery-settings-${new Date().toISOString()}.json`,
    style: 'display: none',
  });

  document.body.appendChild(link).click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

        // Clean up paused domains and exceptions
        await store.set(Options, { paused: null, exceptions: null });

        const options = Object.fromEntries(
          SYNC_PROTECTED_OPTIONS.map((key) => [key, data.options[key]]).filter(
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
