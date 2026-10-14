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

import { toCosmeticFilter } from '../../src/utils/element-picker.js';

describe('toCosmeticFilter', () => {
  it('accepts a plain selector for a hostname', () => {
    const cases = [
      ['page.localhost', '#custom-filter'],
      ['www.example.com', 'div.ad > span:nth-of-type(2)'],
      ['localhost', 'div, span'],
      ['127.0.0.1', '#a'],
    ];

    for (const [hostname, selector] of cases) {
      assert.equal(toCosmeticFilter(hostname, selector)?.getSelector(), selector);
    }
  });

  it('rejects anything but one plain hostname', () => {
    const hostnames = ['', '*', 'a.com,b.com', '~a.com', 'a.com\nb.com', 'a.com##x', 'a.com b.com'];

    for (const hostname of hostnames) {
      assert.equal(toCosmeticFilter(hostname, 'div'), null, hostname);
    }
  });

  it('rejects filter syntax in the selector', () => {
    const selectors = [
      '+js(aeld, click)',
      'div:style(color: red)',
      'div:has-text(ad)',
      'div:remove()',
      'div:upward(1)',
      '^script:has-text(ad)',
      'div\n*##+js(aeld, click)',
      'div\nb.com##+js(aeld, click)',
    ];

    for (const selector of selectors) {
      assert.equal(toCosmeticFilter('a.com', selector), null, selector);
    }
  });
});
