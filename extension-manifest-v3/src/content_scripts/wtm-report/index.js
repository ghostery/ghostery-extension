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

const WRAPPER_CLASS = 'wtm-popup-iframe-wrapper';

const isMobile = window.navigator.userAgent.match(/iPhone/i);

function closePopups() {
  [...document.querySelectorAll(`.${WRAPPER_CLASS}`)].forEach(popup => {
    popup.parentElement.removeChild(popup);
  });
}

const getTop = el => el.offsetTop + (el.offsetParent && getTop(el.offsetParent));

function renderPopup(container, stats) {
  closePopups()

  const wrapper = document.createElement('div');
  wrapper.classList.add(WRAPPER_CLASS);
  if (isMobile) {
    wrapper.style.width = window.innerWidth - 20 + 'px';
    wrapper.style.left = '10px';
  } else {
    wrapper.style.left = container.getBoundingClientRect().left - (350/2) + 12 + 'px';
  }
  wrapper.style.top = getTop(container) + 25 + 'px';

  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', chrome.runtime.getURL(`wtm-report/index.html?domain=${stats.domain}`));

  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);
}

function renderWheel(anchor, stats) {
  const count = stats.stats.length;

  if (count === 0) {
    return;
  }

  const parent = anchor.parentElement;
  parent.style.position = 'relative';
  const threeDotsElement = parent.querySelector('div[jsslot] div[aria-haspopup], div[jsaction] div[role=button] span');
  const container = document.createElement('div');
  container.classList.add('wtm-tracker-wheel-container');
  if (isMobile) {
    container.style.left = threeDotsElement.getBoundingClientRect().left - parent.getBoundingClientRect().left - 50 + 'px';
    container.style.top = 15 + 'px';
  } else if (threeDotsElement) {
    // default path on Safari (Desktop)
    container.style.left = threeDotsElement.getBoundingClientRect().right - parent.getBoundingClientRect().left + 5 + 'px';
  } else {
    // default path in Chrome
    const arrowDown = parent.querySelector('span.gTl8xb');
    const elem = arrowDown || parent.querySelector('cite > span');
    const offset = arrowDown ? 10 : 5;
    container.style.left = elem.getBoundingClientRect().right - parent.getBoundingClientRect().left + offset + 'px';
  }

  container.addEventListener('click', (ev) => {
    renderPopup(container, stats);
    ev.preventDefault();
    return false;
  });

  const label = document.createElement('label');
  label.innerText = count;

  const canvas = document.createElement('canvas');
  canvas.classList.add('wtm-tracker-wheel');
  canvas.setAttribute('width', '22px');
  canvas.setAttribute('height', '22px');
  const ctx = canvas.getContext('2d');
  WTMTrackerWheel.draw(ctx, stats.stats);

  container.appendChild(canvas);
  container.appendChild(label);
  parent.appendChild(container);
}

const elements = [...window.document.querySelectorAll('#main div.g div.yuRUbf > a, div.mnr-c.xpd.O9g5cc.uUPGi a')];
const links = elements.map(x => x.href);

chrome.runtime.sendMessage({ action: 'getWTMReport', links }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Could not retrieve WTM information on URLs', chrome.runtime.lastError);
    return;
  }

  elements.forEach((elem, i) => {
    if (response.wtmStats[i]) {
      renderWheel(elem, response.wtmStats[i]);
    }
  });
});

window.addEventListener('message', (message) => {
  if (message.origin + '/' !== chrome.runtime.getURL('/').toLowerCase()) {
    return;
  }

  if (message.data === 'WTMReportClosePopups') {
    closePopups();
    return;
  }
});
