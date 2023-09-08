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
import { drawWheel } from '@ghostery/ui/wheel';

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

const getTop = (el) =>
  el.offsetTop + (el.offsetParent && getTop(el.offsetParent));

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

  const label = document.createElement('label');
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

function removeWheel(anchor) {
  const container = anchor.parentElement.querySelector(
    '.wtm-tracker-wheel-container',
  );
  if (container) {
    container.parentElement.removeChild(container);
  }
}

export default function setupTrackersPreview(popupUrl) {
  const elements = [
    ...window.document.querySelectorAll(
      '[data-hveid] div.yuRUbf > div > a, [data-hveid] div.xpd a.cz3goc, [data-hveid] > .xpd > div.kCrYT:first-child > a',
    ),
  ].filter((el) => !el.dataset.wtm);

  if (elements.length) {
    const links = elements.map((el) => {
      if (el.hostname === window.location.hostname) {
        const url = new URL(el.href);
        return url.searchParams.get('url') || url.searchParams.get('q');
      }
      return el.href;
    });

    chrome.runtime.sendMessage(
      { action: 'getWTMReport', links },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            'Could not retrieve WTM information on URLs',
            chrome.runtime.lastError,
          );
          return;
        }

        elements.forEach((anchor, i) => {
          const stats = response.wtmStats[i];
          if (stats) {
            try {
              const wheelEl = getWheelElement(stats, popupUrl);
              if (!wheelEl) return;

              const parent = anchor.parentElement;

              const container =
                // Desktop flat
                parent.querySelector('.B6fmyf') ||
                // Mobile flat
                anchor.querySelector('div[role="link"]') ||
                // Mobile cards
                anchor.querySelector('div.UPmit.AP7Wnd');
              if (!container) return;

              let tempEl = container.firstElementChild;
              if (tempEl && tempEl.textContent.includes(stats.domain)) {
                container.insertBefore(wheelEl, tempEl.nextElementSibling);
              } else {
                container.appendChild(wheelEl);
              }

              anchor.dataset.wtm = 1;
            } catch (e) {
              console.warn(
                'Unexpected error while rendering the Tracker Preview wheel',
                e,
              );
            }
          }
        });
      },
    );

    window.addEventListener('message', (message) => {
      if (
        message.origin + '/' !== chrome.runtime.getURL('/').toLowerCase() &&
        typeof message.data == 'string'
      ) {
        return;
      }

      if (message.data === 'WTMReportClosePopups') {
        closePopups();
      } else if (message.data === 'WTMReportDisable') {
        closePopups();
        elements.forEach(removeWheel);
        chrome.runtime.sendMessage({ action: 'disableWTMReport' });
      } else if (message.data.startsWith('WTMReportResize')) {
        const height = message.data.split(':')[1];
        resizePopup(height);
      }
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
