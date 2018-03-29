/**
 * /src/utils/matcher.js Unit Tests
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import sinon from 'sinon';
import 'whatwg-fetch';
import bugDb from '../../src/classes/BugDb';
import conf from '../../src/classes/Conf';
import { isBug } from '../../src/utils/matcher';

describe('src/utils/matcher.js', () => {
	beforeAll(done => {
		// Stub the fetch function
		sinon.stub(global, 'fetch');

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
				}
			}
		});
		setFetchStubResponse(200, bugsJson);

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

	afterAll(() => {
		global.fetch.restore();
	});

	// Helper function to fake XHR requests
	function setFetchStubResponse (responseCode, responseData) {
		const res = new global.Response(responseData, {
			status: responseCode,
			headers: {
				'Content-type': 'application/json'
			}
		});
		global.fetch.returns(Promise.resolve(res));
	}

	describe('testing isBug()', () => {
		describe('testing basic pattern matching', () => {
			test('host+path tracker matching works', () => {
				return expect(isBug('https://apis.google.com/js/plusone.js', 'example.com')).toBe(1240);
			});

			test('path only tracker matching works', () => {
				return expect(isBug('https://apis.google.com/js/tracking.js', 'example.com')).toBe(13);
			});

			test('pattern matching is case insensitive', () => {
				return expect(isBug('https://APIS.Google.com/js/Tracking.js', 'example.com')).toBe(13);
			});
		});

		describe('testing isBug() first party exceptions for twitter', () => {
			const twitter_button = 'http://platform.twitter.com/widgets/';

			test('first confirm Twitter Button is a tracker', () => {
				return expect(isBug(twitter_button)).toBe(991);
			});

			test('host-only first-party exception', () => {
				return expect(isBug(twitter_button, 'https://twitter.com/ghostery')).toBeFalsy();
			});

			test('same exception on the same page URL as above, but with www', () => {
				return expect(isBug(twitter_button, 'https://www.twitter.com/ghostery')).toBeFalsy();
			});
		});

		describe('testing isBug() first party exceptions for google widgets', () => {
			const google_widgets = 'http://gmodules.com/blah';

			test('first confirm Google Widgets is a tracker', () => {
				return expect(isBug(google_widgets)).toBe(101);
			});

			test('host and exact path exception', () => {
				return expect(isBug(google_widgets, 'http://google.com/ig')).toBeFalsy();
			});
		});

		describe('testing isBug() first party exceptions for google plus one', () => {
			const google_plus_one = 'https://apis.google.com/js/plusone.js';

			test('first confirm Google +1 is a tracker', () => {
				return expect(isBug(google_plus_one)).toBe(1240);
			});

			test('host and fuzzy path exception', () => {
				return expect(isBug(google_plus_one, 'https://chrome.google.com/webstore/detail/ghostery/mlomiejdfkolichcflejclcbmpeaniij?hl=en')).toBeFalsy();
			});
		});
	});
});
