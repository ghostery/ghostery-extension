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

import debounce from '/utils/debounce.js';
import { isResultPage, scanDocumentLinkData } from '/utils/link-destinations.js';

// Only one of the result pages swaps a link for its wrapper, so only its
// links are rewritten up front - elsewhere the click handler is enough.
const WRAPPED_LINKS = 'a[href^="/goto?url="], a[href*="/aclk?"], a[data-rw], a[data-agdh="arwt"]';

// `data-rw` holds the replacement outright; `data-agdh` names a hidden twin
// that holds it. Either way, a link that points at its destination keeps it.
function dropSwap(el) {
  el.removeAttribute('data-rw');

  if (el.dataset.agdh === 'arwt') el.removeAttribute('data-agdh');
}

function rewriteLinks() {
  // A ping reports the click to the page it came from, and is sent for every
  // way of following a link - including ones that raise no click event, like
  // a middle click or opening in a new tab from the context menu.
  for (const el of document.querySelectorAll('a[ping]')) {
    el.removeAttribute('ping');
  }

  const getDestination = scanDocumentLinkData();

  for (const el of document.querySelectorAll(WRAPPED_LINKS)) {
    const destination = getDestination(el);

    if (destination) {
      el.href = destination;
      dropSwap(el);
    } else if (el.hostname !== window.location.hostname) {
      // Shown with its real destination already - only the swap has to go
      dropSwap(el);
    }
  }
}

function safeLinkClick(event) {
  let el = event.target;
  while (el && !el.href) el = el.parentElement;

  if (!el) return;

  el.removeAttribute('ping');

  // The link may have arrived after the last rewrite
  const destination = scanDocumentLinkData()(el);

  if (destination) {
    event.stopImmediatePropagation();
    el.href = destination;
  }
}

const rewriteLinksDebounced = debounce(rewriteLinks, { waitFor: 100, maxWait: 500 });

// A match pattern cannot name the result pages more closely than the `/search`
// in their path, so most of the pages this runs on are not one of them.
if (isResultPage()) {
  document.addEventListener('click', safeLinkClick, true);

  rewriteLinks();

  // Results are rewritten as they stream in, and ads keep their place in the
  // DOM and fill their attributes in later. `document` is observed rather than
  // its element, which is not there yet when the page has only just started.
  new MutationObserver(rewriteLinksDebounced).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['ping', 'href', 'data-rw', 'data-agdh'],
  });
}
