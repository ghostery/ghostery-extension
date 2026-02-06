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

const STORAGE_TEST_KEY = `__storage_test__${Date.now()}`;

export async function checkStorage() {
  try {
    await chrome.storage.local.set({ [STORAGE_TEST_KEY]: 'test' });
    const result = await chrome.storage.local.get(STORAGE_TEST_KEY);
    await chrome.storage.local.remove(STORAGE_TEST_KEY);

    return result[STORAGE_TEST_KEY] === 'test';
  } catch (e) {
    console.error('[storage] Storage check failed:', e);
    throw e;
  }
}

export function getLocalStorageItem(key) {
  try {
    return globalThis.localStorage.getItem(key);
  } catch (e) {
    console.error(
      `[storage] Failed to get localStorage item for key "${key}":`,
      e,
    );
    return null;
  }
}

export function setLocalStorageItem(key, value) {
  try {
    globalThis.localStorage.setItem(key, value);
  } catch (e) {
    console.error(
      `[storage] Failed to set localStorage item for key "${key}":`,
      e,
    );
  }
}
