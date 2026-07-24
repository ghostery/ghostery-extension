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

const firefoxRegistry = (() => {
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

// Registrations persist across service-worker restarts, so register() upserts by a stable id
// and unregisterAll() queries the browser to purge them (the map is empty after a restart).
const USER_SCRIPTS_NAMESPACE = 'ghostery-scriptlet';

function userScriptId(hostname, world) {
  return `${USER_SCRIPTS_NAMESPACE}:${world}:${hostname}`;
}

// __CHROMIUM__ guard so chrome.userScripts is tree-shaken from the Firefox build.
const chromiumRegistry =
  __CHROMIUM__ &&
  (() => {
    const map = new Map();
    return {
      async register(hostname, scriptletsByWorld) {
        const scripts = [];
        for (const [world, code] of Object.entries(scriptletsByWorld)) {
          if (!code) continue;

          scripts.push({
            id: userScriptId(hostname, world),
            js: [{ code }],
            allFrames: true,
            matches: [`https://${hostname}/*`, `http://${hostname}/*`],
            runAt: 'document_start',
            world: world === 'ISOLATED' ? 'USER_SCRIPT' : world,
          });
        }

        if (scripts.length) {
          await chrome.userScripts
            .register(scripts)
            .catch(() => chrome.userScripts.update(scripts))
            .catch((e) => console.warn(e));
        }

        map.set(hostname, true);
      },
      isRegistered(hostname) {
        return map.has(hostname);
      },
      unregister(hostname) {
        map.delete(hostname);
        const ids = ['MAIN', 'ISOLATED'].map((world) => userScriptId(hostname, world));
        chrome.userScripts.unregister({ ids }).catch(() => {});
      },
      unregisterAll() {
        map.clear();
        chrome.userScripts.getScripts().then((scripts) => {
          const ids = scripts
            .filter((s) => s.id.startsWith(USER_SCRIPTS_NAMESPACE))
            .map((s) => s.id);
          if (ids.length) chrome.userScripts.unregister({ ids }).catch(() => {});
        }, console.warn);
      },
    };
  })();

// browser.contentScripts (Firefox) and chrome.userScripts (Chromium) fill the same role;
// the rest of the adblocker treats whichever one this resolves to as "content scripts".
export const contentScripts = __FIREFOX__ ? firefoxRegistry : chromiumRegistry;
