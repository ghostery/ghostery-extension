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
import { FilterType } from '@ghostery/adblocker';
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
  filterId: 0,
  filterType: FilterType.NETWORK, // FilterType enum from adblocker library
  exception: false,

  // From TrackerDB
  tracker: '',
  organization: '',

  time: ({ timestamp }) => new Date(timestamp).toLocaleTimeString(),
  typeLabel: ({ filterType, type }) =>
    `${FilterType[filterType].toLowerCase()}${type ? ` (${type})` : ''}`,

  [store.connect]: {
    get: (id) => storage.find((item) => item.id === id),
    set: (id, values) => {
      values = {
        ...values,
        type: values.type === 'xmlhttprequest' ? 'xhr' : values.type,
      };

      const log = storage.find((item) => item.id === id);
      if (log) {
        Object.assign(log, values);
      } else {
        storage.push(values);
      }

      return values;
    },
    list: ({ tabId, query, filterType }) => {
      const needle = query?.trim().toLowerCase();

      if (!tabId && !needle && !filterType)
        return storage.slice().sort((a, b) => a.timestamp - b.timestamp);

      return storage
        .filter((log) => {
          let match = true;

          if (tabId && log.tabId !== tabId) {
            match = false;
          }

          if (filterType && log.filterType !== filterType) {
            match = false;
          }

          if (
            needle &&
            !log.url?.toLowerCase().includes(needle) &&
            !log.filter?.toLowerCase().includes(needle) &&
            !log.tracker?.toLowerCase().includes(needle) &&
            !log.organization?.toLowerCase().includes(needle)
          ) {
            match = false;
          }

          return match;
        })
        .sort((a, b) => a.timestamp - b.timestamp);
    },
    loose: true,
  },
};
