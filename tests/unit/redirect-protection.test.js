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
    const result = applyRedirectProtection(rules, { enabled: true, priority: 100 });
    const redirect = result.find((r) => r.action.type === 'redirect');

    assert.strictEqual(result.filter((r) => r.action.type === 'redirect').length, 1);
    assert.ok(redirect);
    assert.strictEqual(redirect.priority, 100);
    assert.strictEqual(redirect.action.redirect.extensionPath, '/pages/redirect-protection/index.html');
    assert.strictEqual(redirect.condition.resourceTypes.length, 1);
    assert.strictEqual(redirect.condition.resourceTypes[0], 'main_frame');
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
    const result = applyRedirectProtection(rules, { enabled: true, priority: 100 });
    const redirect = result.find((r) => r.action.type === 'redirect');
    const block = result.find((r) => r.action.type === 'block');

    assert.strictEqual(result.filter((r) => r.action.type === 'redirect').length, 1);
    assert.ok(redirect);
    assert.strictEqual(redirect.condition.resourceTypes.length, 1);
    assert.strictEqual(redirect.condition.resourceTypes[0], 'main_frame');
    assert.ok(block);
    assert.strictEqual(block.condition.resourceTypes.length, 2);
    assert.ok(block.condition.resourceTypes.includes('script'));
    assert.ok(block.condition.resourceTypes.includes('image'));
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
    const result = applyRedirectProtection(rules, { enabled: false, priority: 100 });

    assert.strictEqual(result.filter((r) => r.action.type === 'redirect').length, 0);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].action.type, 'block');
    assert.ok(result[0].condition.resourceTypes.includes('main_frame'));
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
    const result = applyRedirectProtection(rules, { enabled: true, priority: 100 });

    assert.strictEqual(result.filter((r) => r.action.type === 'redirect').length, 0);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].action.type, 'block');
    assert.strictEqual(result[0].condition.resourceTypes.length, 2);
  });

  it('should preserve all condition properties in redirect rules', () => {
    const rules = [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          regexFilter: '^https:\\/\\/server\\.[a-z0-9]{4}\\.com\\/invite\\/\\d+\\b',
          requestDomains: ['com'],
          excludedRequestDomains: ['trusted.com'],
          resourceTypes: ['main_frame'],
          isUrlFilterCaseSensitive: true,
        },
      },
    ];
    const result = applyRedirectProtection(rules, { enabled: true, priority: 100 });
    const redirect = result.find((r) => r.action.type === 'redirect');

    assert.strictEqual(result.filter((r) => r.action.type === 'redirect').length, 1);
    assert.ok(redirect);
    assert.strictEqual(redirect.condition.regexFilter, '^https:\\/\\/server\\.[a-z0-9]{4}\\.com\\/invite\\/\\d+\\b');
    assert.strictEqual(redirect.condition.requestDomains[0], 'com');
    assert.strictEqual(redirect.condition.excludedRequestDomains[0], 'trusted.com');
    assert.strictEqual(redirect.condition.isUrlFilterCaseSensitive, true);
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
    const result = applyRedirectProtection(rules, { enabled: true, priority: 100 });
    const redirects = result.filter((r) => r.action.type === 'redirect');

    assert.strictEqual(redirects.length, 2);
    assert.ok(redirects.every((r) => r.priority === 100));
    assert.ok(redirects.some((r) => r.condition.urlFilter === '||tracker1.com^'));
    assert.ok(redirects.some((r) => r.condition.urlFilter === '||tracker2.com^'));
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
    const result = applyRedirectProtection(rules, { enabled: true, priority: 100 });

    assert.strictEqual(result.filter((r) => r.action.type === 'redirect').length, 0);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].action.type, 'allow');
    assert.ok(result[0].condition.resourceTypes.includes('main_frame'));
  });
});
