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

// `contentScripts.register` honors the `world` option only on Firefox 128+, while
// the extension supports 115+. The content script therefore runs in the isolated
// world and reaches the page's MAIN world by injecting a <script> element.
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

    const blob = new self.Blob([scriptlets], { type: 'text/javascript; charset=utf-8' });
    const url = self.URL.createObjectURL(blob);
    const fallback = doc.createElement('script');
    fallback.async = false;
    fallback.src = url;
    parent.appendChild(fallback);
    fallback.remove();
    self.URL.revokeObjectURL(url);
  } catch {
    // Injecting into the page is best-effort; ignore failures (e.g. a torn-down frame).
  }
}

function buildContentScript({ MAIN, ISOLATED }) {
  let code = '';

  // MAIN-world scriptlets are bootstrapped into the page; ISOLATED-world ones run
  // directly in this content script's own (isolated) world.
  if (MAIN) {
    const details = {
      sentinel: `ghostery_${Math.random().toString(36).slice(2)}`,
      scriptlets: MAIN,
    };
    code += `(${injectMainWorldScriptlets.toString()})(${JSON.stringify(details)});\n`;
  }

  if (ISOLATED) {
    code += ISOLATED;
  }

  return code;
}

export const contentScripts = (() => {
  const map = new Map();
  return {
    async register(hostname, scripts) {
      this.unregister(hostname);

      const code = buildContentScript(scripts);
      if (!code) return;

      const options = {
        js: [{ code }],
        allFrames: true,
        matches: [`https://*.${hostname}/*`, `http://*.${hostname}/*`],
        matchAboutBlank: true,
        matchOriginAsFallback: true,
        runAt: 'document_start',
      };

      try {
        map.set(hostname, await browser.contentScripts.register(options));
      } catch {
        // `matchOriginAsFallback` requires Firefox 128+; older versions reject the
        // whole call, so retry without it (only opaque-origin frames are lost).
        delete options.matchOriginAsFallback;
        try {
          map.set(hostname, await browser.contentScripts.register(options));
        } catch (e) {
          console.warn(e);
          this.unregister(hostname);
        }
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
