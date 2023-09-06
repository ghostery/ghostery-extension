/**
 * WhoTracks.Me
 * https://whotracks.me/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

export function getStats(domain) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'getWTMReport', links: [`https://${domain}`] },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(response.wtmStats[0]);
      },
    );
  });
}

export function close() {
  window.parent.postMessage('WTMReportClosePopups', '*');
}

export function disable() {
  window.parent.postMessage('WTMReportDisable', '*');
}

export function updateIframeHeight() {
  if (window.parent !== window) {
    const resizeObserver = new ResizeObserver(() => {
      const height = document.body.clientHeight;
      window.parent.postMessage(`WTMReportResize:${height}`, '*');
    });
    resizeObserver.observe(document.body, {
      box: 'border-box',
    });
  }
}
