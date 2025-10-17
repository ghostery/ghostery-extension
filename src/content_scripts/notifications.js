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

function mount(url, position = 'right') {
  // Prevent multiple iframes be shown at the same time
  if (document.querySelector(WRAPPER_ELEMENT)) {
    return;
  }

  const wrapper = document.createElement(WRAPPER_ELEMENT);
  const shadowRoot = wrapper.attachShadow({ mode: 'closed' });
  const template = document.createElement('template');

  template.innerHTML = /*html*/ `
    <div id="background"></div>
    <iframe src="${url}" frameborder="0"></iframe>
    <style>
      :host {
        all: initial;
        display: flex !important;
        position: fixed;
        overflow: hidden;
        z-index: 2147483647;
        right: 10px;
        left: 10px;
        bottom: -40px;
        padding: 12px !important;
        border-radius: 16px;opacity: 0;
        transition: opacity 0.2s ease-in-out, top 0.2s ease-in-out, bottom 0.2s ease-in-out;
        will-change: opacity, top, bottom;
      }

      @keyframes rotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      #background {
        z-index: -1;
        position: absolute;
        top: -100%;
        left: -100%;
        right: -100%;
        bottom: -100%;
        background: conic-gradient(
          from 90deg at 49.87% 50%,
          rgba(0, 72, 255, 0.90) 0deg,
          rgba(85, 0, 255, 0.90) 55deg,
          rgba(0, 72, 255, 0.90) 121deg,
          rgba(0, 217, 255, 0.90) 188deg,
          rgba(85, 0, 255, 0.90) 252deg,
          rgba(0, 217, 255, 0.90) 306deg,
          rgba(0, 72, 255, 0.90) 360deg
        );
        will-change: transform;
        animation: rotate 20s linear infinite;
      }

      :host(.active) {
        opacity: 1;
        bottom: 10px;
      }

      iframe {
        display: block;
        flex-grow: 1;
        height: 0px;
        width: 0px;
        border-radius: 12px;
        box-shadow: 0px 3px 6px 0px rgba(2, 0, 51, 0.30);
      }

      @media screen and (min-width: 640px) {
        :host {
          ${position === 'right' ? 'right: 10px; left: auto;' : ''}
          ${position === 'center' ? 'left: 50%; right: auto; transform: translateX(-50%);' : ''}
          bottom: auto;
          top: -30px;
        }

        :host(.active) {
          top: ${position === 'center' ? '4px' : '10px'};
          bottom: auto;
        }

        iframe {
          flex: 0 0 auto;
        }
      }
    </style>
  `;

  shadowRoot.appendChild(template.content);
  document.documentElement.appendChild(wrapper);

  const iframe = shadowRoot.querySelector('iframe');

  window.addEventListener('message', (e) => {
    const type = e.data?.type;

    if (type === notifications.RESIZE_WINDOW_EVENT) {
      iframe.style.height = e.data.height + 'px';
      iframe.style.width = e.data.width + 'px';

      if (!wrapper.classList.contains('active')) {
        setTimeout(() => wrapper.classList.add('active'));
      }

      return;
    }

    if (type === notifications.CLOSE_WINDOW_EVENT) {
      if (e.data.clear) {
        // Send clearIframe message to other pages
        chrome.runtime.sendMessage({
          action: notifications.CLEAR_ACTION,
          id: new URL(url).pathname.split('/').pop(),
        });
      }

      wrapper.addEventListener('transitionend', () => {
        wrapper.remove();
        if (e.data.reload) window.location.reload();
      });

      wrapper.classList.remove('active');
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.action) {
    case notifications.MOUNT_ACTION: {
      mount(msg.url, msg.position);
      break;
    }
    case notifications.UNMOUNT_ACTION: {
      document.querySelector(WRAPPER_ELEMENT)?.remove();
      break;
    }
  }
});
