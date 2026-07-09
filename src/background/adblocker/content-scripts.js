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

      // Reserve synchronously so a concurrent onCommitted register() short-circuits on
      // isRegistered() instead of registering the hostname again and injecting twice.
      const registered = [];
      map.set(hostname, registered);

      try {
        for (const [world, code] of Object.entries(scriptletsByWorld)) {
          if (!code) continue;

          registered.push(
            await browser.contentScripts.register({
              js: [{ code }],
              allFrames: true,
              // Subdomain frames register their own scriptlets, so match only this exact hostname.
              matches: [`https://${hostname}/*`, `http://${hostname}/*`],
              matchAboutBlank: true,
              matchOriginAsFallback: true,
              runAt: 'document_start',
              world,
            }),
          );
        }
      } catch (e) {
        console.warn(e);
        this.unregister(hostname);
      }
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
