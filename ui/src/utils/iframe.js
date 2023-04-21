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
  const wrapper = document.createElement('ghostery-iframe-wrapper');

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
        width: min(100%, 440px);
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
    switch (e.data?.type) {
      case `ghostery-resize-iframe`:
        iframe.style.width = e.data.width + 'px';
        iframe.style.height = e.data.height + 'px';
        break;
      case `ghostery-close-iframe`:
        if (e.data.reload) {
          window.location.reload();
        } else {
          setTimeout(() => wrapper.parentElement.removeChild(wrapper), 0);
        }
        break;
      default:
        break;
    }
  });
}

export function closeIframe(reload = false) {
  window.parent.postMessage({ type: `ghostery-close-iframe`, reload }, '*');
}

export function setupIframeSize({ width, height } = {}) {
  if (width) {
    document.body.style.width = width + 'px';
  }
  if (height) {
    document.body.style.height = height + 'px';
  }

  const resizeObserver = new ResizeObserver(() => {
    window.parent.postMessage(
      {
        type: `ghostery-resize-iframe`,
        width: document.body.clientWidth,
        height: document.body.clientHeight,
      },
      '*',
    );
  });

  resizeObserver.observe(document.body, {
    box: 'border-box',
  });
}
