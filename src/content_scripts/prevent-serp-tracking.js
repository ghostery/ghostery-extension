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

  el.removeAttribute('ping');

  let targetUrl = null;
  // Google Search: extract direct link from redirect URL
  if (el.pathname === '/url') {
    targetUrl = new URL(el.href).searchParams.get('q');
  }
  // Bing Search: extract and decode direct link from Bing's tracking URL
  else if (el.hostname === 'www.bing.com' && el.pathname.startsWith('/ck/')) {
    const uParam = new URL(el.href).searchParams.get('u');
    if (uParam) {
      // Bing prefixes the Base64 string with 'a1'
      const base64Str = uParam.startsWith('a') ? uParam.slice(2) : uParam;
      try {
        const decoded = atob(base64Str);
        if (decoded) {
          targetUrl = decoded;
        }
      } catch (e) {
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
