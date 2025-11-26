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

import { applyRedirectProtection } from '../../src/utils/dnr.js';

const tests = [
  {
    description: 'Should convert main_frame blocking rule to redirect rule',
    rules: [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    options: { enabled: true, priority: 100 },
    expectedRedirectCount: 1,
    validate: (result) => {
      const redirect = result.find((r) => r.action.type === 'redirect');
      return (
        redirect &&
        redirect.priority === 100 &&
        redirect.action.redirect.extensionPath ===
          '/pages/redirect-protection/index.html' &&
        redirect.condition.resourceTypes.length === 1 &&
        redirect.condition.resourceTypes[0] === 'main_frame' &&
        redirect.condition.urlFilter === '||tracker.com^'
      );
    },
  },
  {
    description:
      'Should split rule with multiple resource types including main_frame',
    rules: [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame', 'script', 'image'],
        },
      },
    ],
    options: { enabled: true, priority: 100 },
    expectedRedirectCount: 1,
    validate: (result) => {
      const redirect = result.find((r) => r.action.type === 'redirect');
      const block = result.find((r) => r.action.type === 'block');
      return (
        redirect &&
        redirect.condition.resourceTypes.length === 1 &&
        redirect.condition.resourceTypes[0] === 'main_frame' &&
        block &&
        block.condition.resourceTypes.length === 2 &&
        block.condition.resourceTypes.includes('script') &&
        block.condition.resourceTypes.includes('image')
      );
    },
  },
  {
    description: 'Should not convert rules when disabled',
    rules: [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    options: { enabled: false, priority: 100 },
    expectedRedirectCount: 0,
    validate: (result) => {
      return (
        result.length === 1 &&
        result[0].action.type === 'block' &&
        result[0].condition.resourceTypes.includes('main_frame')
      );
    },
  },
  {
    description: 'Should preserve non-main_frame blocking rules unchanged',
    rules: [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['script', 'image'],
        },
      },
    ],
    options: { enabled: true, priority: 100 },
    expectedRedirectCount: 0,
    validate: (result) => {
      return (
        result.length === 1 &&
        result[0].action.type === 'block' &&
        result[0].condition.resourceTypes.length === 2
      );
    },
  },
  {
    description: 'Should preserve all condition properties in redirect rules',
    rules: [
      {
        id: 1,
        action: { type: 'block' },
        condition: {
          regexFilter:
            '^https:\\/\\/server\\.[a-z0-9]{4}\\.com\\/invite\\/\\d+\\b',
          requestDomains: ['com'],
          excludedRequestDomains: ['trusted.com'],
          resourceTypes: ['main_frame'],
          isUrlFilterCaseSensitive: true,
        },
      },
    ],
    options: { enabled: true, priority: 100 },
    expectedRedirectCount: 1,
    validate: (result) => {
      const redirect = result.find((r) => r.action.type === 'redirect');
      return (
        redirect &&
        redirect.condition.regexFilter ===
          '^https:\\/\\/server\\.[a-z0-9]{4}\\.com\\/invite\\/\\d+\\b' &&
        redirect.condition.requestDomains[0] === 'com' &&
        redirect.condition.excludedRequestDomains[0] === 'trusted.com' &&
        redirect.condition.isUrlFilterCaseSensitive === true
      );
    },
  },
  {
    description: 'Should handle multiple blocking rules',
    rules: [
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
    ],
    options: { enabled: true, priority: 100 },
    expectedRedirectCount: 2,
    validate: (result) => {
      const redirects = result.filter((r) => r.action.type === 'redirect');
      return (
        redirects.length === 2 &&
        redirects.every((r) => r.priority === 100) &&
        redirects.some((r) => r.condition.urlFilter === '||tracker1.com^') &&
        redirects.some((r) => r.condition.urlFilter === '||tracker2.com^')
      );
    },
  },
  {
    description: 'Should preserve non-blocking rules unchanged',
    rules: [
      {
        id: 1,
        action: { type: 'allow' },
        condition: {
          urlFilter: '||trusted.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    options: { enabled: true, priority: 100 },
    expectedRedirectCount: 0,
    validate: (result) => {
      return (
        result.length === 1 &&
        result[0].action.type === 'allow' &&
        result[0].condition.resourceTypes.includes('main_frame')
      );
    },
  },
];

console.log('Running Redirect Protection Tests\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const result = applyRedirectProtection(test.rules, test.options);
  const redirectCount = result.filter((r) => r.action.type === 'redirect')
    .length;
  const countMatches = redirectCount === test.expectedRedirectCount;
  const validationPassed = test.validate(result);
  const success = countMatches && validationPassed;

  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${test.description}`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.description}`);
    if (!countMatches) {
      console.log(
        `   Expected ${test.expectedRedirectCount} redirect rules, got ${redirectCount}`,
      );
    }
    if (!validationPassed) {
      console.log(`   Validation failed`);
      console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
    }
  }
});

console.log('='.repeat(80));
console.log(
  `\nResults: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`,
);

if (failed > 0) {
  process.exit(1);
}

console.log('✅ All tests passed!');
