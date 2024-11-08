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

function debounce(fn, { waitFor, maxWait }) {
  let delayedTimer;
  let maxWaitTimer;

  const clear = () => {
    clearTimeout(delayedTimer);
    clearTimeout(maxWaitTimer);
    delayedTimer = undefined;
    maxWaitTimer = undefined;
  };

  const run = () => {
    clear();
    fn();
  };

  return () => {
    if (maxWaitTimer === undefined) {
      maxWaitTimer = setTimeout(run, maxWait);
    }
    clearTimeout(delayedTimer);
    delayedTimer = setTimeout(run, waitFor);
  };
}

const selectors = {
  classes: new Set(),
  ids: new Set(),
  hrefs: new Set(),
};

const knownSelectors = {
  classes: new Set(),
  ids: new Set(),
  hrefs: new Set(),
};

function addSelector(type, selector) {
  if (
    typeof selector === 'string' &&
    selector.length &&
    !knownSelectors[type].has(selector)
  ) {
    knownSelectors[type].add(selector);
    selectors[type].add(selector);
  }
}

const injectCosmetics = debounce(
  () => {
    if (selectors.classes.size || selectors.ids.size || selectors.hrefs.size) {
      chrome.runtime.sendMessage({
        action: 'injectCosmetics',
        classes: Array.from(selectors.classes),
        ids: Array.from(selectors.ids),
        hrefs: Array.from(selectors.hrefs),
      });

      selectors.classes.clear();
      selectors.ids.clear();
      selectors.hrefs.clear();
    }
  },
  { waitFor: 25, maxWait: 1000 },
);

const observer = new MutationObserver((mutations) => {
  const visited = new Set();

  for (const mutation of mutations) {
    switch (mutation.type) {
      case 'attributes': {
        if (mutation.attributeName === 'class') {
          mutation.target.classList.forEach((c) => addSelector('classes', c));
        } else if (mutation.attributeName === 'id') {
          addSelector('ids', mutation.target.getAttribute('id'));
        } else if (mutation.attributeName === 'href') {
          addSelector('hrefs', mutation.target.href);
        }
        break;
      }
      case 'childList': {
        for (const root of mutation.addedNodes) {
          const treeWalker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_ELEMENT,
          );

          let el = root;

          while (el) {
            if (!visited.has(el)) {
              visited.add(el);

              if (el.className) {
                el.classList.forEach((c) => addSelector('classes', c));
              }

              addSelector('ids', el.getAttribute('id'));
              addSelector('hrefs', el.href);
            }

            el = treeWalker.nextNode();
          }
        }
        break;
      }
    }
  }

  injectCosmetics();
});

document.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'id', 'href'],
    childList: true,
    subtree: true,
  });
});
