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

export const contentScripts = (() => {
  const map = new Map();

  return {
    async register(hostname, codeByWorld) {
      const key = JSON.stringify(codeByWorld);
      if (map.get(hostname)?.key === key) return;

      if (!map.has(hostname) && map.size >= 1000) this.unregisterAll();
      this.unregister(hostname);

      const entry = { key, handles: [] };
      map.set(hostname, entry);

      try {
        for (const [world, code] of Object.entries(codeByWorld)) {
          if (!code) continue;

          const handle = await browser.contentScripts.register({
            js: [{ code }],
            allFrames: true,
            matches: [`https://${hostname}/*`, `http://${hostname}/*`],
            matchAboutBlank: true,
            matchOriginAsFallback: true,
            runAt: 'document_start',
            world,
          });

          // A newer registration replaced this entry while awaiting.
          if (map.get(hostname) !== entry) {
            handle.unregister();
            return;
          }

          entry.handles.push(handle);
        }
      } catch (e) {
        console.warn('[adblocker] failed to register scriptlets for', hostname, e);
        if (map.get(hostname) === entry) this.unregister(hostname);
      }
    },
    unregister(hostname) {
      const entry = map.get(hostname);
      if (!entry) return;

      map.delete(hostname);
      for (const handle of entry.handles) {
        handle.unregister();
      }
    },
    unregisterAll() {
      for (const hostname of [...map.keys()]) {
        this.unregister(hostname);
      }
    },
  };
})();
