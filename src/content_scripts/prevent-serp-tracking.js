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

function safeLinkClick(event) {
  let el = event.target;
  while (el && !el.href) el = el.parentElement;

  if (!el) return;
  // Google Search Engine Redirect Protection
  el.removeAttribute('ping');
  let targetUrl = null;
  if (el.pathname === '/url') {
    targetUrl = new URL(el.href).searchParams.get('url');
  }
  // Bing Search Engine Redirect Protection
  else if (el.pathname == '/ck/a') {
    const uParam = new URL(el.href).searchParams.get('u');
    if (uParam) {
      // Bing prefixes the Base64 string with 'a1'
      const base64Str = uParam.slice(2);
      try {
        const decoded = atob(base64Str);
        if (decoded) {
          targetUrl = decoded;
        }
      } catch {
        // If decoding fails, leave targetUrl null (no rewrite)
      }
    }
  }

  if (targetUrl) {
    event.stopImmediatePropagation();
    el.href = targetUrl;
  }
}

document.addEventListener('click', safeLinkClick, true);
