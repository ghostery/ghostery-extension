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

// Simplified version of chrome.alarms API from MV3
function shimAlarms() {
  const listeners = new Set();
  const alarms = new Map();

  return {
    async get(name) {
      if (alarms.has(name)) {
        return { name };
      }
    },
    async clear(name) {
      clearTimeout(alarms.get(name));
      alarms.delete(name);
    },
    async getAll() {
      return Array.from(alarms.keys()).map((name) => ({ name }));
    },
    async clearAll() {
      alarms.forEach((timeout) => clearTimeout(timeout));
      alarms.clear();
    },
    create(name, options) {
      if (options.when) {
        if (alarms.has(name)) this.clear(name);

        alarms.set(
          name,
          setTimeout(() => {
            listeners.forEach((fn) => fn({ name }));
            if (options.periodInMinutes) {
              setInterval(() => {
                listeners.forEach((fn) => fn({ name }));
              }, options.periodInMinutes * 60 * 1000);
            }
          }, options.when - Date.now()),
        );
      } else {
        throw new Error('Invalid alarm options');
      }
    },
    onAlarm: {
      addListener(fn) {
        listeners.add(fn);
      },
    },
  };
}

if (__PLATFORM__ === 'firefox') {
  window.chrome = Object.assign(browser, {
    alarms: shimAlarms(),
  });
}

if (!chrome.action) {
  window.chrome.action = chrome.browserAction;
}
