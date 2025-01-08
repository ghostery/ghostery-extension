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

const storage = new Map();

export default {
  id: true,
  tabId: '',

  // From request
  url: '',
  timestamp: 0,
  blocked: false,
  modified: false,
  type: '',

  // From matched filter
  filter: '',

  time: ({ timestamp }) => new Date(timestamp).toLocaleTimeString(),

  [store.connect]: {
    get: (id) => storage.get(id),
    set: (id, values) => {
      const request = {
        ...values,
        type: values.type === 'xmlhttprequest' ? 'xhr' : values.type,
      };

      storage.set(id, request);
      return request;
    },
    list: ({ tabId, status }) =>
      Array.from(storage.values()).filter((request) => {
        let match = true;

        if (tabId && request.tabId !== tabId) {
          match = false;
        }

        switch (status) {
          case 'touched':
            if (!request.blocked && !request.modified) match = false;
            break;

          case 'warning':
            if (request.filter && (request.blocked || request.modified))
              match = false;
            if (!request.filter && !request.blocked && !request.modified)
              match = false;
            break;
        }

        return match;
      }),
    loose: true,
  },
};
