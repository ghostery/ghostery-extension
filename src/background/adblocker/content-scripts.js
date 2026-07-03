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
      this.unregister(hostname);

      const registered = [];
      try {
        for (const [world, code] of Object.entries(scriptletsByWorld)) {
          if (!code) continue;

          registered.push(
            await browser.contentScripts.register({
              js: [{ code }],
              allFrames: true,
              matches: [`https://*.${hostname}/*`, `http://*.${hostname}/*`],
              matchAboutBlank: true,
              matchOriginAsFallback: true,
              runAt: 'document_start',
              world,
            }),
          );
        }
      } catch (e) {
        console.warn(e);
        for (const contentScript of registered) {
          contentScript.unregister();
        }
        return;
      }

      // Cache the entry (even when empty) so isRegistered() short-circuits later navigations.
      map.set(hostname, registered);
    },
    isRegistered(hostname) {
      return map.has(hostname);
    },
    unregister(hostname) {
      for (const contentScript of map.get(hostname) ?? []) {
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
