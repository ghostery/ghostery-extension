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
// go, and each hides the destination its own way.

// A country edition is served from google.<com|cat|cc> or google.co(m).<cc>;
// subdomains other than www are other products (mail, docs), not result pages.
export const RESULT_PAGE_REGEXP =
  /^((www\.)?google\.(com|cat|[a-z]{2}|com?\.[a-z]{2})|(www|cn)\.bing\.com)$/;

// Ads are wrapped differently: their click tracker names the landing page in
// `adurl` - on the link itself, or in `data-rw`, what the link becomes.
const AD_CLICK_PATHNAME_REGEXP = /^(?:\/pagead)?\/aclk$/;

export function isResultPage(hostname = window.location.hostname) {
  return RESULT_PAGE_REGEXP.test(hostname);
}

// cyrb53 - a short, stable key for a result's text
export function hash(str) {
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

function httpUrl(value) {
  try {
    const { protocol, href } = new URL(value);
    return protocol === 'https:' || protocol === 'http:' ? href : null;
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

// Where a link leads: its own destination, an ad's landing page, or what a
// wrapper spells out. A `/goto` token is opaque and resolves to nothing here.
export function getDestination(el) {
  if (el.protocol !== 'https:' && el.protocol !== 'http:') return null;

  // An ad's landing page beats the link, which may be a tracker on another host
  const landingPage = getAdDestination(el);
  if (landingPage) return landingPage;

  // A link into any search host is one of the engine's own, even when it is
  // spelled out in full and names another of its domains than the page
  if (el.hostname !== window.location.hostname && !isResultPage(el.hostname)) {
    return el.href;
  }

  const { searchParams } = new URL(el.href);

  switch (el.pathname) {
    // Google
    case '/url':
      return httpUrl(searchParams.get('url') || searchParams.get('q'));

    // Bing
    case '/ck/a': {
      const param = searchParams.get('u');
      if (!param) return null;

      try {
        // Two leading characters mark the encoding, they are not part of it
        return httpUrl(atob(param.slice(2)));
      } catch {
        return null;
      }
    }

    default:
      return null;
  }
}
