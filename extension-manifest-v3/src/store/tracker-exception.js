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

import { requestPermission } from '../utils/offscreen.js';

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

const TrackerException = {
  id: true,
  blocked: true,
  blockedDomains: [String],
  trustedDomains: [String],
  getDomainStatus: (exception) => (domain) => {
    if (exception.blocked) {
      return exception.trustedDomains.includes(domain)
        ? { type: 'trust', website: true }
        : { type: 'block' };
    } else {
      return exception.blockedDomains.includes(domain)
        ? { type: 'block', website: true }
        : { type: 'trust' };
    }
  },
  [store.connect]: {
    // Only use list type to fetch all exceptions
    get: () => null,
    set: async (id, values) => {
      if (__PLATFORM__ !== 'safari' && __PLATFORM__ !== 'firefox') {
        await requestPermission();
      }

      return setStorage(values);
    },
    list: async () => Object.values(await getStorage()),
    loose: true,
  },
};

export default TrackerException;

chrome.storage.onChanged.addListener((changes) => {
  if (changes.exceptions) {
    store.clear([TrackerException], false);
  }
});

export function toggleExceptionDomain(
  exception,
  domain,
  blockedByDefault,
  forceValue,
) {
  const blocked = store.ready(exception) ? exception.blocked : blockedByDefault;
  const type = blocked ? 'trustedDomains' : 'blockedDomains';
  const list = [...(store.ready(exception) ? exception[type] : [])];

  const index = list.indexOf(domain);
  if (index !== -1) {
    if (forceValue !== true) {
      list.splice(index, 1);
    }
  } else if (forceValue !== false) {
    list.push(domain);
  }

  const values = { [type]: list };

  if (!store.ready(exception)) {
    values.blocked = blockedByDefault;
  }

  return store.set(exception, values);
}
