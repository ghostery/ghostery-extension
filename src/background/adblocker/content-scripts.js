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
    async register(hostname, code) {
      this.unregister(hostname);
      try {
        const contentScript = await browser.contentScripts.register({
          js: [
            {
              code,
            },
          ],
          allFrames: true,
          matches: [`https://*.${hostname}/*`, `http://*.${hostname}/*`],
          matchAboutBlank: true,
          matchOriginAsFallback: true,
          runAt: 'document_start',
          world: 'MAIN',
        });
        map.set(hostname, contentScript);
      } catch (e) {
        console.warn(e);
        this.unregister(hostname);
      }
    },
    isRegistered(hostname) {
      return map.has(hostname);
    },
    unregister(hostname) {
      const contentScript = map.get(hostname);
      if (contentScript) {
        contentScript.unregister();
        map.delete(hostname);
      }
    },
    unregisterAll() {
      for (const hostname of map.keys()) {
        this.unregister(hostname);
      }
    },
  };
})();
