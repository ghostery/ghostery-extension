/**
 * /src/utils/common.js Unit Tests
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

import { prefsSet, prefsGet } from '../../src/utils/common';

describe('tests for prefsGet()', () => {
	// Setup prefsGet() by initializing chrome.storage.local.get()
	beforeAll(() => {
		chrome.storage.local.get.yields({
			previousVersion: "8.0.8",
			cmp_version: 183,
			install_date: "2018-02-24",
			show_cmp: true
		});
	});

	// Tests for prefsGet()
	// ToDo: Unit test for chrome.runtime.lastError = true
	test('gets single value correctly', () => {
		expect.assertions(1);
		return expect(prefsGet('previousVersion')).resolves.toBe('8.0.8');
	});
	test('gets multiple values correctly', () => {
		expect.assertions(1);
		return expect(prefsGet('cmp_version', 'show_cmp')).resolves.toEqual({
			cmp_version: 183,
			show_cmp: true
		});
	});
	test('gets all values correctly', () => {
		expect.assertions(1);
		return expect(prefsGet()).resolves.toEqual({
			previousVersion: "8.0.8",
			cmp_version: 183,
			install_date: "2018-02-24",
			show_cmp: true
		})
	});
});

// ToDo: Unit tests for other common.js functions:
// log, pref, prefsSet, hashCode, objectEntries, decodeJwt
