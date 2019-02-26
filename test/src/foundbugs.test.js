/**
 * /src/classes/FoundBugs.js Unit Tests
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

import _ from 'underscore';
import sinon from 'sinon';
import 'whatwg-fetch';
import bugDb from '../../src/classes/BugDb';
import conf from '../../src/classes/Conf';
import foundBugs from '../../src/classes/FoundBugs';

describe('src/classes/FoundBugs.js', () => {
	const url = 'https://getsatisfaction.com/ghostery',
		sources = [
			// one app, three patterns, four sources
			[2, "https://ssl.google-analytics.com/ga.js", true, 'SCRIPT'],
			[935, "https://ssl.google-analytics.com/ga.js", true, 'SCRIPT'],
			[1982, "https://ssl.google-analytics.com/ga.js", false, 'SCRIPT'],
			[1982, "https://ssl.google-analytics.com/ga.js", true, 'SCRIPT'],

			[719, "https://www.facebook.com/plugins/likebox.php?href=http://www.facebook.com/ghostery&width=294&colorscheme=light&connections=10&stream=false&header=false&height=277", true, 'IFRAME'],

			// one app, one pattern, two sources
			[1009, "https://d1ros97qkrwjf5.cloudfront.net/42/eum/rum.js", true, 'SCRIPT'],
			[1009, "https://d1ros97qkrwjf5.cloudfront.net/42/eum/rum.js", true, 'SCRIPT']
		];

	beforeAll(done => {
		// Fake the translation function for categories for bugDb.init()
		global.t = sinon.stub();
		global.t.withArgs([
			'site_analytics',
			'customer_interaction',
			'social_media'
		]).returns(true);

		// Stub the fetch function
		sinon.stub(global, 'fetch');

		// Stub chrome storage methods so that our prefsGet() calls work.
		chrome.storage.local.get.withArgs(['bugs']).yields({});
		chrome.storage.local.get.withArgs(['compatibility']).yields({});
		chrome.storage.local.get.withArgs(['tags']).yields({});
		chrome.storage.local.get.yields({ previousVersion: "8.0.8" });

		conf.init().then(() => {

			//Start init sequence for testing. Changing the fakeServer() response each time for the following fetchJson() call
			const bugsJson = JSON.stringify({
				"apps": {"13": {"name": "Google Analytics","cat": "site_analytics","tags": [48]},
				"464": {"name": "Facebook Social Plugins","cat": "social_media","tags": [39]},
				"614": {"name": "New Relic","cat": "site_analytics","tags": [48]}},
				"bugs": {"2": {"aid": 13},"935": {"aid": 13},"1982": {"aid": 13},"719": {"aid": 464},"1009": {"aid": 614}},
				"firstPartyExceptions": {'something': true},
				"patterns": {'something': true},
				"version":416
			});
			setFetchStubResponse(200, bugsJson);
			bugDb.init().then(() => {

				// Fill foundBugs with fake data.
				for (let i = 0; i < sources.length; i++) {
					const source = sources[i];
					foundBugs.update(url, source[0], source[1], source[2], source[3]);
				}

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

	describe('testing souce, patter, and app counts', () => {
		test('there should be seven sources', () => {
			const bugSources = _.flatten(_.pluck(foundBugs.getBugs(url), 'sources'));
			return expect(bugSources.length).toBe(7);
		});

		test('there should be five bugs', () => {
			return expect(_.size(foundBugs.getBugs(url))).toBe(5);
		});

		test('there should be three apps', () => {
			return expect(_.size(foundBugs.getApps(url))).toBe(3);
		});

		test('getAppsCount() should get three apps', () => {
			return expect(foundBugs.getAppsCount(url)).toBe(3);
		});

	});

	describe('testing clear() functionality', () => {
		test('getAppsCount() should find apps', () => {
			return expect(foundBugs.getAppsCount(url)).toBe(3);
		});

		test('getAppsCount() should find zero apps', () => {
			foundBugs.clear(url);
			return expect(foundBugs.getAppsCount(url)).toBe(0);
		});
	});

	describe('testing partial (incomplete) blocking', () => {
		let app, bug_ids, bugs, pattern, blocked, unblocked;

		beforeAll(() => {
			// Fill foundBugs with fake data again because we just cleared it
			for (let i = 0; i < sources.length; i++) {
				const source = sources[i];
				foundBugs.update(url, source[0], source[1], source[2], source[3]);
			}

			app = _.where(foundBugs.getApps(url), { id: 13 })[0];
			bug_ids = _.compact(_.map(bugDb.db.bugs, (bug, bug_id) => {
				return bug.aid == app.id ? bug_id : null;
			}));
			bugs = _.pick(foundBugs.getBugs(url), bug_ids);
			pattern = bugs['1982'];

			blocked = _.some(pattern.sources, src => src.blocked);
			unblocked = _.some(pattern.sources, src => !src.blocked);
		});

		test('some of the pattern sources are unblocked', () => {
			return expect(blocked).toBe(unblocked);
		});

		test('the pattern is unblocked overall', () => {
			return expect(pattern.blocked).toBeFalsy();
		});

		test('some of the app patterns are unblocked', () => {
			return expect(_.some(bugs, bug => bug.blocked)).toBe(_.some(bugs, bug => !bug.blocked));
		});

		test('the app is unblocked overall', () => {
			return expect(app.blocked).toBeFalsy();
		});

	});
});
