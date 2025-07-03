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

import { querySelectorAll } from '@ghostery/adblocker-extended-selectors';

let UPDATE_EXTENDED_TIMEOUT = null;
const PENDING = new Set();
const EXTENDED = [];
const HIDDEN = new Map();

function cachedQuerySelector(root, selector, cache) {
  // First check if we have a result in cache for this node and selector
  const cachedElements = cache.get(root)?.get(selector);
  if (cachedElements !== undefined) {
    return cachedElements;
  }

  const selected = new Set(querySelectorAll(root, selector.ast));

  // Cache result for next time!
  if (selector.attribute !== undefined) {
    let cachedSelectors = cache.get(root);
    if (cachedSelectors === undefined) {
      cachedSelectors = new Map();
      cache.set(root, cachedSelectors);
    }

    let cachedSelected = cachedSelectors.get(selector);
    if (cachedSelected === undefined) {
      cachedSelected = new Set();
      cachedSelectors.set(selector, cachedSelected);
    }

    for (const element of selected) {
      cachedSelected.add(element);
    }
  }

  return selected;
}

function updateExtended() {
  if (PENDING.size === 0 || EXTENDED.length === 0) {
    return;
  }

  const cache = new Map();

  const elementsToHide = new Map();

  // Since we are processing elements in a delayed fashion, it is possible
  // that some short-lived DOM nodes are already detached. Here we simply
  // ignore them.
  const roots = [...PENDING].filter((e) => e.isConnected === true);
  PENDING.clear();

  for (const root of roots) {
    for (const selector of EXTENDED) {
      for (const element of cachedQuerySelector(root, selector, cache)) {
        if (selector.remove === true) {
          element.textContent = '';
          element.remove();
        } else if (
          selector.attribute !== undefined &&
          HIDDEN.has(element) === false
        ) {
          elementsToHide.set(element, { selector, root });
        }
      }
    }
  }

  // Hide new nodes if any
  for (const [element, { selector, root }] of elementsToHide.entries()) {
    if (selector.attribute !== undefined) {
      element.setAttribute(selector.attribute, '');
      HIDDEN.set(element, { selector, root });
    }
  }

  // Check if some elements should be un-hidden.
  for (const [element, { selector, root }] of [...HIDDEN.entries()]) {
    if (selector.attribute !== undefined) {
      if (
        root.isConnected === false ||
        element.isConnected === false ||
        cachedQuerySelector(root, selector, cache).has(element) === false
      ) {
        HIDDEN.delete(element);
        element.removeAttribute(selector.attribute);
      }
    }
  }
}

/**
 * Queue `elements` to be processed asynchronously in a batch way (for
 * efficiency). This is important to not do more work than necessary, for
 * example if the same set of nodes is updated multiple times in a raw on
 * user-interaction (e.g. a dropdown); this allows to only check these nodes
 * once, and to not block the UI.
 */
export function delayedUpdateExtended(elements) {
  // If we do not have any extended filters applied to this frame, then we do
  // not need to do anything. We just ignore.
  if (EXTENDED.length === 0) {
    return;
  }

  // If root DOM element is already part of PENDING, no need to queue other elements.
  if (PENDING.has(window.document.documentElement)) {
    return;
  }

  // Queue up new elements into the global PENDING set, which will be processed
  // in a batch maner from a setTimeout.
  for (const element of elements) {
    // If we get the DOM root then we can clear everything else from the queue
    // since we will be looking at all nodes anyway.
    if (element === window.document.documentElement) {
      PENDING.clear();
      PENDING.add(element);
      break;
    }

    PENDING.add(element);
  }

  // Check if we need to trigger a setTimeout to process pending elements.
  if (UPDATE_EXTENDED_TIMEOUT === null) {
    UPDATE_EXTENDED_TIMEOUT = setTimeout(() => {
      UPDATE_EXTENDED_TIMEOUT = null;
      updateExtended();
    }, 1000);
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'evaluateExtendedSelectors') {
    if (msg.extended && msg.extended.length > 0) {
      EXTENDED.push(...msg.extended);
      delayedUpdateExtended([window.document.documentElement]);
    }
  }
});
