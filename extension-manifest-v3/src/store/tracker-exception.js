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

import { isCategoryBlockedByDefault } from '/utils/trackerdb.js';
import { requestPermission } from '/utils/dnr-converter';

async function getStorage() {
  const { exceptions = {} } = await chrome.storage.local.get(['exceptions']);
  return exceptions;
}

let promise;
let items = null;
async function setStorage(item) {
  if (!promise) {
    // eslint-disable-next-line no-async-promise-executor
    promise = new Promise(async (resolve) => {
      const exceptions = Object.assign(await getStorage(), items);
      await chrome.storage.local.set({ exceptions });

      promise = null;
      items = null;

      resolve();
    });

    items = {};
  }

  items[item.id] = item;

  return promise.then(() => item);
}

export function getExceptionStatus(trackerException, domain, category) {
  if (
    isCategoryBlockedByDefault(category) === trackerException.overwriteStatus
  ) {
    return trackerException.blocked.includes(domain)
      ? { type: 'block', website: true }
      : { type: 'trust' };
  } else {
    return trackerException.allowed.includes(domain)
      ? { type: 'trust', website: true }
      : { type: 'block' };
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
      await requestPermission();
      return setStorage(values);
    },
    list: async () => Object.values(await getStorage()),
    loose: true,
  },
};

export default TrackerException;
