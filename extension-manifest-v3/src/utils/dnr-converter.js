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
import { isPermissionRequired, requestPermission } from './offscreen.js';

let creating;

function createDocumentConverter() {
  const requests = new Map();

  function createIframe() {
    if (creating) return creating;

    window.addEventListener('message', (event) => {
      const requestId = event.data.rules.shift().condition.urlFilter;
      requests.get(requestId)(event.data);
      requests.delete(requestId);
    });

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://ghostery.github.io/urlfilter2dnr/');
    iframe.setAttribute('style', 'display: none;');

    creating = new Promise((resolve) => {
      iframe.addEventListener('load', () => resolve(iframe));
      document.head.appendChild(iframe);
    });

    return creating;
  }

  let requestCount = 0;

  async function convert(filter) {
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

  return convert;
}

function createOffscreenConverter() {
  async function setupOffscreenDocument() {
    const path = 'pages/offscreen/urlfilter2dnr/index.html';
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl],
    });

    if (existingContexts.length > 0) {
      return;
    }

    if (creating) {
      await creating;
    } else {
      creating = chrome.offscreen.createDocument({
        url: path,
        reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
        justification:
          'Convert network filters to DeclarativeNetRequest format.',
      });
      await creating;
      creating = null;
    }
  }

  async function createOffscreenDocument() {
    await requestPermission();
    await setupOffscreenDocument();
  }

  async function convert(filter) {
    try {
      await createOffscreenDocument();
    } catch (e) {
      return { errors: [e.message], rules: [] };
    }
    return (
      (await chrome.runtime.sendMessage({
        action: 'offscreen:urlfitler2dnr:convert',
        filter,
      })) || { errors: ['failed to initiate offscreen document'], rules: [] }
    );
  }

  return convert;
}

export default isPermissionRequired()
  ? createOffscreenConverter()
  : createDocumentConverter();
