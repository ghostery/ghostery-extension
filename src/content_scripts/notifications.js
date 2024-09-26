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

import * as notifications from '/utils/notifications.js';

const WRAPPER_ELEMENT = 'ghostery-notification-wrapper';

function mount(url) {
  // Prevent multiple iframes be shown at the same time
  if (document.querySelector(WRAPPER_ELEMENT)) {
    return;
  }

  const wrapper = document.createElement(WRAPPER_ELEMENT);
  const shadowRoot = wrapper.attachShadow({ mode: 'closed' });
  const template = document.createElement('template');

  template.innerHTML = /*html*/ `
    <iframe src="${url}" frameborder="0"></iframe>
    <style>
      :host {
        all: initial;
        display: flex !important;
        align-items: flex-end;
        position: fixed;
        top: 10px;
        right: 10px;
        left: 10px;
        bottom: 10px;
        z-index: 2147483647;
        pointer-events: none;
      }

      iframe {
        display: block;
        flex-grow: 1;
        max-width: 100%;
        max-height: 100%;
        pointer-events: auto;
        box-shadow: 30px 60px 160px rgba(0, 0, 0, 0.4);
        border-radius: 16px;
        background: linear-gradient(90deg, rgba(0, 0, 0, 0.13) 0%, rgba(0, 0, 0, 0.27) 100%);
        opacity: 0;
        transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
        transform: translateY(20px);
      }

      iframe.active {
        opacity: 1;
        transform: translateY(0);
      }

      @media screen and (min-width: 640px) {
        :host {
          justify-content: flex-end;
          align-items: start;
        }

        iframe {
          flex-grow: 0;
          transform: translateY(-20px);
        }
      }
    </style>
  `;

  shadowRoot.appendChild(template.content);
  document.documentElement.appendChild(wrapper);

  const iframe = shadowRoot.querySelector('iframe');

  setTimeout(() => {
    iframe.classList.add('active');
  }, 100);

  window.addEventListener('message', (e) => {
    const type = e.data?.type;

    if (type === notifications.RESIZE_WINDOW_EVENT) {
      iframe.style.height = e.data.height + 'px';
      iframe.style.width = e.data.width + 'px';
      return;
    }

    if (type === notifications.CLOSE_WINDOW_EVENT) {
      if (e.data.clear) {
        // Send clearIframe message to other pages
        chrome.runtime.sendMessage({ action: notifications.CLEAR_ACTION, url });
      }

      setTimeout(() => wrapper.remove(), 0);
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.action) {
    case notifications.MOUNT_ACTION: {
      mount(msg.url);
      break;
    }
    case notifications.UNMOUNT_ACTION: {
      document.querySelector(WRAPPER_ELEMENT)?.remove();
      break;
    }
  }
});
