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

import bugDb from '../../src/classes/BugDb';
import conf from '../../src/classes/Conf';
import { isBug, fuzzyUrlMatcher } from '../../src/utils/matcher';

describe('src/utils/matcher.js', () => {
	beforeAll(done => {
		// Fake the XMLHttpRequest for fetchJson(/daabases/bugs.json)
		const bugsJson = JSON.stringify({
			"apps": {},
			"firstPartyExceptions": {
				"101": [
					"google.com/ig"
				],
				"991": [
					"twitter.com"
				],
				"1240": [
					"plus.google.com",
					"chrome.google.com/webstore*"
				]
			},
			"patterns": {
				"regex": {},
				"host": {
					"com": {
						"gmodules": {
							"$": 101
						}
					}
				},
				"host_path": {
					"com": {
						"google": {
							"apis": {
								"$": [
									{
										"path": "js/plusone.js",
										"id": 1240
									}
								]
							}
						},
						"twitter": {
							"platform": {
								"$": [
									{
										"path": "widgets",
										"id": 991
									}
								]
							}
						}
					}
				},
				"path": {
					"js/tracking.js": 13
				},
				"regex": {
					15: "(googletagservices\\.com\\/.*\\.js)"
				}
			}
		});
		// Mock bugDb fetch response
		global.mockFetchResponse(200, bugsJson);

		// Stub chrome storage methods so that our prefsGet() calls work.
		chrome.storage.local.get.yields(null); //for Conf
		chrome.storage.local.get.withArgs(['bugs']).yields({});

		chrome.storage.local.get.yields({ previousVersion: "8.0.8" });
		conf.init().then(() => {
			bugDb.init().then(() => {
				// async finished
				done();
			});
		}).catch(err => console.log(err));
	});

	describe('testing isBug()', () => {
		describe('testing basic pattern matching', () => {
			test('host only tracker matching works', () => {
				expect(isBug('https://gmodules.com/', 'example.com')).toBe(101);
			});

			test('host+path tracker matching works', () => {
				expect(isBug('https://apis.google.com/js/plusone.js', 'example.com')).toBe(1240);
			});

			test('path only tracker matching works', () => {
				expect(isBug('https://apis.google.com/js/tracking.js', 'example.com')).toBe(13);
			});

			test('regex tracker matching works', () => {
				expect(isBug('https://apis.google.com/js/tracking.js', 'example.com')).toBe(13);
			});

			test('pattern matching is case insensitive', () => {
				expect(isBug('https://googletagservices.com/anything/tracker.js', 'example.com')).toBe(15);
				expect(isBug('https://googletagservices.com/anything/tracker.css', 'example.com')).toBeFalsy();
			});
		});
	});

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
