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

      // Reserve the hostname synchronously so the onCommitted pass short-circuits on
      // isRegistered() before this async register resolves — otherwise both the
      // onBeforeNavigate and onCommitted passes register the same hostname and leak
      // two overlapping content scripts, injecting the scriptlet twice.
      const registered = [];
      map.set(hostname, registered);

      try {
        for (const [world, code] of Object.entries(scriptletsByWorld)) {
          if (!code) continue;

          registered.push(
            await browser.contentScripts.register({
              js: [{ code }],
              allFrames: true,
              // Exact hostname: a `*.` wildcard would double-inject into subdomain frames that self-register.
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

// userScripts registrations persist across restarts; upsert by a stable id, purge via getScripts().
const USER_SCRIPTS_NAMESPACE = 'ghostery-scriptlet';

function userScriptId(hostname, world) {
  return `${USER_SCRIPTS_NAMESPACE}:${world}:${hostname}`;
}

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

export const contentScripts = __FIREFOX__ ? firefoxRegistry : chromiumRegistry;
