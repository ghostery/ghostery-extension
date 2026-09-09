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
// opaque token, and only the data the page renders its results from ties the
// two together. An older layout lists the destination right after the link:
//
//   [..., "/goto?url=<token>"],["https://example.com/", "<title>", ...]
//
// The current one keeps it only inside the "about this result" request of the
// same result, a base64url protobuf that names the link it describes.
const RENDER_DATA_REGEXP =
  /\/goto\?url\\u003d([\w-]{20,})"(?:,(?:null|-?\d+))*\],\["(https?:[^"]+)"/g;

const ABOUT_THIS_RESULT_REGEXP = /\/search\/about-this-result\?[^"]*?req(?:=|\\u003d)([\w-]+)/g;

// The request keeps the link at field 1 and the result it stands for under
// field 3, extension 1024 - where field 6 is the destination.
const ABOUT_THIS_RESULT_LINK = 1;
const ABOUT_THIS_RESULT_PATH = [3, 1024];
const ABOUT_THIS_RESULT_DESTINATION = 6;

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

    for (const [, request] of text.matchAll(ABOUT_THIS_RESULT_REGEXP)) {
      const described = decodeAboutThisResult(request);
      const [, token] = described?.link.match(TOKEN_REGEXP) || [];

      if (token) addDestination(destinations, token, described.destination);
    }
  }

  return destinations;
}

const UTF8 = new TextDecoder();

function fromBase64Url(encoded) {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

// Splits a protobuf message into its length-delimited fields, the only ones
// carrying anything here. A field set more than once keeps its last value.
function readFields(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError('not a message');

  const fields = new Map();
  let i = 0;

  const readVarint = () => {
    let value = 0;
    let shift = 0;
    let byte;

    do {
      if (i >= bytes.length) throw new RangeError('truncated varint');
      byte = bytes[i++];
      value += (byte & 0x7f) * 2 ** shift;
      shift += 7;
    } while (byte & 0x80);

    return value;
  };

  while (i < bytes.length) {
    const key = readVarint();
    const number = Math.floor(key / 8);

    switch (key & 7) {
      case 0:
        readVarint();
        break;
      case 1:
        i += 8;
        break;
      case 5:
        i += 4;
        break;
      case 2: {
        const length = readVarint();
        if (i + length > bytes.length) throw new RangeError('truncated field');

        fields.set(number, bytes.subarray(i, i + length));
        i += length;
        break;
      }
      default:
        throw new TypeError('not a message');
    }
  }

  return fields;
}

function decodeAboutThisResult(encoded) {
  try {
    const request = readFields(fromBase64Url(encoded));
    const result = ABOUT_THIS_RESULT_PATH.reduce(
      (fields, number) => readFields(fields.get(number)),
      request,
    );

    return {
      link: UTF8.decode(request.get(ABOUT_THIS_RESULT_LINK)),
      destination: UTF8.decode(result.get(ABOUT_THIS_RESULT_DESTINATION)),
    };
  } catch {
    return null;
  }
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
        return httpUrl(searchParams.get('url') || searchParams.get('q'));

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
      return httpUrl(atob(param.slice(2)));
    } catch {
      return null;
    }
  };
}
