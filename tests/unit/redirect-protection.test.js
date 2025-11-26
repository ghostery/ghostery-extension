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

// Import the actual functions we're testing from the build script
import { extractMainFrameBlockingConditions } from '../../scripts/build-redirect-protection-rules.js';

// Test cases for extractMainFrameBlockingConditions
const extractionTests = [
  {
    description:
      'Should extract condition with urlFilter for main_frame blocking',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: [
      {
        urlFilter: '||tracker.com^',
        resourceTypes: ['main_frame'],
      },
    ],
  },
  {
    description: 'Should preserve requestDomains in condition',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '.com/c/*?s1=',
          requestDomains: ['com'],
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: [
      {
        urlFilter: '.com/c/*?s1=',
        requestDomains: ['com'],
        resourceTypes: ['main_frame'],
      },
    ],
  },
  {
    description: 'Should extract path-based patterns',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||vercel.app/americaplata.com.html^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: [
      {
        urlFilter: '||vercel.app/americaplata.com.html^',
        resourceTypes: ['main_frame'],
      },
    ],
  },
  {
    description: 'Should preserve regexFilter patterns',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          regexFilter:
            '^https:\\/\\/server\\.[a-z0-9]{4}\\.com\\/invite\\/\\d+\\b',
          requestDomains: ['com'],
          resourceTypes: ['main_frame'],
          isUrlFilterCaseSensitive: true,
        },
      },
    ],
    expected: [
      {
        regexFilter:
          '^https:\\/\\/server\\.[a-z0-9]{4}\\.com\\/invite\\/\\d+\\b',
        requestDomains: ['com'],
        resourceTypes: ['main_frame'],
        isUrlFilterCaseSensitive: true,
      },
    ],
  },
  {
    description: 'Should filter resourceTypes to only main_frame',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame', 'script', 'image', 'stylesheet'],
        },
      },
    ],
    expected: [
      {
        urlFilter: '||tracker.com^',
        resourceTypes: ['main_frame'],
      },
    ],
  },
  {
    description: 'Should not extract from rules without main_frame',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['script', 'image'],
        },
      },
    ],
    expected: [],
  },
  {
    description: 'Should not extract from non-blocking rules',
    rules: [
      {
        action: { type: 'allow' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: [],
  },
  {
    description: 'Should extract multiple conditions',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker1.com^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker2.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: [
      {
        urlFilter: '||tracker1.com^',
        resourceTypes: ['main_frame'],
      },
      {
        urlFilter: '||tracker2.com^',
        resourceTypes: ['main_frame'],
      },
    ],
  },
  {
    description: 'Should preserve excludedRequestDomains',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          regexFilter:
            '^https:\\/\\/pancake(?:dro|swa)pclick\\d+\\.vercel\\.app\\/',
          requestDomains: ['vercel.app'],
          excludedRequestDomains: ['pancakeswap.finance'],
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: [
      {
        regexFilter:
          '^https:\\/\\/pancake(?:dro|swa)pclick\\d+\\.vercel\\.app\\/',
        requestDomains: ['vercel.app'],
        excludedRequestDomains: ['pancakeswap.finance'],
        resourceTypes: ['main_frame'],
      },
    ],
  },
];

// Run condition extraction tests
console.log('Running Redirect Protection Condition Extraction Tests\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

extractionTests.forEach((test, index) => {
  const result = extractMainFrameBlockingConditions(test.rules);
  const success = JSON.stringify(result) === JSON.stringify(test.expected);

  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${test.description}`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.description}`);
    console.log(`   Expected: ${JSON.stringify(test.expected, null, 2)}`);
    console.log(`   Got:      ${JSON.stringify(result, null, 2)}`);
  }
});

console.log('='.repeat(80));
console.log(
  `\nResults: ${passed} passed, ${failed} failed out of ${extractionTests.length} tests\n`,
);

if (failed > 0) {
  process.exit(1);
}

console.log('✅ All tests passed!');
