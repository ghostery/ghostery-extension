/**
 * Matcher.js Unit Tests
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { fuzzyUrlMatcher } from '../../src/utils/matcher';

describe('src/utils/matcher.js', () => {
	describe('testing fuzzyUrlMatcher()', () => {
		const urls = [
			'google.com',
			'ghostery.com/products',
			'example.com/page*',
			'*.atlassian.net',
			'*.twitter.com/ghostery',
			'*.jira.net/board*',
			'*facebook.com',
		];

		test('host strict match', () => {
			expect(fuzzyUrlMatcher('https://google.com/analytics', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://analytics.google.com/something', urls)).toBeFalsy();
			expect(fuzzyUrlMatcher('https://example.com/', urls)).toBeFalsy();
		});

		test('host and path strict match', () => {
			expect(fuzzyUrlMatcher('https://ghostery.com/products', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://ghostery.com/products1', urls)).toBeFalsy();
		});

		test('host fuzzy match', () => {
			expect(fuzzyUrlMatcher('https://ghostery.atlassian.net', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://ghostery.atlassian.net/board', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://ghostery.atlassian.com', urls)).toBeFalsy();
		});

		test('host fuzzy match rules require \'.\' ', () => {
			expect(fuzzyUrlMatcher('https://something.facebook.com', urls)).toBeFalsy();
			expect(fuzzyUrlMatcher('https://facebook.com', urls)).toBeFalsy();
		});

		test('host fuzzy match and path strict match', () => {
			expect(fuzzyUrlMatcher('https://page.twitter.com/ghostery', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://page.twitter.com/ghostery2', urls)).toBeFalsy();
			expect(fuzzyUrlMatcher('https://page.twitter.com/geistery', urls)).toBeFalsy();
		});

		test('host strict match and path fuzzy match', () => {
			expect(fuzzyUrlMatcher('https://example.com/page_anything', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://example.com/p', urls)).toBeFalsy();
			expect(fuzzyUrlMatcher('https://page.example.com/page', urls)).toBeFalsy();
		});

		test('host and path fuzzy match', () => {
			expect(fuzzyUrlMatcher('https://ghostery.jira.net/board', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://ghostery.jira.net/b', urls)).toBeFalsy();
			expect(fuzzyUrlMatcher('https://ghostery.jira.net/board100', urls)).toBeTruthy();
		});
	});
});
