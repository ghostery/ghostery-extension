/**
 * Utils.js Unit Tests
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

import { getJson, defineLazyProperty, processFpeUrl, semverCompare } from '../../src/utils/utils';

describe('tests for getJson()', () => {
	// Tests for getJson()
	test('returns a 200 response', () => {
		global.mockFetchResponse(200, JSON.stringify({ hello: 'world' }));
		expect(getJson('https://www.ghostery.com/')).resolves.toEqual({ hello: 'world' });
	});

	test('returns a 404 response', () => {
		global.mockFetchResponse(404, 'Not Found');
		expect(getJson('https://www.ghostery.com/')).rejects.toThrow(/404/);
	});
});

describe('tests for defineLazyProperty()', () => {
	const testObject = {
		expensiveComputation() {
			return 'hello';
		},
		shouldNeverGetCalled() {
			return 'hello again';
		}
	};
	const expensiveSpy = jest.spyOn(testObject, 'expensiveComputation');
	const neverCalledSpy = jest.spyOn(testObject, 'shouldNeverGetCalled');

	test('property function is lazy', () => {
		defineLazyProperty(testObject, 'lazy', testObject.expensiveComputation);
		expect(expensiveSpy).not.toHaveBeenCalled();
	});

	test('property function is defined', () => expect(testObject.lazy).toBe('hello'));
	test('property function was called', () => expect(expensiveSpy).toHaveBeenCalledTimes(1));

	test('property function is still defined', () => expect(testObject.lazy).toBe('hello'));
	test('repeated access do not call property function again', () => expect(expensiveSpy).toHaveBeenCalledTimes(1));

	test('reassignment works', () => {
		testObject.lazy = 'something else';
		expect(testObject.lazy).toBe('something else');
	});

	test('reassignment before access works', () => {
		defineLazyProperty(testObject, 'lazy2', testObject.shouldNeverGetCalled);
		testObject.lazy2 = 'nope';
		expect(testObject.lazy2).toBe('nope');
	});
	test('property function is still lazy', () => expect(neverCalledSpy).not.toHaveBeenCalled());
});

describe('test for processFpeUrl()', () => {
	test('host only', () => {
		expect(processFpeUrl('ghostery.com')).toMatchObject({host: 'ghostery.com', path: ''});
	});
	test('host and path', () => {
		expect(processFpeUrl('ghostery.com/products')).toMatchObject({host: 'ghostery.com', path: 'products'});
	});
});

describe('tests for semverCompare()', () => {
	const versions = [
		'1.2.1',
		'3.12.6',
		'3.2.0',
		'1.4.11',
		'0.5.7',
		'8.1.3',
		'2.1.1',
		'11.4.1',
		'10.7.4',
	];

	test('Sort version history', () => {
		expect(versions.sort(semverCompare)).toEqual([
			'0.5.7',
			'1.2.1',
			'1.4.11',
			'2.1.1',
			'3.2.0',
			'3.12.6',
			'8.1.3',
			'10.7.4',
			'11.4.1'
		]);
	});

	test('Version comparisons', () => {
		// Less Than
		expect(semverCompare("7.7.10", "8.7.10")).toBe(-1);
		expect(semverCompare("8.6.10", "8.7.10")).toBe(-1);
		expect(semverCompare("8.7.1", "8.7.10")).toBe(-1);
		expect(semverCompare("7.100.100", "8.7.10")).toBe(-1);
		expect(semverCompare("8.3.3", "8.4.2")).toBe(-1);
		expect(semverCompare("8.3.3.3e794d0", "8.4.2")).toBe(-1);
		expect(semverCompare("8.3.3.3e794d0", "8.4.2.1d945f0")).toBe(-1);
		expect(semverCompare("8.7", "8.7.0")).toBe(-1);
		expect(semverCompare("8.7", "8.8.0")).toBe(-1);

		// Greater Than
		expect(semverCompare("8.7.10", "7.7.10")).toBe(1);
		expect(semverCompare("8.7.10", "8.6.10")).toBe(1);
		expect(semverCompare("8.7.10", "8.7.1")).toBe(1);
		expect(semverCompare("8.7.10", "7.100.100")).toBe(1);
		expect(semverCompare("8.4.2", "8.3.3")).toBe(1);
		expect(semverCompare("8.4.2", "8.3.3.3e794d0")).toBe(1);
		expect(semverCompare("8.4.2.1d945f0", "8.3.3.3e794d0")).toBe(1);
		expect(semverCompare("8.7.0", "8.7")).toBe(1);
		expect(semverCompare("8.8.0", "8.7")).toBe(1);

		// Equal To
		expect(semverCompare("8.7.10", "8.7.10")).toBe(0);
		expect(semverCompare("8.7", "8.7")).toBe(0);
	});
});
