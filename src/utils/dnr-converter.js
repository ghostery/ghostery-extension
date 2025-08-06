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
  let result;

  try {
    if (__PLATFORM__ === 'chromium') {
      await setupOffscreenDocument();

      result = await chrome.runtime.sendMessage({
        action: 'dnr-converter:convert',
        filters,
      });
    } else if (__PLATFORM__ === 'safari') {
      const { default: convertWithAdguard } = await import(
        '@ghostery/urlfilter2dnr/adguard'
      );
      result = await convertWithAdguard(filters);

      result.rules = result.rules.reduce((acc, r) => {
        try {
          acc.push(convertToSafariFormat(r));
        } catch (e) {
          result.errors.push(e);
        }
        return acc;
      }, []);
      result.errors = result.errors.map((e) => `DNR: ${e.message}`);
    } else {
      throw new Error('Unsupported platform for DNR conversion');
    }
  } catch (e) {
    return { errors: [e.message], rules: [] };
  } finally {
    if (__PLATFORM__ === 'chromium') closeOffscreenDocument();
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

  return result;
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
