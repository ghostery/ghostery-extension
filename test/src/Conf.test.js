/**
 * Conf.js Unit Tests
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

import conf from '../../src/classes/Conf';
import globals from '../../src/classes/Globals';

describe('pre-initialization tests', () => {
	test('pre-initialization global is set', () => {
		return expect(globals.INIT_COMPLETE).toBe(false);
	});

	test('pre-initialization language is set', () => {
		return expect(conf.language).toBe('en');
	});

	test('pre-initialization conf properties not set', () => {
		return expect(conf.alert_bubble_pos).toBeUndefined();
	});

	test('pre-initialization conf properties not set II', () => {
		return expect(conf.alert_bubble_timeout).toBeUndefined();
	});

	test('pre-initialization configuration values are saved temporarily', () => {
		conf.alert_bubble_pos = 'tl';
		return expect(globals.initProps.alert_bubble_pos).toBe('tl');
	});
});

describe('post-initialization tests', () => {
	beforeAll(done => {
		// Fake conf initialization
		globals.INIT_COMPLETE = true;

		// Prevents conf.init() from failing on ConfData.js line 59
		chrome.storage.local.get.yields({ previousVersion: "8.0.8" });
		conf.init().then(done).catch(err => console.log(err));
	});

	test('post-initialization language is still set', () => {
		return expect(conf.language).toBe('en');
	});

	test('post-initialization conf properties are now set to defaults', () => {
		return expect(conf.alert_bubble_timeout).toBe(15);
	});

	test('post-initialization conf properties are settable', () => {
		conf.alert_bubble_timeout = 30;
		return expect(conf.alert_bubble_timeout).toBe(30);
	});

	test('post-initialization conf properties are not saved on temp object', () => {
		conf.alert_bubble_timeout = 30;
		return expect(globals.initProps.alert_bubble_timeout).not.toBe(30);
	});

	test('chrome.storage.local.set gets called', () => {
		conf.alert_bubble_timeout = 30;
		return expect(chrome.storage.local.set.called).toBeTruthy();
	});

	test('chrome.storage.local.set is called with correct args', () => {
		conf.alert_bubble_timeout = 30;
		return expect(chrome.storage.local.set.calledWith({alert_bubble_timeout: 30})).toBeTruthy();
	});
});
