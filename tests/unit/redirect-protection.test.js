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
import {
  parseUrlFilterDomain,
  extractMainFrameBlockingDomains,
} from '../../scripts/build-redirect-protection-rules.js';

// Test cases for parseUrlFilterDomain
const parseTests = [
  // Valid domains
  {
    input: '||example.com^',
    expected: 'example.com',
    description: 'Basic domain',
  },
  {
    input: '||sub.example.com^',
    expected: 'sub.example.com',
    description: 'Subdomain',
  },
  {
    input: '||googie-anaiytics.com^',
    expected: 'googie-anaiytics.com',
    description: 'Domain with hyphen',
  },
  { input: '||lnkr.us^', expected: 'lnkr.us', description: 'Short TLD' },
  {
    input: '||0x01n2ptpuz3.com^',
    expected: '0x01n2ptpuz3.com',
    description: 'Domain with numbers/hex',
  },
  {
    input: '||test.co.uk^',
    expected: 'test.co.uk',
    description: 'Multi-part TLD',
  },
  {
    input: '||EXAMPLE.COM^',
    expected: 'example.com',
    description: 'Uppercase (should be lowercased)',
  },

  // Invalid patterns (should be rejected)
  {
    input: '/?usid=*&utid=',
    expected: null,
    description: 'Path pattern without domain',
  },
  { input: '/page/bouncy.php?', expected: null, description: 'Path pattern' },
  {
    input: '||*example.com^',
    expected: null,
    description: 'Domain with wildcard',
  },
  { input: '||example^', expected: null, description: 'No TLD' },
  { input: 'example.com', expected: null, description: 'Missing || and ^' },
  { input: '||example.com', expected: null, description: 'Missing ^' },
  { input: 'example.com^', expected: null, description: 'Missing ||' },
  { input: '*://example.com/*', expected: null, description: 'URL pattern' },
  { input: null, expected: null, description: 'Null input' },
  { input: '', expected: null, description: 'Empty string' },
  { input: '||localhost^', expected: null, description: 'localhost (no TLD)' },

  // Path-based patterns (should be rejected)
  {
    input: '||vercel.app/americaplata.com.html^',
    expected: null,
    description: 'Path pattern (vercel.app/path)',
  },
  {
    input: '||example.com/ads/^',
    expected: null,
    description: 'Path pattern (example.com/ads/)',
  },
  {
    input: '||vercel.app/js/esc.js^',
    expected: null,
    description: 'Path pattern with file (vercel.app/js/file.js)',
  },
  {
    input: '||domain.com/path/to/resource^',
    expected: null,
    description: 'Multi-level path pattern',
  },
];

// Test cases for extractMainFrameBlockingDomains
const extractionTests = [
  {
    description: 'Should extract domain from urlFilter with main_frame',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: ['tracker.com'],
  },
  {
    description:
      'Should NOT extract from requestDomains (initiator, not target)',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          requestDomains: ['surge.sh'],
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: [],
  },
  {
    description:
      'Should extract from urlFilter but ignore requestDomains in same rule',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          requestDomains: ['surge.sh'],
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: ['tracker.com'],
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
    description: 'Should extract multiple domains and sort them',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||zzz.com^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||aaa.com^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||mmm.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: ['aaa.com', 'mmm.com', 'zzz.com'],
  },
  {
    description: 'Should deduplicate domains',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame', 'script'],
        },
      },
    ],
    expected: ['tracker.com'],
  },
  {
    description: 'Should handle rules with main_frame among other types',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame', 'script', 'image', 'stylesheet'],
        },
      },
    ],
    expected: ['tracker.com'],
  },
  {
    description: 'Should skip invalid urlFilter patterns',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '/path/to/tracker',
          resourceTypes: ['main_frame'],
        },
      },
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||valid-tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: ['valid-tracker.com'],
  },
  {
    description: 'Should skip path-based patterns and extract only domain patterns',
    rules: [
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||vercel.app/americaplata.com.html^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||vercel.app/js/esc.js^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||specific-malware.vercel.app^',
          resourceTypes: ['main_frame'],
        },
      },
      {
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracker.com^',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    expected: ['specific-malware.vercel.app', 'tracker.com'],
  },
];

// Run parseUrlFilterDomain tests
console.log('Running Redirect Protection Domain Parsing Tests\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

parseTests.forEach((test, index) => {
  const result = parseUrlFilterDomain(test.input);
  const success = result === test.expected;

  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${test.description}`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.description}`);
    console.log(`   Input:    ${JSON.stringify(test.input)}`);
    console.log(`   Expected: ${JSON.stringify(test.expected)}`);
    console.log(`   Got:      ${JSON.stringify(result)}`);
  }
});

console.log('='.repeat(80));
console.log(
  `\nResults: ${passed} passed, ${failed} failed out of ${parseTests.length} tests\n`,
);

// Run extractMainFrameBlockingDomains tests
console.log('\nRunning Domain Extraction Tests\n');
console.log('='.repeat(80));

let extractionPassed = 0;
let extractionFailed = 0;

extractionTests.forEach((test, index) => {
  const result = extractMainFrameBlockingDomains(test.rules);
  const success = JSON.stringify(result) === JSON.stringify(test.expected);

  if (success) {
    extractionPassed++;
    console.log(`✅ Test ${index + 1}: ${test.description}`);
  } else {
    extractionFailed++;
    console.log(`❌ Test ${index + 1}: ${test.description}`);
    console.log(`   Expected: ${JSON.stringify(test.expected)}`);
    console.log(`   Got:      ${JSON.stringify(result)}`);
  }
});

console.log('='.repeat(80));
console.log(
  `\nResults: ${extractionPassed} passed, ${extractionFailed} failed out of ${extractionTests.length} tests\n`,
);

// Overall results
const totalPassed = passed + extractionPassed;
const totalFailed = failed + extractionFailed;
const totalTests = parseTests.length + extractionTests.length;

console.log('='.repeat(80));
console.log(
  `\nOverall: ${totalPassed} passed, ${totalFailed} failed out of ${totalTests} tests\n`,
);

if (totalFailed > 0) {
  process.exit(1);
}

console.log('✅ All tests passed!');
