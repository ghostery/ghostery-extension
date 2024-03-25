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

async function getListFromStorage() {
  const { exceptions = [] } = await chrome.storage.local.get(['exceptions']);
  return exceptions;
}

async function setListToStorage(list) {
  await chrome.storage.local.set({ exceptions: list });
}

const TrackerException = {
  id: true,
  overwriteStatus: false, // Change default blocked <-> allowed
  blocked: [String], // blocked domains
  allowed: [String], // allowed domains
  [store.connect]: {
    list: getListFromStorage,
    get: async (id) =>
      (await getListFromStorage()).find((i) => i.id === id) || {},
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
  },
};

export default TrackerException;

chrome.storage.onChanged.addListener((changes) => {
  if (changes['exceptions']) {
    store.clear(TrackerException, false);
  }
});
