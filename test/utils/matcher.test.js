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

		describe('testing isBug() first party exceptions for twitter', () => {
			const twitter_button = 'http://platform.twitter.com/widgets/';

			test('first confirm Twitter Button is a tracker', () => {
				expect(isBug(twitter_button)).toBe(991);
			});

			test('host-only first-party exception', () => {
				expect(isBug(twitter_button, 'https://twitter.com/ghostery')).toBeFalsy();
			});

			test('same exception on the same page URL as above, but with www', () => {
				expect(isBug(twitter_button, 'https://www.twitter.com/ghostery')).toBeFalsy();
			});
		});

		describe('testing isBug() first party exceptions for google widgets', () => {
			const google_widgets = 'http://gmodules.com/blah';

			test('first confirm Google Widgets is a tracker', () => {
				expect(isBug(google_widgets)).toBe(101);
			});

			test('host and exact path exception', () => {
				expect(isBug(google_widgets, 'http://google.com/ig')).toBeFalsy();
			});
		});

		describe('testing isBug() first party exceptions for google plus one', () => {
			const google_plus_one = 'https://apis.google.com/js/plusone.js';

			test('first confirm Google +1 is a tracker', () => {
				expect(isBug(google_plus_one)).toBe(1240);
			});

			test('host and fuzzy path exception', () => {
				expect(isBug(google_plus_one, 'https://chrome.google.com/webstore/detail/ghostery/mlomiejdfkolichcflejclcbmpeaniij?hl=en')).toBeFalsy();
			});
		});
	});

	describe('testing fuzzyUrlMatcher()', () => {
		const urls = ['google.com', 'ghostery.com/products', 'example.com/page*'];

		test('host match', () => {
			expect(fuzzyUrlMatcher('https://google.com/analytics', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://analytics.google.com/something', urls)).toBeFalsy();
		});

		test('host and path fuzzy match', () => {
			expect(fuzzyUrlMatcher('https://example.com/page_anything', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://example.com/p', urls)).toBeFalsy();
		});

		test('host and path match', () => {
			expect(fuzzyUrlMatcher('https://ghostery.com/products', urls)).toBeTruthy();
			expect(fuzzyUrlMatcher('https://ghostery.com/products1', urls)).toBeFalsy();
		});
	});
});
