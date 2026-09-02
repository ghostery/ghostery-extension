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

// Result pages route their links through themselves to record where visitors
// go, and each hides the destination its own way. A page is only ever read by
// the function named for it here.
//
// A country edition is served from google.<com|cat|cc> or google.co(m).<cc>;
// subdomains other than www are other products (mail, docs), not result pages.
const RESULT_PAGES = [
  {
    host: /^(www\.)?google\.(com|cat|[a-z]{2}|com?\.[a-z]{2})$/,
    linkDestinations: googleDestinations,
  },
  { host: /^(www|cn)\.bing\.com$/, linkDestinations: bingDestinations },
];

export function scanDocumentLinkData(doc = document) {
  const page = RESULT_PAGES.find(({ host }) => host.test(window.location.hostname));
  const getDestination = page ? page.linkDestinations(doc) : () => null;

  return (el) => (typeof el.href === 'string' ? getDestination(el) : null);
}

export function isResultPage(hostname = window.location.hostname) {
  return RESULT_PAGES.some(({ host }) => host.test(hostname));
}

// --- Shared ---

function sameOrigin(el) {
  return el.hostname === window.location.hostname;
}

function httpUrl(value) {
  try {
    const { protocol, href } = new URL(value);
    return protocol === 'https:' || protocol === 'http:' ? href : null;
  } catch {
    return null;
  }
}

// --- Google ---

// Some links spell the destination out in the query string; the rest carry an
// opaque token, and only the order of the data the page renders its results
// from ties the two together:
//
//   [..., "/goto?url=<token>"],["https://example.com/", "<title>", ...]
const RENDER_DATA_REGEXP =
  /\/goto\?url\\u003d([\w-]{20,})"(?:,(?:null|-?\d+))*\],\["(https?:[^"]+)"/g;

// The same token turns up with different padding and parameters around it.
const TOKEN_REGEXP = /[?&]url=([\w-]{20,})/;

// Ads are wrapped differently again: their click tracker names the landing
// page in `adurl` - on the link itself, or in `data-rw`, what the link becomes.
const AD_CLICK_PATHNAME_REGEXP = /^(?:\/pagead)?\/aclk$/;

const documentIndexes = new WeakMap();

function unescapeJS(str) {
  return str.replace(/\\(?:u([\da-fA-F]{4})|x([\da-fA-F]{2})|(.))/g, (_, u, x, char) =>
    char !== undefined ? char : String.fromCharCode(parseInt(u || x, 16)),
  );
}

function addDestination(destinations, token, url) {
  // A result is described more than once per page, every copy the same way
  if (destinations.has(token)) return;

  const destination = httpUrl(url);
  if (destination) destinations.set(token, destination);
}

// Results stream in as the page grows, so the index is built up over repeated
// scans of the same document. A script still being filled in is read again
// once it has grown, rather than being taken for everything it will hold.
function indexRenderData(doc) {
  let index = documentIndexes.get(doc);

  if (!index) {
    index = { readUpTo: new WeakMap(), destinations: new Map() };
    documentIndexes.set(doc, index);
  }

  const { readUpTo, destinations } = index;

  for (const script of doc.querySelectorAll('script:not([src])')) {
    const text = script.textContent;
    if (!text || readUpTo.get(script) === text.length) continue;

    readUpTo.set(script, text.length);
    if (!text.includes('/goto?url')) continue;

    for (const [, token, url] of text.matchAll(RENDER_DATA_REGEXP)) {
      addDestination(destinations, token, unescapeJS(url));
    }
  }

  return destinations;
}

function getAdDestination(el) {
  for (const clickUrl of [el.getAttribute('data-rw'), el.href]) {
    if (!clickUrl) continue;

    let landingPage;
    try {
      const url = new URL(clickUrl, window.location.href);
      if (!AD_CLICK_PATHNAME_REGEXP.test(url.pathname)) continue;

      landingPage = url.searchParams.get('adurl');
    } catch {
      continue;
    }

    // Often empty, leaving only the advertiser's domain - not the same page
    const destination = landingPage && httpUrl(landingPage);
    if (destination) return destination;
  }

  return null;
}

function googleDestinations(doc) {
  const destinations = indexRenderData(doc);

  return (el) => {
    // An ad's own landing page beats the index, which is keyed by a token the
    // page reuses - one can back both an ad and a result for the same site.
    const landingPage = getAdDestination(el);
    if (landingPage) return landingPage;

    if (!sameOrigin(el)) return null;

    const { pathname, search, searchParams } = new URL(el.href);

    switch (pathname) {
      case '/url':
        return searchParams.get('url') || searchParams.get('q');

      case '/goto': {
        const [, token] = search.match(TOKEN_REGEXP) || [];
        return (token && destinations.get(token)) || null;
      }

      default:
        return null;
    }
  };
}

// --- Bing ---

// The destination travels in the link itself, encoded.
function bingDestinations() {
  return (el) => {
    if (!sameOrigin(el)) return null;

    const { pathname, searchParams } = new URL(el.href);
    if (pathname !== '/ck/a') return null;

    const param = searchParams.get('u');
    if (!param) return null;

    try {
      // Two leading characters mark the encoding, they are not part of it
      return atob(param.slice(2)) || null;
    } catch {
      return null;
    }
  };
}
