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

import { convert } from './dnr-converter-safari.js';

let documentConverter;
export function createDocumentConverter() {
  const requestResolvers = new Map();

  function createIframe() {
    if (documentConverter) return documentConverter;

    window.addEventListener('message', (event) => {
      const requestId = event.data.rules.shift().condition.urlFilter;
      let { rules, errors } = event.data;

      const resolve = requestResolvers.get(requestId);

      rules =
        __PLATFORM__ === 'safari'
          ? rules
              .map((r) => {
                try {
                  return convert(r);
                } catch (e) {
                  errors.push(e);
                }
              })
              .filter(Boolean)
          : rules;

      resolve({
        rules,
        errors: errors.map((e) => `DNR: ${e.message}`),
      });

      requestResolvers.delete(requestId);
    });

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://ghostery.github.io/urlfilter2dnr/');
    iframe.setAttribute('style', 'display: none;');

    documentConverter = new Promise((resolve, reject) => {
      iframe.addEventListener('load', () => resolve(iframe));
      iframe.addEventListener('error', reject);

      document.head.appendChild(iframe);
    });

    return documentConverter;
  }

  let requestCount = 0;

  return async function convert(filter) {
    const iframe = await createIframe();
    const requestId = `request${requestCount++}`;

    return new Promise((resolve) => {
      requestResolvers.set(requestId, resolve);

      iframe.contentWindow.postMessage(
        {
          action: 'convert',
          converter: 'adguard',
          filters: [requestId, filter],
        },
        '*',
      );
    });
  };
}

async function setupOffscreenDocument() {
  const path = 'pages/offscreen/urlfilter2dnr/index.html';
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length) {
    return existingContexts[0];
  }

  await chrome.offscreen.createDocument({
    url: path,
    reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
    justification: 'Convert network filters to DeclarativeNetRequest format.',
  });
}

let offscreenDocument;
export function createOffscreenConverter() {
  return async function convert(filter) {
    try {
      if (!offscreenDocument) {
        offscreenDocument = setupOffscreenDocument().then(() => {
          offscreenDocument = true;
        });
      }

      await offscreenDocument;
    } catch (e) {
      return { errors: [e.message], rules: [] };
    }

    return (
      (await chrome.runtime.sendMessage({
        action: 'offscreen:urlfitler2dnr:convert',
        filter,
      })) || { errors: ['failed to initiate offscreen document'], rules: [] }
    );
  };
}
