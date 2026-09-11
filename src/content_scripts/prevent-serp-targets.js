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

// Google links the results of a signed-out visitor through `/goto?url=<token>`,
// and nothing on the page ties the token to a destination. A signed-in visitor
// gets the same results linked outright - so a result is identified by how it
// reads, which is the same either way, and a destination seen once on any page
// of the session is put back on a `/goto` link to the same result elsewhere.

// A country edition is served from google.<com|cat|cc> or google.co(m).<cc>;
// subdomains other than www are other products (mail, docs), not result pages.
const RESULT_PAGE = /^(www\.)?google\.(com|cat|[a-z]{2}|com?\.[a-z]{2})$/;

const GOTO_LINKS = 'a[href^="/goto?url="]';

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

function httpUrl(value) {
  try {
    const { protocol, href } = new URL(value);
    return protocol === 'https:' || protocol === 'http:' ? href : null;
  } catch {
    return null;
  }
}

// A result linked outright, or through a `/url` wrapper that spells it out
function getDestination(el) {
  if (el.protocol !== 'https:' && el.protocol !== 'http:') return null;
  if (el.hostname !== window.location.hostname) return el.href;
  if (el.pathname !== '/url') return null;

  const { searchParams } = new URL(el.href);
  return httpUrl(searchParams.get('url') || searchParams.get('q'));
}

// Ids already sent, so each is only sent once per page
const recorded = new Set();

function recordResults() {
  const entries = {};

  for (const el of document.querySelectorAll('a[href]')) {
    const destination = getDestination(el);
    if (!destination) continue;

    const id = getResultId(el);
    if (!id || recorded.has(id)) continue;

    recorded.add(id);
    entries[id] = destination;
  }

  if (Object.keys(entries).length) {
    chrome.runtime.sendMessage({ action: 'serp:record-targets', entries }).catch(() => {});
  }
}

// What the background answered for each id asked - null when it had nothing
const destinations = new Map();

async function rewriteGotoLinks() {
  const ids = new Set();

  for (const el of document.querySelectorAll(GOTO_LINKS)) {
    const id = getResultId(el);
    if (!id) continue;
    if (!destinations.has(id)) ids.add(id);
  }

  if (ids.size) {
    const resolved = await chrome.runtime.sendMessage({
      action: 'serp:resolve-targets',
      ids: [...ids],
    });

    for (const id of ids) destinations.set(id, resolved[id] || null);
  }

  for (const el of document.querySelectorAll(GOTO_LINKS)) {
    const destination = destinations.get(getResultId(el));
    if (destination) {
      el.href = destination;
    }
  }
}

function sync() {
  recordResults();
  rewriteGotoLinks();
}

// A match pattern cannot name the result pages more closely than the `/search`
// in their path, so most of the pages this runs on are not one of them.
if (RESULT_PAGE.test(window.location.hostname)) {
  sync();

  // Results stream in as the page grows. `document` is observed rather than
  // its element, which is not there yet when the page has only just started.
  new MutationObserver(debounce(sync, { waitFor: 100, maxWait: 500 })).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href'],
  });
}
