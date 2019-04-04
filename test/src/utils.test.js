/**
 * /src/utils/utils.js Unit Tests
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import sinon from 'sinon';
import 'whatwg-fetch';
import { getJson, defineLazyProperty } from '../../src/utils/utils';

describe('tests for getJson()', () => {
	// Setup getJson() by initializing fetch()
	beforeEach(() => {
		sinon.stub(global, 'fetch');
	});

	// Reset fetch()
	afterEach(() => {
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

	// Tests for getJson()
	test('returns a 200 response', () => {
		setFetchStubResponse(200, JSON.stringify({ hello: 'world' }));
		return expect(getJson('testurl')).resolves.toEqual({ hello: 'world' });
	});

	test('returns a 404 response', () => {
		setFetchStubResponse(404, 'Not Found');
		return expect(getJson('testurl')).rejects.toThrow(/404/);
	});
});

describe('tests for defineLazyProperty()', () => {
	let o = {},
		expensiveComputation = sinon.spy(() => 'hello'),
		shouldNeverGetCalled = sinon.spy(() => 'hello again');

	// Tests for defineLazyProperty()
	test('property function is lazy', () => {
		defineLazyProperty(o, 'lazy', expensiveComputation);
		return expect(expensiveComputation.callCount).toBe(0);
	});

	test('property function is defined', () => expect(o.lazy).toBe('hello'));
	test('property function was called', () => expect(expensiveComputation.callCount).toBe(1));

	test('property function is still defined', () => expect(o.lazy).toBe('hello'));
	test('repeated access do not call property function again', () => expect(expensiveComputation.callCount).toBe(1));

	test('reassignment works', () => {
		o.lazy = 'something else';
		expect(o.lazy).toBe('something else');
	});

	test('reassignment before access works', () => {
		defineLazyProperty(o, 'lazy2', shouldNeverGetCalled);
		o.lazy2 = 'nope';
		return expect(o.lazy2).toBe('nope');
	});
	test('property function is still lazy', () => expect(shouldNeverGetCalled.callCount).toBe(0));
});
