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

import { convertToSafariFormat } from '/utils/dnr-converter-safari.js';

const DOCUMENT_PATH = 'pages/dnr-converter/index.html';

export default async function convert(filters) {
  try {
    if (__PLATFORM__ === 'chromium') {
      await setupOffscreenDocument();
    } else {
      await setupIframeDocument();
    }
  } catch (e) {
    return { errors: [e.message], rules: [] };
  }

  const result = await chrome.runtime.sendMessage({
    action: 'dnr-converter:convert',
    filters,
  });

  if (__PLATFORM__ === 'safari') {
    result.rules = result.rules.reduce((acc, r) => {
      try {
        acc.push(convertToSafariFormat(r));
      } catch (e) {
        result.errors.push(e);
      }
      return acc;
    }, []);
  }

  for (const [index, rule] of result.rules.entries()) {
    if (rule.condition.regexFilter) {
      const { isSupported, reason } =
        await chrome.declarativeNetRequest.isRegexSupported({
          regex: rule.condition.regexFilter,
        });

      if (!isSupported) {
        result.errors.push(
          `Could not apply a custom filter as "${rule.condition.regexFilter}" is a not supported regexp due to: ${reason}`,
        );
        result.rules.splice(index, 1);
      }
    }
  }

  if (__PLATFORM__ === 'chromium') closeOffscreenDocument();

  return result || { errors: ['Failed to initiate converter'], rules: [] };
}

let offscreenTimeout = null;
function closeOffscreenDocument() {
  if (offscreenTimeout) {
    clearTimeout(offscreenTimeout);
  }

  offscreenTimeout = setTimeout(() => {
    chrome.offscreen.closeDocument();
    offscreenTimeout = null;
  }, 1000);
}

async function setupOffscreenDocument() {
  if (offscreenTimeout) clearTimeout(offscreenTimeout);

  const offscreenUrl = chrome.runtime.getURL(DOCUMENT_PATH);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });

  if (!existingContexts.length) {
    await chrome.offscreen.createDocument({
      url: DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
      justification: 'Convert network filters to DeclarativeNetRequest format.',
    });
  }
}

let iframeReady = false;
function setupIframeDocument() {
  if (iframeReady) return;

  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL(DOCUMENT_PATH);
  document.body.appendChild(iframe);

  return new Promise((resolve) => {
    iframe.onload = () => {
      iframeReady = true;
      resolve();
    };
  });
}
