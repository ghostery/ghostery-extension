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

import getBrowserInfo from '/utils/browser-info.js';

export const EXECUTION_WORLD = {
  MAIN: 'MAIN',
  ISOLATED: 'ISOLATED',
};

// Neither `contentScripts.register` nor `scripting.executeScript` honors the MAIN
// `world` before Firefox 128, while the extension supports 115+. The content script
// therefore runs in the isolated world and reaches the page's MAIN world by
// injecting a <script> element.
function injectMainWorldScriptlets(details) {
  const doc = document;
  const { sentinel, scriptlets } = details;
  const parent = doc.head || doc.documentElement;

  try {
    const inline = doc.createElement('script');
    inline.textContent = `self[${JSON.stringify(sentinel)}]=true;\n${scriptlets}`;
    parent.appendChild(inline);
    inline.remove();

    // A sentinel set in the page world (read via `wrappedJSObject`) means the
    // inline script ran; otherwise the page CSP blocked it, so retry through a
    // blob: URL, which some policies still allow when inline scripts are denied.
    if (self.wrappedJSObject[sentinel]) {
      delete self.wrappedJSObject[sentinel];
      return;
    }

    const blob = new Blob([scriptlets], { type: 'text/javascript; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const fallback = doc.createElement('script');
    fallback.async = false;
    fallback.src = url;
    parent.appendChild(fallback);
    fallback.remove();
    URL.revokeObjectURL(url);
  } catch {
    // Injecting into the page is best-effort; ignore failures (e.g. a torn-down frame).
  }
}

function buildContentScript(scriptletsByWorld) {
  let code = '';

  const main = scriptletsByWorld[EXECUTION_WORLD.MAIN];
  if (main) {
    const details = {
      sentinel: `ghostery_${Math.random().toString(36).slice(2)}`,
      scriptlets: main,
    };
    code += `(${injectMainWorldScriptlets.toString()})(${JSON.stringify(details)});\n`;
  }

  const isolated = scriptletsByWorld[EXECUTION_WORLD.ISOLATED];
  if (isolated) {
    code += isolated;
  }

  return code;
}

export const contentScripts = (() => {
  const map = new Map();
  return {
    async register(hostname, scripts) {
      this.unregister(hostname);

      const code = buildContentScript(scripts);
      if (!code) {
        // Cache "nothing to inject" so isRegistered() short-circuits later navigations.
        map.set(hostname, { unregister() {} });
        return;
      }

      const options = {
        js: [{ code }],
        allFrames: true,
        matches: [`https://*.${hostname}/*`, `http://*.${hostname}/*`],
        matchAboutBlank: true,
        runAt: 'document_start',
      };

      // `matchOriginAsFallback` requires Firefox 128+; older versions reject the
      // whole registration (without it only opaque-origin frames are lost).
      if ((await getBrowserInfo()).version >= 128) {
        options.matchOriginAsFallback = true;
      }

      try {
        map.set(hostname, await browser.contentScripts.register(options));
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
