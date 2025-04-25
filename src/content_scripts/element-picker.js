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

const PICKER_STYLES = `
  position: absolute;
  overflow: hidden;
  cursor: default;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  display: block;
  pointer-events: none;
  border-radius: 4px;
  border: 1.5px dashed #715DEE;
  background: rgba(113, 93, 238, 0.30);
  z-index: 2147483646;
`;

const POPUP_STYLES = `
  position: fixed;
  z-index: 2147483647;
  display: block;
  padding: 0;
  bottom: 24px;
  right: 24px;
  width: min(400px, 100%);
  max-width: calc(100% - 48px);
  height: 360px;
  border: none;
  border-radius: 8px;
  background: #FFF;
  box-shadow: 0px 20px 60px 0px rgba(0, 0, 0, 0.30);
`;

const OVERLAY_STYLES = `
  position: fixed;
  inset: 0;
  z-index: 2147483645;
  display: block;
  cursor: default !important;
`;

const GLOBAL_STYLES = `
  *, * > * {
    cursor: crosshair !important;
    user-select: none !important;
  }
`;

const LOGO_ICON = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0; transition: opacity 0.2s">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 10.5C19.5 14.6421 16.1421 18 12 18C7.85788 18 4.5 14.6421 4.5 10.5C4.5 6.35788 7.85788 3 12 3C16.1421 3 19.5 6.35788 19.5 10.5Z" fill="#FFFFFE"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M21.9062 19.9302C20.9109 17.6415 20.7395 15.7022 20.7128 14.9403V8.67118C20.7128 3.88205 16.8111 0 11.9985 0C7.18528 0 3.28347 3.88205 3.28347 8.67118V15.0309C3.24629 15.8507 3.05072 17.7306 2.09383 19.9302C0.807675 22.8858 1.87209 22.5335 2.82549 22.2904C3.77876 22.0482 5.90772 21.0989 6.57281 22.2683C7.23763 23.4372 7.79225 24.4523 9.3443 23.7904C10.8965 23.1288 11.6279 22.9083 11.8495 22.9083H12.151C12.3723 22.9083 13.104 23.1288 14.656 23.7904C16.2081 24.4523 16.7624 23.4372 17.4276 22.2683C18.0925 21.0989 20.2213 22.0482 21.1748 22.2904C22.1282 22.5335 23.1921 22.8858 21.9062 19.9302ZM9.30859 4.72821C10.2472 4.72821 11.0082 5.92624 11.0082 7.4046C11.0082 8.88282 10.2472 10.0813 9.30859 10.0813C8.36995 10.0813 7.60888 8.88282 7.60888 7.4046C7.60888 5.92624 8.36995 4.72821 9.30859 4.72821ZM11.9985 15.4259C9.93006 15.4259 8.18888 13.4004 7.66419 11.1466C8.6776 12.5328 10.2417 13.4237 11.9985 13.4237C13.7551 13.4237 15.3191 12.5328 16.3326 11.1466C15.8079 13.4004 14.0665 15.4259 11.9985 15.4259ZM14.6884 10.0813C13.749 10.0813 12.9884 8.88282 12.9884 7.4046C12.9884 5.92624 13.749 4.72821 14.6884 4.72821C15.6275 4.72821 16.3879 5.92624 16.3879 7.4046C16.3879 8.88282 15.6275 10.0813 14.6884 10.0813Z" fill="#00AEF0"/>
  </svg>
`;

function getSelectorCount(selector, childSelector) {
  return document.querySelectorAll(
    childSelector ? `${selector} > ${childSelector}` : selector,
  ).length;
}

function getSelector(element, similar = false, childSelector = '') {
  let selector = '';
  const maxCount = similar ? 20 : 1;

  if (element.id) {
    selector = `#${CSS.escape(element.id)}`;
  }

  if (element.classList.length) {
    selector += `.${Array.from(element.classList).map(CSS.escape).join('.')}`;
  }

  if (selector === '' || getSelectorCount(selector, childSelector) > maxCount) {
    selector = CSS.escape(element.tagName.toLowerCase()) + selector;
  }

  if (getSelectorCount(selector, childSelector) > maxCount) {
    const siblings = Array.from(element.parentNode.children).filter(
      (sibling) => sibling.tagName === element.tagName,
    );

    if (siblings.length > 1) {
      selector = `${selector}:nth-of-type(${siblings.indexOf(element) + 1})`;
    }
  }

  if (getSelectorCount(selector, childSelector) > maxCount) {
    const parent = element.parentElement;
    if (parent && parent !== document.body) {
      selector = `${getSelector(parent, similar, selector)} > ${selector}`;
    }
  }

  return selector;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const pickers = [];
const pickersTargets = new WeakMap();
const pickerTagName = `gh-element-picker-${Math.random().toString(36).slice(2)}`;
const pickerOffset = { top: 0, left: 0 }; //document.body.getBoundingClientRect();

function renderPickers(selector) {
  const elements = selector
    ? Array.from(document.querySelectorAll(selector))
    : [];

  elements.forEach((el, index) => {
    let picker = pickers[index];

    if (!picker) {
      picker = document.createElement(pickerTagName);
      picker.setAttribute('style', PICKER_STYLES);
      pickers[index] = picker;

      document.documentElement.appendChild(picker);
    }

    if (pickersTargets.get(picker) === el) {
      return;
    }

    pickersTargets.set(picker, el);
    const rect = el.getBoundingClientRect();

    Object.assign(picker.style, {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      top: `${rect.top - pickerOffset.top + window.scrollY}px`,
      left: `${rect.left - pickerOffset.left + window.scrollX}px`,
    });

    delay(0).then(() => {
      picker.style.transition = 'all 0.2s ease-out';
    });
  });

  pickers.splice(elements.length).forEach((picker) => {
    pickersTargets.delete(picker);
    picker.remove();
  });
}

function setupElementPickerPopup() {
  const src = chrome.runtime.getURL('pages/element-picker/index.html');
  const existingPopup = document.querySelector(`iframe[src="${src}"]`);
  if (existingPopup) return null;

  const iframe = document.createElement('iframe');
  Object.assign(iframe, { src, style: POPUP_STYLES });

  document.body.appendChild(iframe);

  return iframe;
}

(function () {
  let targetEl = null;
  let currentEl = null;
  let overlayEl = null;
  let selector = '';
  let slider = 1;
  let similar = false;

  const popupEl = setupElementPickerPopup();
  if (!popupEl) {
    console.warn('Element picker popup already running.');
    return;
  }

  const globalStyles = document.createElement('style');
  globalStyles.textContent = GLOBAL_STYLES;
  document.head.appendChild(globalStyles);

  const updatePopup = () => {
    if (popupEl.contentWindow) {
      popupEl.contentWindow.postMessage(
        { type: 'gh:element-picker:selector', selector, slider, similar },
        '*',
      );
      popupEl.contentWindow.focus();
    }
  };

  const hideElements = async function () {
    pickers.forEach(async (picker) => {
      Object.assign(picker.style, {
        background: '#00aef0',
        border: 'none',
      });

      await delay(100);

      picker.innerHTML = LOGO_ICON;

      const icon = picker.querySelector('svg');
      const size =
        Math.max(picker.clientWidth, picker.clientHeight) * 1.5 + 'px';

      Object.assign(icon.style, {
        width: size,
        height: size,
        opacity: 1,
      });

      await delay(200);

      Object.assign(picker.style, {
        background: 'transparent',
        transition: 'none',
      });

      Object.assign(icon.style, {
        width: '24px',
        height: '24px',
        opacity: '0',
        transition:
          'width 1s ease-in-out, height 1s ease-in-out, opacity 1.5s ease-in-out',
      });
    });

    globalStyles.sheet.insertRule(
      `${selector} { visibility: hidden !important; opacity: 0 !important; }`,
      globalStyles.sheet.cssRules.length,
    );

    await delay(1500);

    globalStyles.sheet.insertRule(
      `${selector} { display: none !important; }`,
      globalStyles.sheet.cssRules.length,
    );
  };

  /* Event Listeners */

  const mousemoveEventListener = (event) => {
    const el = event.target;
    targetEl = el.nearestViewportElement || el;

    if (
      el !== popupEl &&
      el !== document.documentElement &&
      el !== document.body
    ) {
      selector = getSelector(targetEl);
    } else {
      selector = '';
    }

    currentEl = targetEl;

    renderPickers(selector);
  };

  const clickEventListener = (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();

    if (overlayEl) return;

    if (selector) {
      document.removeEventListener('mousemove', mousemoveEventListener, true);

      overlayEl = document.createElement(pickerTagName);
      overlayEl.setAttribute('style', OVERLAY_STYLES);
      document.body.appendChild(overlayEl);

      slider = 1;
      let parentElement = targetEl.parentElement;
      while (parentElement && parentElement !== document.body) {
        slider += 1;
        parentElement = parentElement.parentElement;
      }

      updatePopup();
    }
  };

  const resizeEventListener = () => {
    renderPickers(selector);
  };

  const keydownEventListener = (event) => {
    if (event.key === 'Escape') closeElementPicker();
  };

  /* Message Event Listener from Popup */

  const messageEventListener = (event) => {
    switch (event.data?.type) {
      case 'gh:element-picker:reselect':
        selector = '';
        similar = false;

        overlayEl?.remove();
        overlayEl = null;
        targetEl = null;
        currentEl = null;

        renderPickers(selector);

        document.documentElement.inert = false;
        document.addEventListener('mousemove', mousemoveEventListener, true);
        break;

      case 'gh:element-picker:slider': {
        let value = slider - event.data.value;
        currentEl = targetEl;
        while (value > 0) {
          currentEl = currentEl.parentElement;
          value -= 1;
        }

        selector = getSelector(currentEl, similar);

        renderPickers(selector);
        updatePopup();

        break;
      }

      case 'gh:element-picker:similar':
        similar = event.data.value;
        selector = getSelector(currentEl, similar);

        renderPickers(selector);
        updatePopup();

        break;

      case 'gh:element-picker:hide':
        hideElements();
        break;

      case 'gh:element-picker:back':
        globalStyles.textContent = GLOBAL_STYLES;

        renderPickers();
        renderPickers(selector);
        break;

      case 'gh:element-picker:close':
        closeElementPicker();
        break;
    }
  };

  /* Close function */

  const closeElementPicker = () => {
    renderPickers();

    popupEl.remove();
    globalStyles.remove();
    overlayEl?.remove();

    document.removeEventListener('mousemove', mousemoveEventListener, true);
    document.removeEventListener('click', clickEventListener, true);
    document.removeEventListener('keydown', keydownEventListener, true);
    window.removeEventListener('resize', resizeEventListener, true);
    window.removeEventListener('message', messageEventListener, true);
  };

  document.addEventListener('mousemove', mousemoveEventListener, true);
  document.addEventListener('click', clickEventListener, true);
  document.addEventListener('keydown', keydownEventListener, true);

  window.addEventListener('resize', resizeEventListener, true);
  window.addEventListener('message', messageEventListener);

  return closeElementPicker;
})();
