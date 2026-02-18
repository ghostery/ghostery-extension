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

import { drawWheel } from '/ui/wheel.js';

const WRAPPER_CLASS = 'wtm-popup-iframe-wrapper';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function closePopups() {
  [...document.querySelectorAll(`.${WRAPPER_CLASS}`)].forEach((popup) => {
    popup.parentElement.removeChild(popup);
  });
}

function resizePopup(height) {
  [...document.querySelectorAll(`.${WRAPPER_CLASS}`)].forEach((popup) => {
    popup.style.height = `${height}px`;
  });
}

const getTop = (el) => el.offsetTop + (el.offsetParent && getTop(el.offsetParent));

function renderPopup(container, stats, popupUrl) {
  closePopups();

  const wrapper = document.createElement('div');
  wrapper.classList.add(WRAPPER_CLASS);
  if (isMobile) {
    wrapper.style.width = window.innerWidth - 20 + 'px';
    wrapper.style.left = '10px';
  } else {
    const left = container.getBoundingClientRect().left - 350 / 2 + 12;
    wrapper.style.left = (left < 20 ? 20 : left) + 'px';
  }
  wrapper.style.top = getTop(container) + 25 + 'px';

  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', `${popupUrl}?domain=${stats.domain}`);

  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);
}

function getWheelElement(stats, popupUrl) {
  const count = stats.stats.length;

  if (count === 0) {
    return null;
  }

  const container = document.createElement('div');
  container.classList.add('wtm-tracker-wheel-container');

  const label = document.createElement('div');
  label.innerText = count;

  const canvas = document.createElement('canvas');
  canvas.classList.add('wtm-tracker-wheel');

  const ctx = canvas.getContext('2d');
  drawWheel(ctx, 16, stats.stats);

  container.appendChild(canvas);
  container.appendChild(label);

  container.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopImmediatePropagation();

    renderPopup(container, stats, popupUrl);
  });

  return container;
}

const SELECTORS = [
  // Google
  '[data-hveid] div.yuRUbf > div > span > a',
  '[data-hveid] div.yuRUbf > div > a',
  '[data-hveid] div.xpd a.cz3goc',
  '[data-hveid] > .xpd > div.kCrYT:first-child > a',
  '[data-hveid] div.OhZyZc > a',
  // Bing
  'li[data-id] h2 > a',
  'li[data-id] div.b_algoheader > a',
].join(', ');

function setupTrackersPreview(popupUrl) {
  const elements = [...window.document.querySelectorAll(SELECTORS)].filter((el) => !el.dataset.wtm);

  if (elements.length) {
    const links = elements.map((el) => {
      el.dataset.wtm = 1;

      if (el.hostname === window.location.hostname) {
        const url = new URL(el.href);

        // Google
        if (url.pathname === '/url') {
          return url.searchParams.get('url') || url.searchParams.get('q');
        }

        // Bing
        if (url.pathname === '/ck/a' && url.searchParams.has('u')) {
          try {
            const base64Str = url.searchParams.get('u').slice(2);
            return atob(base64Str) || '';
          } catch {
            return '';
          }
        }
      }

      return el.href;
    });

    chrome.runtime.sendMessage({ action: 'getWTMReport', links }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Could not retrieve WTM information on URLs', chrome.runtime.lastError);
        return;
      }

      elements.forEach((anchor, i) => {
        const stats = response.wtmStats[i];
        if (stats) {
          try {
            const wheelEl = getWheelElement(stats, popupUrl);
            if (!wheelEl) return;

            const container =
              /* Google */
              // Desktop
              anchor.parentElement.querySelector('.B6fmyf') ||
              anchor.parentElement.parentElement.querySelector('.B6fmyf') ||
              // Mobile
              anchor.querySelector('span.yIn8Od') ||
              anchor.querySelector('div[role="link"]') ||
              anchor.querySelector('div.UPmit.AP7Wnd') ||
              /* Bing */
              anchor.parentElement.parentElement.querySelector('.b_tpcn');

            if (!container) return;

            if (container.classList.contains('b_tpcn')) {
              container.style.display = 'flex';
            }

            let tempEl = container.firstElementChild;
            if (tempEl && tempEl.textContent.includes(stats.domain)) {
              container.insertBefore(wheelEl, tempEl.nextElementSibling);
            } else {
              container.appendChild(wheelEl);
            }
          } catch (e) {
            console.warn('Unexpected error while rendering the Tracker Preview wheel', e);
          }
        }
      });
    });

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length)) {
        observer.disconnect();
        setTimeout(() => setupTrackersPreview(popupUrl), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

window.addEventListener('message', (message) => {
  if (
    message.origin + '/' !== chrome.runtime.getURL('/').toLowerCase() ||
    typeof message.data !== 'string'
  ) {
    return;
  }

  if (message.data === 'WTMReportClosePopups') {
    closePopups();
  } else if (message.data === 'WTMReportDisable') {
    closePopups();

    // Remove the wheel from the elements
    [...document.querySelectorAll('[data-wtm]')].forEach((el) => {
      delete el.dataset.wtm;
    });

    [...document.querySelectorAll('.wtm-tracker-wheel-container')].forEach((el) => {
      el.parentElement.removeChild(el);
    });

    chrome.runtime.sendMessage({ action: 'disableWTMReport' });
  } else if (message.data?.startsWith('WTMReportResize')) {
    const height = message.data.split(':')[1];
    resizePopup(height);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setupTrackersPreview(chrome.runtime.getURL('pages/trackers-preview/index.html'));
});
