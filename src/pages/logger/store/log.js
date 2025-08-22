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

const storage = [];

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

  // From TrackerDB
  tracker: '',
  organization: '',

  time: ({ timestamp }) => new Date(timestamp).toLocaleTimeString(),

  [store.connect]: {
    get: (id) => storage.find((item) => item.id === id),
    set: (id, values) => {
      const request = {
        ...values,
        type: values.type === 'xmlhttprequest' ? 'xhr' : values.type,
      };

      const log = storage.find((item) => item.id === id);
      if (log) {
        Object.assign(log, request);
      } else {
        storage.push(request);
      }

      return request;
    },
    list: ({ tabId, query, status }) => {
      query = query && new RegExp(query.trim(), 'i');

      return storage.filter((log) => {
        let match = true;

        if (tabId && log.tabId !== tabId) {
          match = false;
        }

        if (
          query &&
          !query.test(log.url) &&
          !query.test(log.filter) &&
          !query.test(log.tracker) &&
          !query.test(log.organization)
        ) {
          match = false;
        }

        switch (status) {
          case 'touched':
            if (!log.blocked && !log.modified) match = false;
            break;

          case 'warning':
            if (log.filter && (log.blocked || log.modified)) match = false;
            if (!log.filter && !log.blocked && !log.modified) match = false;
            break;
        }

        return match;
      });
    },
    loose: true,
  },
};
