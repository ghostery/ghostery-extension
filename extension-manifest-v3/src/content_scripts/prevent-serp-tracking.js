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

  const targetUrl =
    el.pathname === '/url' && new URL(el.href).searchParams.get('url');

  if (targetUrl) {
    event.stopImmediatePropagation();
    el.href = targetUrl;
  }
}

document.addEventListener('click', safeLinkClick, true);
