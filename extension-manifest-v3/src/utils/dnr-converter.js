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

const requests = new Map();

let pending;
function createIframe() {
  if (pending) return pending;

  window.addEventListener('message', (event) => {
    const requestId = event.data.rules.shift().condition.urlFilter;
    requests.get(requestId)(event.data);
    requests.delete(requestId);
  });

  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', 'https://ghostery.github.io/urlfilter2dnr/');
  iframe.setAttribute('style', 'display: none;');

  pending = new Promise((resolve) => {
    iframe.addEventListener('load', () => resolve(iframe));
    document.head.appendChild(iframe);
  });

  return pending;
}

let requestCount = 0;
export async function convert(filter) {
  const iframe = await createIframe();
  const requestId = `request${requestCount++}`;

  iframe.contentWindow.postMessage(
    {
      action: 'convert',
      converter: 'adguard',
      filters: [requestId, filter],
    },
    '*',
  );

  return new Promise((resolve) => {
    requests.set(requestId, resolve);
  });
}
