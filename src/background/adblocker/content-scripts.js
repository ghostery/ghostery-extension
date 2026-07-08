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

// chrome.userScripts is the Chromium counterpart of Firefox's browser.contentScripts,
// so this mirrors the `contentScripts` registry below. The one real difference: userScripts
// registrations persist across service-worker restarts, so ids are stable (register upserts
// via update), unregister addresses them by id, and unregisterAll purges by namespace (the
// in-memory map is empty after a restart). The lifecycle hooks in cosmetics.js drive it.
const USER_SCRIPTS_NAMESPACE = 'ghostery-scriptlet';
const USER_SCRIPTS_WORLDS = ['MAIN', 'USER_SCRIPT'];

function userScriptId(hostname, world) {
  return `${USER_SCRIPTS_NAMESPACE}:${world}:${hostname}`;
}

export const userScripts = (() => {
  const map = new Map();
  return {
    async register(hostname, scriptletsByWorld) {
      try {
        for (const [world, code] of Object.entries(scriptletsByWorld)) {
          if (!code) continue;

          const script = {
            id: userScriptId(hostname, world),
            js: [{ code }],
            allFrames: true,
            matches: [`https://${hostname}/*`, `http://${hostname}/*`],
            runAt: 'document_start',
            world,
          };

          // register() throws if the id persisted from a previous session; update it instead.
          await chrome.userScripts
            .register([script])
            .catch(() => chrome.userScripts.update([script]));
        }
      } catch (e) {
        console.warn(e);
        return;
      }

      map.set(hostname, true);
    },
    isRegistered(hostname) {
      return map.has(hostname);
    },
    unregister(hostname) {
      map.delete(hostname);
      const ids = USER_SCRIPTS_WORLDS.map((world) => userScriptId(hostname, world));
      chrome.userScripts.unregister({ ids }).catch(() => {});
    },
    unregisterAll() {
      map.clear();
      chrome.userScripts.getScripts().then((scripts) => {
        const ids = scripts.filter((s) => s.id.startsWith(USER_SCRIPTS_NAMESPACE)).map((s) => s.id);
        if (ids.length) chrome.userScripts.unregister({ ids }).catch(() => {});
      }, console.warn);
    },
  };
})();

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
