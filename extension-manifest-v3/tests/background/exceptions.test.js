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

import '../setup.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { f } from '@cliqz/adblocker';
import { restrictFilter } from '../../src/background/exceptions.js';

describe('/background/exceptions.js', () => {
  describe('#restrictFilter', () => {
    it('restricts cosmetic filters', () => {
      assert.strictEqual(
        restrictFilter(f`###test`, 'foo.org').toString(),
        'foo.org###test',
      );
      assert.strictEqual(
        restrictFilter(f`#@##test`, 'foo.org').toString(),
        'foo.org#@##test',
      );
      assert.strictEqual(
        restrictFilter(f`foo.org###test`, 'bar.org').toString(),
        'bar.org,foo.org###test',
      );
      assert.strictEqual(
        restrictFilter(f`foo.org#@##test`, 'bar.org').toString(),
        'bar.org,foo.org#@##test',
      );
    });

    it('restricts network filters', () => {
      assert.strictEqual(
        restrictFilter(f`||bar.org^`, 'foo.org').toString(),
        '||bar.org^$domain=foo.org',
      );
      assert.strictEqual(
        restrictFilter(f`||bar.org^$3p`, 'foo.org').toString(),
        '||bar.org^$3p,domain=foo.org',
      );
      assert.strictEqual(
        restrictFilter(
          f`||bar.org^$3p,domain=baz.net|foo.net,script`,
          'foo.org',
        ).toString(),
        '||bar.org^$3p,domain=baz.net|foo.net|foo.org,script',
      );
      assert.strictEqual(
        restrictFilter(
          f`||bar.org^$domain=baz.net|foo.net,script`,
          'foo.org',
        ).toString(),
        '||bar.org^$domain=baz.net|foo.net|foo.org,script',
      );
      assert.strictEqual(
        restrictFilter(
          f`||bar.org^$3p,domain=baz.net|foo.net`,
          'foo.org',
        ).toString(),
        '||bar.org^$3p,domain=baz.net|foo.net|foo.org',
      );
    });
  });
});
