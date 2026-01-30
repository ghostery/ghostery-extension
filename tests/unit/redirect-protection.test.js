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
import { getRedirectProtectionRules } from '../../src/utils/dnr.js';

describe('getRedirectProtectionRules', () => {
  it('should convert main_frame blocking rule to redirect rule', () => {
    const rules = [
      {
        id: 1,
        priority: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ];
    const result = getRedirectProtectionRules(rules);
    const redirect = result.find((r) => r.action.type === 'redirect');

    assert.deepEqual(result.length, 1);
    assert.deepEqual(redirect.action, {
      type: 'redirect',
      redirect: { extensionPath: '/pages/redirect-protection/index.html' },
    });
    assert.deepEqual(redirect.priority, 2);
    assert.deepEqual(redirect.condition.resourceTypes, ['main_frame']);
    assert.deepEqual(redirect.condition.urlFilter, '||tracker.com^');
  });

  it('should preserve all condition properties in redirect rules', () => {
    const condition = {
      regexFilter: '^https:\\/\\/server\\.[a-z0-9]{4}\\.com\\/invite\\/\\d+\\b',
      requestDomains: ['com'],
      excludedRequestDomains: ['trusted.com'],
      resourceTypes: ['main_frame'],
      isUrlFilterCaseSensitive: true,
    };
    const rules = [{ id: 1, action: { type: 'block' }, condition }];
    const result = getRedirectProtectionRules(rules);
    const redirect = result.find((r) => r.action.type === 'redirect');

    assert.deepEqual(result.length, 1);
    assert.deepEqual(redirect.condition, condition);
  });

  it('should handle multiple blocking rules', () => {
    const rules = [
      {
        id: 1,
        priority: 10,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker1.com^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        id: 2,
        priority: 10,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker2.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ];
    const result = getRedirectProtectionRules(rules);
    const redirects = result.filter((r) => r.action.type === 'redirect');

    assert.deepEqual(redirects.length, 2);
    assert.ok(redirects.every((r) => r.priority === 11));

    const urlFilters = redirects.map((r) => r.condition.urlFilter).sort();
    assert.deepEqual(urlFilters, ['||tracker1.com^', '||tracker2.com^']);
  });
});
