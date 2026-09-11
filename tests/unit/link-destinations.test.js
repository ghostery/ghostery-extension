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

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isResultPage, getDestination } from '../../src/utils/link-destinations.js';

const GOOGLE = 'www.google.com';
const BING = 'www.bing.com';

const DESTINATION = 'https://example.com/a-result';

// The parts of an anchor element that are read
const element = (href, attributes = {}) => {
  const { protocol, hostname, pathname } = new URL(href);

  return {
    href,
    protocol,
    hostname,
    pathname,
    getAttribute: (name) => attributes[name] ?? null,
  };
};

function onPage(hostname) {
  global.window = { location: { hostname, href: `https://${hostname}/search?q=a+query` } };
}

function resolve(hostname, href, attributes) {
  onPage(hostname);

  return getDestination(element(href, attributes));
}

describe('link destinations', () => {
  describe('a link to its destination', () => {
    it('is left as it is', () => {
      assert.equal(resolve(GOOGLE, DESTINATION), DESTINATION);
      assert.equal(resolve(BING, DESTINATION), DESTINATION);
    });

    it('resolves to nothing when it is not an http(s) link', () => {
      assert.equal(resolve(GOOGLE, 'javascript:void(0)'), null);
      assert.equal(resolve(GOOGLE, 'mailto:a@example.com'), null);
    });
  });

  describe('a link within the page', () => {
    it('resolves to nothing unless it wraps a destination', () => {
      assert.equal(resolve(GOOGLE, `https://${GOOGLE}/search?q=a+query`), null);
      assert.equal(resolve(GOOGLE, `https://${GOOGLE}/`), null);
    });

    it('leaves a token to be resolved elsewhere', () => {
      assert.equal(resolve(GOOGLE, `https://${GOOGLE}/goto?url=aResultTokenLongEnough`), null);
    });

    it('treats a link into another search host the same', () => {
      assert.equal(resolve('www.google.pl', `https://${GOOGLE}/goto?url=aResultToken`), null);
      assert.equal(resolve(GOOGLE, `https://google.com/goto?url=aResultToken`), null);
      assert.equal(resolve('www.google.pl', `https://${GOOGLE}/url?q=${DESTINATION}`), DESTINATION);
      assert.equal(resolve(BING, `https://cn.bing.com/`), null);
    });
  });

  describe('a destination spelled out in the query string', () => {
    it('is read from either parameter', () => {
      for (const param of ['url', 'q']) {
        const href = `https://${GOOGLE}/url?${param}=${encodeURIComponent(DESTINATION)}`;
        assert.equal(resolve(GOOGLE, href), DESTINATION);
      }
    });

    it('is ignored when it is not an http(s) URL', () => {
      for (const param of ['url', 'q']) {
        const target = encodeURIComponent('javascript:alert(1)');
        assert.equal(resolve(GOOGLE, `https://${GOOGLE}/url?${param}=${target}`), null);
      }
    });

    it('is only read from the page it belongs to', () => {
      // On another host the wrapper is a link like any other
      const href = `https://example.net/url?url=${encodeURIComponent(DESTINATION)}`;
      assert.equal(resolve(GOOGLE, href), href);
    });
  });

  describe('a destination encoded into the link', () => {
    const encoded = (value = DESTINATION) =>
      `https://${BING}/ck/a?u=a1${Buffer.from(value).toString('base64')}`;

    it('is decoded', () => {
      assert.equal(resolve(BING, encoded()), DESTINATION);
    });

    it('is left alone when it cannot be decoded', () => {
      assert.equal(resolve(BING, `https://${BING}/ck/a?u=a1!!not-base64`), null);
      assert.equal(resolve(BING, `https://${BING}/ck/a?other=1`), null);
    });

    it('is ignored when it is not an http(s) URL', () => {
      assert.equal(resolve(BING, encoded('javascript:alert(1)')), null);
    });
  });

  describe('an ad', () => {
    const LANDING_PAGE = 'https://advertiser.example/offer?utm_campaign=x';
    const clickTracker = (adurl, path = '/aclk') =>
      `https://ads.example${path}?ai=abc&gclid=xyz&adurl=${encodeURIComponent(adurl)}`;

    it('follows the click tracker the page swaps the link for', () => {
      const shown = 'https://advertiser.example/';

      assert.equal(resolve(GOOGLE, shown, { 'data-rw': clickTracker(LANDING_PAGE) }), LANDING_PAGE);
    });

    it('follows a click tracker used as the link itself', () => {
      assert.equal(resolve(GOOGLE, clickTracker(LANDING_PAGE)), LANDING_PAGE);
      assert.equal(resolve(GOOGLE, clickTracker(LANDING_PAGE, '/pagead/aclk')), LANDING_PAGE);
    });

    it('follows a click tracker on the page itself', () => {
      const href = `https://${GOOGLE}/aclk?adurl=${encodeURIComponent(LANDING_PAGE)}`;

      assert.equal(resolve(GOOGLE, href), LANDING_PAGE);
    });

    it('keeps the link when the landing page is withheld', () => {
      const shown = 'https://advertiser.example/';

      assert.equal(resolve(GOOGLE, shown, { 'data-rw': clickTracker('') }), shown);
      assert.equal(resolve(GOOGLE, shown, { 'data-rw': 'https://ads.example/aclk?ai=abc' }), shown);
      assert.equal(resolve(GOOGLE, shown, { 'data-rw': 'not a url' }), shown);
    });

    it('ignores a landing page that is not an http(s) URL', () => {
      const shown = 'https://advertiser.example/';

      assert.equal(
        resolve(GOOGLE, shown, { 'data-rw': clickTracker('javascript:alert(1)') }),
        shown,
      );
    });

    it('only follows an actual click tracker', () => {
      // A destination that merely carries an "adurl" of its own is not one
      const decoy = 'https://advertiser.example/landing?adurl=https://elsewhere.example/';

      assert.equal(resolve(GOOGLE, decoy), decoy);
      assert.equal(resolve(GOOGLE, DESTINATION, { 'data-rw': decoy }), DESTINATION);
    });
  });

  describe('isResultPage()', () => {
    it('knows a result page by its host, whichever country it is served from', () => {
      for (const hostname of [
        'www.google.com',
        'google.pl',
        'www.google.co.uk',
        'www.google.com.au',
        'www.google.cat',
        'www.bing.com',
        'cn.bing.com',
      ]) {
        assert.equal(isResultPage(hostname), true, hostname);
      }
    });

    it('is not fooled by a host that merely carries the name', () => {
      for (const hostname of [
        'github.com',
        'notgoogle.com',
        'google.example.com',
        'google.example.net',
        'bing.example.com',
        'bing.example.net',
        'google.com.example.net',
        'google.co.com',
        'mail.google.com',
      ]) {
        assert.equal(isResultPage(hostname), false, hostname);
      }
    });

    it('reads the current page when not told otherwise', () => {
      onPage(GOOGLE);
      assert.equal(isResultPage(), true);

      onPage('example.com');
      assert.equal(isResultPage(), false);
    });
  });
});
