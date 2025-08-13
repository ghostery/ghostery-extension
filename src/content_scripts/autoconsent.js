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

import AutoConsent from '@duckduckgo/autoconsent';

const FLAG_STORAGE_KEY = 'ghostery:autoconsent';

function getResultFlag() {
  try {
    return localStorage.getItem(FLAG_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setResultFlag() {
  try {
    localStorage.setItem(FLAG_STORAGE_KEY, 1);
  } catch {
    // Ignore errors
  }
}

if (document.contentType === 'text/html') {
  if (getResultFlag()) {
    chrome.runtime.sendMessage({ action: 'stats:autoconsent' });
  }

  const consent = new AutoConsent((msg) => {
    const data = Object.assign({}, msg, { action: 'autoconsent' });

    if (data.type === 'optOutResult' && data.result === true) {
      setResultFlag();
      chrome.runtime.sendMessage({ action: 'stats:autoconsent' });
    }

    return chrome.runtime.sendMessage(data);
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'autoconsent') {
      return Promise.resolve(consent.receiveMessageCallback(msg));
    }

    return false;
  });
}
