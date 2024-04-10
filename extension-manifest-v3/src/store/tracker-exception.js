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

import { store } from 'hybrids';

import { getPattern, isCategoryBlockedByDefault } from '/utils/trackerdb.js';

async function getListFromStorage() {
  const { exceptions = [] } = await chrome.storage.local.get(['exceptions']);
  return exceptions;
}

async function setListToStorage(list) {
  await chrome.storage.local.set({ exceptions: list });
}

export async function getExceptionStatus(trackerException, domain) {
  const { category } = await getPattern(trackerException.id);

  if (
    isCategoryBlockedByDefault(category) === trackerException.overwriteStatus
  ) {
    return trackerException.blocked.includes(domain)
      ? 'blocked:website'
      : 'trusted';
  } else {
    return trackerException.allowed.includes(domain)
      ? 'trusted:website'
      : 'blocked';
  }
}

const TrackerException = {
  id: true,
  overwriteStatus: false, // Change default blocked <-> allowed
  blocked: [String], // blocked domains
  allowed: [String], // allowed domains
  [store.connect]: {
    // Get method is optimized to only return cases when exception is not set
    // Always use store listing model to fetch exception first
    get: (id) => ({ id }),
    set: async (id, values) => {
      const list = await getListFromStorage();
      let item = id && list.find((i) => i.id === id);

      if (item) {
        Object.assign(item, values);
      } else {
        list.push(values);
      }

      await setListToStorage(list);

      return values;
    },
    list: getListFromStorage,
    loose: true,
  },
};

export default TrackerException;
