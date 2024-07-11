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
import Options, { observe } from '/store/options.js';

// Pause / unpause hostnames
const PAUSED_ALARM_PREFIX = 'options:revoke';

observe('paused', async (paused) => {
  const alarms = (await chrome.alarms.getAll()).filter(({ name }) =>
    name.startsWith(PAUSED_ALARM_PREFIX),
  );
  const revokeHostnames = Object.entries(paused).filter(
    ([, { revokeAt }]) => revokeAt,
  );

  // Clear alarms for removed hostnames
  alarms.forEach(({ name }) => {
    if (
      !revokeHostnames.find(([id]) => name === `${PAUSED_ALARM_PREFIX}:${id}`)
    ) {
      chrome.alarms.clear(name);
    }
  });

  // Add alarms for new hostnames
  if (revokeHostnames.length) {
    revokeHostnames
      .filter(([id]) => !alarms.some(({ name }) => name === id))
      .forEach(([id, { revokeAt }]) => {
        chrome.alarms.create(`${PAUSED_ALARM_PREFIX}:${id}`, {
          when: revokeAt,
        });
      });
  }
});

// Remove paused hostname from options when alarm is triggered
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith(PAUSED_ALARM_PREFIX)) {
    const id = alarm.name.slice(PAUSED_ALARM_PREFIX.length + 1);
    store.set(Options, { paused: { [id]: null } });
  }
});
