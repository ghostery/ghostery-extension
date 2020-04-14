/**
 * Dispatcher.js Unit Tests
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

import dispatcher from '../../src/classes/Dispatcher';
import conf from '../../src/classes/Conf';

describe('dispatcher tests', () => {
	let spy = jest.spyOn(dispatcher, 'trigger');

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('dispatcher is triggered once for conf value not in SYNC_ARRAY', () => {
		conf.paused_blocking = true;
		return expect(spy).toHaveBeenCalledTimes(1);
	});

	test('clearAllMocks() works and callCount is reset to 0', () => {
		return expect(spy).toHaveBeenCalledTimes(0);
	});

	test('dispatcher is triggered twice for conf value in SYNC_ARRAY', () => {
		conf.alert_expanded = true;
		return expect(spy).toHaveBeenCalledTimes(2);
	});

	test('dispatcher is triggered with correct arguments', () => {
		conf.alert_expanded = true;
		return expect(spy).toHaveBeenCalledWith(`conf.save.alert_expanded`, true);
	});
});
