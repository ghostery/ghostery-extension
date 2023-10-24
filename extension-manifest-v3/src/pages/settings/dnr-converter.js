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
let requestCount = 0;
let iframe;
let isReady;

function createIframe() {
  window.addEventListener('message', (event) => {
    const requestId = event.data.rules.shift().condition.urlFilter;
    requests.get(requestId)(event.data);
    requests.delete(requestId);
  });

  iframe = document.createElement('iframe');
  iframe.setAttribute('src', 'https://ghostery.github.io/urlfilter2dnr/');
  iframe.setAttribute('style', 'display: none;');

  return new Promise((resolve) => {
    iframe.addEventListener('load', () => resolve());
    document.head.appendChild(iframe);
  });
}

async function convert(filter) {
  if (!isReady) {
    isReady = createIframe();
  }
  await isReady;

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

export default convert;
