/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 * https://www.whotracks.me/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

const origin = new URL(window.location.href).origin;

function postMessage({ urls }) {
  chrome.runtime.sendMessage({ action: 'updateTabStats', urls });
}

// Based on https://github.com/mozilla-mobile/firefox-ios/blob/1f3fd1640214b2b442c573ea7d2882d480f4f24c/content-blocker-lib-ios/js/TrackingProtectionStats.js
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function install() {
  let sendUrls = new Array();
  let sendUrlsTimeout = null;

  function sendMessage(url) {
    if (!url || url.startsWith('data:') || sendUrls.includes(url)) {
      return;
    }

    sendUrls.push(url);

    // If already set, return
    if (sendUrlsTimeout) return;

    // Send the URLs in batches every 200ms to avoid perf issues
    // from calling js-to-native too frequently.
    sendUrlsTimeout = setTimeout(() => {
      sendUrlsTimeout = null;
      if (sendUrls.length < 1) return;
      postMessage({ urls: sendUrls });
      sendUrls = new Array();
    }, 200);
  }

  function onLoadNativeCallback() {
    // Send back the sources of every script and image in the DOM back to the host application.
    [].slice.apply(document.scripts).forEach(function (el) {
      if (el.getAttribute('src')) sendMessage(el.src, 'load script');
    });
    [].slice.apply(document.images).forEach(function (el) {
      if (el.getAttribute('src')) sendMessage(el.src, 'load image');
    });
    [].slice
      .apply(document.getElementsByTagName('iframe'))
      .forEach(function (el) {
        if (el.getAttribute('src')) sendMessage(el.src, 'load iframe');
      });

    const mutationObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          // `<script src="*">` elements.
          if (node.tagName === 'SCRIPT' && node.getAttribute('src')) {
            sendMessage(node.src, 'mutation script');
            return;
          }
          if (node.tagName === 'IMG' && node.getAttribute('src')) {
            sendMessage(node.src, 'mutation image');
            return;
          }

          // `<iframe src="*">` elements where [src] is not "about:blank".
          if (node.tagName === 'IFRAME' && node.getAttribute('src')) {
            if (node.src === 'about:blank') {
              return;
            }

            sendMessage(node.src, 'mutation iframe');
            return;
          }

          // `<link href="*">` elements.
          if (node.tagName === 'LINK' && node.href) {
            sendMessage(node.href, 'mutation link');
          }
        });
      });
    });

    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  window.addEventListener('load', onLoadNativeCallback, false);

  // fetch, XMLHTTPRequest and others must be injected in main world
  function injectMonkeyPatches() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(
      'content_scripts/whotracksme/ghostery-whotracksme.js',
    );
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);

    window.addEventListener('message', (message) => {
      if (
        !message.isTrusted ||
        !(typeof message.data === 'string') ||
        !message.data.startsWith('GhosteryTrackingDetection:')
      ) {
        return;
      }

      let url = decodeURIComponent(message.data.split(':')[1]);
      if (url.startsWith('/')) {
        url = `${origin}${url}`;
      }
      sendMessage(url, 'content');
    });
  }

  injectMonkeyPatches();
})();
