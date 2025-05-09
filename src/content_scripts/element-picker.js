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

function renderPickers(selector, force = false) {
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

    if (!force && pickersTargets.get(picker) === el) {
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
    pickers.splice(0).forEach(async (picker) => {
      Object.assign(picker.style, {
        background: '#00aef0',
        border: 'none',
      });

      await delay(250);

      Object.assign(picker.style, {
        mask: `
          url("data:image/svg+xml,%3Csvg width='21' height='21' viewBox='0 0 21 21' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18.7552 17.1085C17.9258 15.2012 17.7829 13.5852 17.7607 12.9503V7.72599C17.7607 3.73504 14.5093 0.5 10.4987 0.5C6.48773 0.5 3.23622 3.73504 3.23622 7.72599V13.0258C3.20524 13.7089 3.04227 15.2755 2.24486 17.1085C1.17306 19.5715 2.06007 19.2779 2.85458 19.0753C3.64897 18.8735 5.4231 18.0824 5.97734 19.0569C6.53135 20.031 6.99354 20.8769 8.28692 20.3254C9.58041 19.774 10.1899 19.5902 10.3746 19.5902H10.6258C10.8102 19.5902 11.42 19.774 12.7133 20.3254C14.0067 20.8769 14.4687 20.031 15.023 19.0569C15.5771 18.0824 17.3511 18.8735 18.1457 19.0753C18.9402 19.2779 19.8268 19.5715 18.7552 17.1085Z' fill='white'/%3E%3C/svg%3E") center center no-repeat,
          linear-gradient(#000 0 0)
        `,
        maskSize: `1px 1px`,
        maskComposite: 'exclude',
        transition: 'none',
      });

      await delay(0);

      const size =
        Math.max(picker.clientWidth, picker.clientHeight) * 1.5 + 'px';

      Object.assign(picker.style, {
        maskSize: `${size} ${size}`,
        transition: 'all 0.75s 0.1s ease-in',
      });

      await delay(750);

      picker.remove();
    });

    await delay(250);

    globalStyles.sheet.insertRule(
      `${selector} { visibility: hidden !important; opacity: 0 !important; }`,
      globalStyles.sheet.cssRules.length,
    );

    await delay(1000);

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
    renderPickers(selector, true);
  };

  const keydownEventListener = (event) => {
    if (event.key === 'Escape') closeElementPicker();
  };

  /* Message Event Listener from Popup */

  const messageEventListener = (event) => {
    switch (event.data?.type) {
      case 'gh:element-picker:selector':
        selector = event.data.selector;
        renderPickers(selector);
        updatePopup();
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

    window.removeEventListener('resize', resizeEventListener);
    window.removeEventListener('message', messageEventListener);

    document.removeEventListener('mousemove', mousemoveEventListener, true);
    document.removeEventListener('click', clickEventListener, true);
    document.removeEventListener('keydown', keydownEventListener);
  };

  window.addEventListener('resize', resizeEventListener);
  window.addEventListener('message', messageEventListener);

  document.addEventListener('mousemove', mousemoveEventListener, true);
  document.addEventListener('click', clickEventListener, true);
  document.addEventListener('keydown', keydownEventListener);
})();
