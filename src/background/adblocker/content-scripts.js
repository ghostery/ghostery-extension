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

function registerWorld(hostname, world, code) {
  const options = {
    js: [{ code }],
    allFrames: true,
    matches: [`https://*.${hostname}/*`, `http://*.${hostname}/*`],
    matchAboutBlank: true,
    matchOriginAsFallback: true,
    runAt: 'document_start',
  };

  // `world: 'MAIN'` is only honored on Firefox 128+; omitting `world` runs in the
  // isolated content-script world, which is supported on every Firefox version.
  if (world === 'MAIN') {
    options.world = 'MAIN';
  }

  return browser.contentScripts.register(options);
}

export const contentScripts = (() => {
  const map = new Map();
  return {
    async register(hostname, scripts) {
      this.unregister(hostname);

      const handles = {};

      // Register the isolated world first so that a MAIN-world rejection on
      // Firefox < 128 cannot prevent the isolated scriptlets from registering.
      for (const world of ['ISOLATED', 'MAIN']) {
        const code = scripts[world];
        if (!code) continue;

        try {
          handles[world] = await registerWorld(hostname, world, code);
        } catch (e) {
          console.warn(e);
        }
      }

      if (Object.keys(handles).length) {
        map.set(hostname, handles);
      }
    },
    isRegistered(hostname) {
      return map.has(hostname);
    },
    unregister(hostname) {
      const handles = map.get(hostname);
      if (handles) {
        for (const handle of Object.values(handles)) {
          handle.unregister();
        }
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
