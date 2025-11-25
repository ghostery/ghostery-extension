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

import { parse as parseDomain } from 'tldts-experimental';

/**
 * Parse domain from DNR urlFilter pattern (duplicated from build script for testing)
 */
function parseUrlFilterDomain(urlFilter) {
  if (!urlFilter) return null;

  // Only process domain patterns (start with || and end with ^)
  if (!urlFilter.startsWith('||') || !urlFilter.endsWith('^')) {
    return null;
  }

  // Extract domain between || and ^
  let domain = urlFilter.substring(2, urlFilter.length - 1);

  // Validate it's a valid domain using tldts
  const parsed = parseDomain(domain);

  // Must have a valid domain and TLD
  if (parsed.domain && parsed.publicSuffix) {
    return parsed.hostname?.toLowerCase() || parsed.domain.toLowerCase();
  }

  return null;
}

// Test cases
const tests = [
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
];

// Run tests
console.log('Running Redirect Protection Domain Parsing Tests\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
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
  `\nResults: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`,
);

if (failed > 0) {
  process.exit(1);
}

console.log('✅ All tests passed!');
