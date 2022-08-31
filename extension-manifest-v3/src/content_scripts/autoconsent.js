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

let watchMode = false;

function showPopup() {
  const wrapper = document.createElement('div');
  const shadowRoot = wrapper.attachShadow({ mode: 'closed' });
  const template = document.createElement('template');

  template.innerHTML = `
    <iframe src="${chrome.runtime.getURL(
      'pages/autoconsent/index.html?host=' +
        encodeURIComponent(window.location.host),
    )}" frameborder="0"></iframe>
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
        flex-grow: 1;
        pointer-events: auto;
        display: block;
        width: min(440px, calc(100% - 20px));
        height: 346px;
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
  document.body.appendChild(wrapper);

  const iframe = shadowRoot.querySelector('iframe');

  setTimeout(() => {
    iframe.classList.add('active');
  }, 100);

  window.addEventListener('message', (e) => {
    switch (e.data?.type) {
      case 'ghostery-autoconsent-resize-iframe':
        iframe.style.height = e.data.height + 'px';
        break;
      case 'ghostery-autoconsent-close-iframe':
        wrapper.parentElement.removeChild(wrapper);
        if (e.data.reload) {
          window.location.reload();
        }
        break;
      default:
        break;
    }
  });
}

const consent = new AutoConsent((msg) => {
  if (watchMode && msg.type === 'popupFound') {
    watchMode = false;
    showPopup();
  }

  return chrome.runtime.sendMessage(
    Object.assign({}, msg, { action: 'autoconsent' }),
  );
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'autoconsent') {
    if (msg.type === 'initResp') {
      watchMode = !msg.config.autoAction;
    }

    return Promise.resolve(consent.receiveMessageCallback(msg));
  }

  return false;
});
