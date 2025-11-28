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
import assert from 'node:assert';
import { applyRedirectProtection } from '../../src/utils/dnr.js';

describe('applyRedirectProtection', () => {
  const defaultOptions = { enabled: true, priority: 100 };

  it('should convert main_frame blocking rule to redirect rule', () => {
    const rules = [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ];
    const result = applyRedirectProtection(rules, defaultOptions);
    const redirect = result.find((r) => r.action.type === 'redirect');

    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(redirect.action, {
      type: 'redirect',
      redirect: { extensionPath: '/pages/redirect-protection/index.html' },
    });
    assert.strictEqual(redirect.priority, 100);
    assert.deepStrictEqual(redirect.condition.resourceTypes, ['main_frame']);
    assert.strictEqual(redirect.condition.urlFilter, '||tracker.com^');
  });

  it('should split rule with multiple resource types including main_frame', () => {
    const rules = [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame', 'script', 'image'],
        },
      },
    ];
    const result = applyRedirectProtection(rules, defaultOptions);
    const redirect = result.find((r) => r.action.type === 'redirect');
    const block = result.find((r) => r.action.type === 'block');

    assert.strictEqual(result.length, 2);
    assert.deepStrictEqual(redirect.condition.resourceTypes, ['main_frame']);
    assert.deepStrictEqual(block.condition.resourceTypes, ['script', 'image']);
  });

  it('should not convert rules when disabled', () => {
    const rules = [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ];
    const result = applyRedirectProtection(rules, {
      enabled: false,
      priority: 100,
    });

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].action.type, 'block');
    assert.deepStrictEqual(result[0].condition.resourceTypes, ['main_frame']);
  });

  it('should preserve non-main_frame blocking rules unchanged', () => {
    const rules = [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['script', 'image'],
        },
      },
    ];
    const result = applyRedirectProtection(rules, defaultOptions);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].action.type, 'block');
    assert.deepStrictEqual(result[0].condition.resourceTypes, [
      'script',
      'image',
    ]);
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
    const result = applyRedirectProtection(rules, defaultOptions);
    const redirect = result.find((r) => r.action.type === 'redirect');

    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(redirect.condition, condition);
  });

  it('should handle multiple blocking rules', () => {
    const rules = [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker1.com^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        id: 2,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker2.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ];
    const result = applyRedirectProtection(rules, defaultOptions);
    const redirects = result.filter((r) => r.action.type === 'redirect');

    assert.strictEqual(redirects.length, 2);
    assert.ok(redirects.every((r) => r.priority === 100));
    const urlFilters = redirects.map((r) => r.condition.urlFilter).sort();
    assert.deepStrictEqual(urlFilters, ['||tracker1.com^', '||tracker2.com^']);
  });

  it('should preserve non-blocking rules unchanged', () => {
    const rules = [
      {
        id: 1,
        action: { type: 'allow' },
        condition: {
          urlFilter: '||trusted.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ];
    const result = applyRedirectProtection(rules, defaultOptions);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].action.type, 'allow');
    assert.deepStrictEqual(result[0].condition.resourceTypes, ['main_frame']);
  });
});
