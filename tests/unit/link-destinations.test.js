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

import { isResultPage, scanDocumentLinkData } from '../../src/utils/link-destinations.js';

const RENDER_DATA_PAGE = 'www.google.com';
const ENCODED_LINK_PAGE = 'www.bing.com';

const TOKEN = 'aResultTokenLongEnoughToPass';
const DESTINATION = 'https://example.com/a-result';

const element = (href, attributes = {}) => ({
  href,
  hostname: new URL(href).hostname,
  getAttribute: (name) => attributes[name] ?? null,
});

const documentWith = (...scripts) => ({
  querySelectorAll: () => scripts.map((text) => ({ textContent: text })),
});

function onPage(hostname) {
  global.window = { location: { hostname } };
}

function visit(hostname, ...scripts) {
  onPage(hostname);

  return scanDocumentLinkData(documentWith(...scripts));
}

const renderDataScript = (token = TOKEN, destination = DESTINATION, trailing = '') =>
  `x,"/goto?url\\u003d${token}"${trailing}],["${destination}","a title"],y`;

describe('link destinations', () => {
  describe('a page that carries its results as data', () => {
    const wrapped = `https://${RENDER_DATA_PAGE}/goto?url=${TOKEN}`;

    const resolve = (scripts, href = wrapped) =>
      visit(RENDER_DATA_PAGE, ...[scripts].flat())(element(href));

    it('resolves a wrapped link through the render data', () => {
      assert.equal(resolve(renderDataScript()), DESTINATION);
    });

    it('leaves a link alone when the page does not describe its token', () => {
      assert.equal(resolve('nothing to index here'), null);
    });

    it('reads a destination spelled out in the query string', () => {
      const target = 'https://example.com/spelled-out';

      for (const param of ['url', 'q']) {
        const href = `https://${RENDER_DATA_PAGE}/url?${param}=${encodeURIComponent(target)}`;
        assert.equal(resolve('', href), target);
      }
    });

    it('leaves links that already point at their destination alone', () => {
      assert.equal(resolve('', `https://${RENDER_DATA_PAGE}/search?q=a+query`), null);
      assert.equal(resolve(renderDataScript(), `https://example.com/goto?url=${TOKEN}`), null);
    });

    it('matches a token carrying padding or extra parameters', () => {
      for (const suffix of ['', '=', '%3D', '&ved=abc', '%3D%3D&ved=abc']) {
        assert.equal(
          resolve(renderDataScript(), `${wrapped}${suffix}`),
          DESTINATION,
          `suffix: ${JSON.stringify(suffix)}`,
        );
      }
    });

    it('ignores tokens too short to be real', () => {
      const short = 'tooShort';

      assert.equal(
        resolve(renderDataScript(short), `https://${RENDER_DATA_PAGE}/goto?url=${short}`),
        null,
      );
    });

    it('ignores a destination that is not an http(s) URL', () => {
      assert.equal(resolve(renderDataScript(TOKEN, 'ftp://example.com/x')), null);
      assert.equal(resolve(renderDataScript(TOKEN, 'https://not a url')), null);
    });

    it('unescapes a destination out of the render data', () => {
      const escaped = 'https://example.com/a\\u003db\\u0026c\\u003dd';

      assert.equal(resolve(renderDataScript(TOKEN, escaped)), 'https://example.com/a=b&c=d');
    });

    it('tolerates extra fields trailing the token', () => {
      assert.equal(resolve(renderDataScript(TOKEN, DESTINATION, ',null,3')), DESTINATION);
    });

    describe('while the page is still streaming in', () => {
      const OTHER_TOKEN = TOKEN.replace('aResult', 'bResult');
      const OTHER_DESTINATION = 'https://example.com/b-result';
      const otherWrapped = `https://${RENDER_DATA_PAGE}/goto?url=${OTHER_TOKEN}`;

      const streaming = (textContent) => {
        onPage(RENDER_DATA_PAGE);

        const script = { textContent };
        return [script, { querySelectorAll: () => [script] }];
      };

      it('reads a script that was still empty on an earlier pass', () => {
        const [script, doc] = streaming('');

        scanDocumentLinkData(doc);
        script.textContent = renderDataScript();

        assert.equal(scanDocumentLinkData(doc)(element(wrapped)), DESTINATION);
      });

      it('reads the rest of a script that has grown since', () => {
        const [script, doc] = streaming(renderDataScript());

        scanDocumentLinkData(doc);
        script.textContent += renderDataScript(OTHER_TOKEN, OTHER_DESTINATION);

        const getDestination = scanDocumentLinkData(doc);

        assert.equal(getDestination(element(otherWrapped)), OTHER_DESTINATION);
        assert.equal(getDestination(element(wrapped)), DESTINATION);
      });

      it('leaves a script alone once it stops growing', () => {
        const [script, doc] = streaming(renderDataScript());

        scanDocumentLinkData(doc);
        script.textContent = renderDataScript(OTHER_TOKEN, OTHER_DESTINATION);

        const getDestination = scanDocumentLinkData(doc);

        assert.equal(getDestination(element(otherWrapped)), null);
        assert.equal(getDestination(element(wrapped)), DESTINATION);
      });
    });

    describe('ads', () => {
      const LANDING_PAGE = 'https://advertiser.example/offer?utm_campaign=x';
      const clickTracker = (adurl, path = '/aclk') =>
        `https://ads.example${path}?ai=abc&gclid=xyz&adurl=${encodeURIComponent(adurl)}`;

      const adLink = (attributes, href = wrapped) =>
        visit(RENDER_DATA_PAGE)(element(href, attributes));

      it('follows the click tracker the page swaps the link for', () => {
        assert.equal(adLink({ 'data-rw': clickTracker(LANDING_PAGE) }), LANDING_PAGE);
      });

      it('follows a click tracker used as the link itself', () => {
        assert.equal(adLink({}, clickTracker(LANDING_PAGE)), LANDING_PAGE);
        assert.equal(adLink({}, clickTracker(LANDING_PAGE, '/pagead/aclk')), LANDING_PAGE);
      });

      it('leaves the link alone when the landing page is withheld', () => {
        assert.equal(adLink({ 'data-rw': clickTracker('') }), null);
        assert.equal(adLink({ 'data-rw': 'https://ads.example/aclk?ai=abc' }), null);
        assert.equal(adLink({ 'data-rw': 'not a url' }), null);
      });

      it('ignores a landing page that is not an http(s) URL', () => {
        assert.equal(adLink({ 'data-rw': clickTracker('javascript:alert(1)') }), null);
      });

      it('only follows an actual click tracker', () => {
        // A destination that merely carries an "adurl" of its own is not one
        const decoy = 'https://advertiser.example/landing?adurl=https://elsewhere.example/';

        assert.equal(adLink({}, decoy), null);
        assert.equal(adLink({ 'data-rw': decoy }), null);
      });

      it('prefers its landing page over a token the page reuses elsewhere', () => {
        const getDestination = visit(RENDER_DATA_PAGE, renderDataScript());

        const el = element(wrapped, { 'data-rw': clickTracker(LANDING_PAGE) });

        assert.equal(getDestination(el), LANDING_PAGE);
      });

      it('falls back to the index when the landing page is withheld', () => {
        const getDestination = visit(RENDER_DATA_PAGE, renderDataScript());

        const el = element(wrapped, { 'data-rw': clickTracker('') });

        assert.equal(getDestination(el), DESTINATION);
      });
    });
  });

  describe('a page that encodes the destination into the link', () => {
    const encoded = (value = DESTINATION) =>
      `https://${ENCODED_LINK_PAGE}/ck/a?u=a1${Buffer.from(value).toString('base64')}`;

    const resolve = (href) => visit(ENCODED_LINK_PAGE)(element(href));

    it('decodes the destination', () => {
      assert.equal(resolve(encoded()), DESTINATION);
    });

    it('leaves the link alone when it cannot be decoded', () => {
      assert.equal(resolve(`https://${ENCODED_LINK_PAGE}/ck/a?u=a1!!not-base64`), null);
      assert.equal(resolve(`https://${ENCODED_LINK_PAGE}/ck/a?other=1`), null);
    });

    it('leaves links that already point at their destination alone', () => {
      assert.equal(resolve(`https://${ENCODED_LINK_PAGE}/search?q=a+query`), null);
      assert.equal(resolve(`https://example.com/ck/a?u=a1${btoa(DESTINATION)}`), null);
    });
  });

  it('reads a page only the way that page is written', () => {
    const onRenderData = visit(RENDER_DATA_PAGE, renderDataScript());
    const encodedLink = `https://${RENDER_DATA_PAGE}/ck/a?u=a1${btoa(DESTINATION)}`;

    assert.equal(onRenderData(element(encodedLink)), null);

    const onEncodedLink = visit(ENCODED_LINK_PAGE, renderDataScript());
    const wrappedLink = `https://${ENCODED_LINK_PAGE}/goto?url=${TOKEN}`;

    assert.equal(onEncodedLink(element(wrappedLink)), null);
  });

  it('resolves nothing on a page it does not know', () => {
    const getDestination = visit('search.example', renderDataScript());

    assert.equal(getDestination(element(`https://search.example/goto?url=${TOKEN}`)), null);
  });

  describe('isResultPage()', () => {
    it('knows a result page by its host, whichever country it is served from', () => {
      for (const hostname of ['www.google.com', 'google.pl', 'www.google.co.uk', 'www.bing.com']) {
        assert.equal(isResultPage(hostname), true, hostname);
      }
    });

    it('is not fooled by a host that merely carries the name', () => {
      for (const hostname of ['github.com', 'notgoogle.com', 'google.com.example.net']) {
        assert.equal(isResultPage(hostname), false, hostname);
      }
    });
  });

  it('ignores elements without a string href', () => {
    const getDestination = visit(RENDER_DATA_PAGE);

    for (const href of [undefined, null, {}, { baseVal: '/goto?url=x' }]) {
      assert.equal(getDestination({ href, getAttribute: () => null }), null);
    }
  });
});
