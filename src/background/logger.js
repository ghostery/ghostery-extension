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
import * as engines from '/utils/engines.js';
import { getMetadata, getOrganizations } from '/utils/trackerdb.js';

import { setup } from './adblocker.js';

const ports = new Set();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'logger') {
    ports.add(port);

    const id = port.sender.tab.id;
    console.log('[logger] Connected logger with id', id);

    port.onDisconnect.addListener(() => {
      ports.delete(port);
      console.log('[logger] Disconnected logger with id', id);
    });
  }
});

export async function sendRequests(requests) {
  if (ports.size === 0) return;

  setup.pending && (await setup.pending);

  const engine = engines.get(engines.MAIN_ENGINE);
  const organizations = await getOrganizations();

  const logs = requests.map((request) => {
    const { filter } = engine.match(request);
    const metadata = getMetadata(request);

    return {
      ...request,
      filter: filter ? String(filter) : '',
      tracker: metadata?.name,
      organization: organizations.get(metadata?.organization)?.name,
    };
  });

  for (const port of ports) {
    port.postMessage({ action: 'logger:requests', logs });
  }
}
