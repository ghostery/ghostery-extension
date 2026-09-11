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

import { isResultPage, getDestination } from '/utils/link-destinations.js';

// Links the page tracks: with a ping, through a wrapper, or swapped on click
const WRAPPED_LINKS =
  'a[ping], a[href^="/url?"], a[href*="/ck/a?"], a[href*="/aclk?"], a[data-rw], a[data-agdh="arwt"]';

// A link back into a search host that gives no destination away (`/goto?url=<token>`
// today) can only be resolved from what was recorded on another page
function isOpaque(el) {
  return (el.protocol === 'https:' || el.protocol === 'http:') && !getDestination(el);
}

// `data-rw` holds the replacement outright; `data-agdh` names a hidden twin
// that holds it. Either way, a link that points at its destination keeps it.
function dropSwap(el) {
  el.removeAttribute('data-rw');

  if (el.dataset.agdh === 'arwt') el.removeAttribute('data-agdh');
}

function normalize(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

// cyrb53
function hash(str) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// A result link reads its title, site name and displayed URL; an image link
// spells the same out in its label. Hashed to keep the stored keys short.
function getResultId(el) {
  const text = normalize(el.textContent) || normalize(el.getAttribute('aria-label'));

  return text ? hash(text) : null;
}

// Ids already sent, so each is only sent once per page
const recorded = new Set();
// What the background answered for each id asked - null when it had nothing
const destinations = new Map();

async function resolve() {
  const entries = {};

  for (const el of document.querySelectorAll(WRAPPED_LINKS)) {
    // A ping reports the click to the page it came from, and is sent for every
    // way of following a link - including ones that raise no click event
    el.removeAttribute('ping');

    const destination = getDestination(el);
    if (!destination) continue;

    // A wrapped link is unwrapped on the spot
    if (el.href !== destination) el.href = destination;
    dropSwap(el);

    const id = getResultId(el);
    if (!id || recorded.has(id)) continue;

    recorded.add(id);
    entries[id] = destination;
  }

  if (Object.keys(entries).length) {
    chrome.runtime.sendMessage({ action: 'serp:record-targets', entries }).catch(() => {});
  }

  const opaque = [];
  const ids = new Set();

  for (const el of document.querySelectorAll('a[href]')) {
    if (!isOpaque(el)) continue;

    const id = getResultId(el);
    if (!id) continue;

    opaque.push(el);
    if (!destinations.has(id)) ids.add(id);
  }

  if (ids.size) {
    // Left unanswered when the background is not there, to be asked again
    const resolved = await chrome.runtime
      .sendMessage({ action: 'serp:resolve-targets', ids: [...ids] })
      .catch(() => null);

    if (resolved) {
      for (const id of ids) destinations.set(id, resolved[id] || null);
    }
  }

  for (const el of opaque) {
    const destination = destinations.get(getResultId(el));
    if (destination) {
      el.href = destination;
      dropSwap(el);
    }
  }
}

let running = Promise.resolve();
let scheduled = false;

// Runs resolve() one at a time. A call while one is running waits for it;
// a call while one is already waiting is dropped, as that run will see its changes.
function sync() {
  if (scheduled) return;
  scheduled = true;

  running = running
    .then(() => {
      scheduled = false;
      return resolve();
    })
    .catch(() => {});
}

// A match pattern cannot name the result pages more closely than the `/search`
// in their path, so most of the pages this runs on are not one of them.
if (isResultPage()) {
  sync();

  // Results stream in as the page grows. `document` is observed rather than
  // its element, which is not there yet when the page has only just started.
  new MutationObserver(sync).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['ping', 'href', 'data-rw', 'data-agdh'],
  });

  // The link may have arrived after the last sync
  document.addEventListener(
    'click',
    function safeLinkClick(event) {
      let el = event.target;
      while (el && !el.href) el = el.parentElement;

      if (!el) return;

      el.removeAttribute('ping');

      const destination = getDestination(el) || destinations.get(getResultId(el));

      if (destination && el.href !== destination) {
        event.stopImmediatePropagation();
        el.href = destination;
        dropSwap(el);
      }
    },
    true,
  );
}
