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

export function showIframe(url) {
  const wrapper = document.createElement('div');
  const shadowRoot = wrapper.attachShadow({ mode: 'closed' });
  const template = document.createElement('template');

  template.innerHTML = `
    <iframe src="${url}" frameborder="0"></iframe>
    <style>
      :host {
        all: initial !important;
        display: flex !important;
        align-items: flex-end !important;
        position: fixed !important;
        top: 10px !important;
        right: 10px !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
      }

      iframe {
        flex-grow: 1;
        pointer-events: auto;
        display: block;
        width: min(400px, calc(100% - 20px));
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
          justify-content: flex-end !important;
          align-items: start !important;
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
      case 'ghostery-contextual-onboarding-resize-iframe':
        iframe.style.height = e.data.height + 'px';
        break;
      case 'ghostery-contextual-onboarding-close-iframe':
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
