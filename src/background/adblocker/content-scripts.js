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
    async register(hostname, scriptletsByWorld) {
      const key = JSON.stringify(scriptletsByWorld);
      if (map.get(hostname)?.key === key) return;

      if (!map.has(hostname) && map.size >= 1000) this.unregisterAll();
      this.unregister(hostname);

      const registered = [];
      map.set(hostname, { key, registered });

      try {
        for (const [world, code] of Object.entries(scriptletsByWorld)) {
          if (!code) continue;

          registered.push(
            await browser.contentScripts.register({
              js: [{ code }],
              allFrames: true,
              matches: [`https://${hostname}/*`, `http://${hostname}/*`],
              matchAboutBlank: true,
              matchOriginAsFallback: true,
              runAt: 'document_start',
              world,
            }),
          );

          // A newer registration replaced this entry while awaiting.
          if (map.get(hostname)?.registered !== registered) {
            registered.pop().unregister();
            return;
          }
        }
      } catch (e) {
        console.warn(e);
        if (map.get(hostname)?.registered === registered) this.unregister(hostname);
      }
    },
    unregister(hostname) {
      for (const contentScript of map.get(hostname)?.registered ?? []) {
        contentScript.unregister();
      }
      map.delete(hostname);
    },
    unregisterAll() {
      for (const hostname of map.keys()) {
        this.unregister(hostname);
      }
    },
  };
})();
