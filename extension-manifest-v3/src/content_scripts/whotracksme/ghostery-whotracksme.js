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
(function () {
  function sendMessage(url) {
    if (!url || url.startsWith('data:')) {
      return;
    }
    window.postMessage(
      `GhosteryTrackingDetection:${encodeURIComponent(url)}`,
      '*',
    );
  }

  let originalXHROpen = null;
  let originalXHRSend = null;
  let originalFetch = null;
  let originalImageSrc = null;
  let originalSendBeacon = null;

  // -------------------------------------------------
  // XMLHttpRequest
  // -------------------------------------------------
  originalXHROpen = XMLHttpRequest.prototype.open;
  originalXHRSend = XMLHttpRequest.prototype.send;

  const _url = new WeakMap();

  XMLHttpRequest.prototype.open = function (method, url) {
    _url.set(this, url);
    return originalXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    sendMessage(_url.get(this));
    return originalXHRSend.apply(this, arguments);
  };

  // -------------------------------------------------
  // fetch
  // -------------------------------------------------
  originalFetch = window.fetch;

  window.fetch = function (input) {
    if (typeof input === 'string') {
      sendMessage(input);
    } else if (input instanceof Request) {
      sendMessage(input.url);
    }

    var result = originalFetch.apply(window, arguments);
    return result;
  };

  // -------------------------------------------------
  // Image
  // -------------------------------------------------
  originalImageSrc = Object.getOwnPropertyDescriptor(Image.prototype, 'src');

  delete Image.prototype.src;
  Object.defineProperty(Image.prototype, 'src', {
    get: function () {
      return originalImageSrc.get.call(this);
    },
    set: function (value) {
      sendMessage(value);
      originalImageSrc.set.call(this, value);
    },
  });

  // -------------------------------------------------
  // sendBeacon
  // -------------------------------------------------
  originalSendBeacon = window.Navigator.prototype.sendBeacon;
  window.Navigator.prototype.sendBeacon = function (url) {
    sendMessage(url);
    return originalSendBeacon.apply(window.navigator, arguments);
  };
})();
