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
import { isTrusted } from '../../src/utils/trackerdb.js';
import Request from '../../src/background/utils/request.js';

describe('/utils/trackerdb.js', () => {
  describe('#isTrusted', () => {
    const domain = 'foo.org';
    const request = Request.fromRequestDetails({
      url: 'https://bar.com',
      originUrl: `https://${domain}`,
    });

    it('returns false for blocked categories', () => {
      assert.strictEqual(isTrusted(request, 'advertising'), false);
    });

    it('returns true for trusted categories', () => {
      assert.strictEqual(isTrusted(request, 'cdn'), true);
    });

    it('handles exceptions for subdomains', () => {
      const request = Request.fromRequestDetails({
        url: 'https://bar.com',
        originUrl: `https://baz.${domain}`,
      });
      const exception = {
        overwriteStatus: false,
        blocked: [domain],
        allowed: [domain],
      };
      assert.strictEqual(isTrusted(request, 'advertising', exception), true);
      assert.strictEqual(isTrusted(request, 'cdn', exception), false);
    });

    it('handles domain overwrites', () => {
      const exception = {
        overwriteStatus: false,
        blocked: [domain],
        allowed: [domain],
      };
      assert.strictEqual(isTrusted(request, 'advertising', exception), true);
      assert.strictEqual(isTrusted(request, 'cdn', exception), false);
    });

    it('reverses global logic with global with exceptions overwrite', () => {
      const exception = { overwriteStatus: true, blocked: [], allowed: [] };
      assert.strictEqual(isTrusted(request, 'advertising', exception), true);
      assert.strictEqual(isTrusted(request, 'cdn', exception), false);
    });

    it('reverses domain logic with global with exceptions overwrite', () => {
      const exception = {
        overwriteStatus: true,
        blocked: [domain],
        allowed: [domain],
      };
      assert.strictEqual(isTrusted(request, 'advertising', exception), false);
      assert.strictEqual(isTrusted(request, 'cdn', exception), true);
    });
  });
});
