/**
 * /src/classes/Conf.js Unit Tests
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
import chrome from 'sinon-chrome';
import conf from '../../src/classes/Conf';
import globals from '../../src/classes/Globals';
import dispatcher from '../../src/classes/Dispatcher';

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

	test('pre-initialization configuration values are saved temporarally', () => {
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

describe('dispatcher tests', () => {
	let spy = sinon.spy(dispatcher, 'trigger');

	beforeEach(() => {
		spy.resetHistory();
	});

	test('spy.resetHistory() works and callCount is reset to 0', () => {
		return expect(spy.callCount).toBe(0);
	});

	test('dispatcher is triggered once for conf value not in SYNC_ARRAY', () => {
		conf.paused_blocking = true;
		return expect(spy.calledOnce).toBeTruthy();
	});

	test('dispatcher is triggered twice for conf value in SYNC_ARRAY', () => {
		conf.alert_expanded = true;
		return expect(spy.calledTwice).toBeTruthy();
	});

	test('dispatcher is triggered with correct arguments', () => {
		conf.alert_expanded = true;
		return expect(spy.calledWith(`conf.save.alert_expanded`, true)).toBeTruthy();
	});

});
