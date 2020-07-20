/**
 * Rewards Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { when } from 'jest-when';
import TrustAndRestrict from '../TrustAndRestrict';

describe('app/panel/components/Settings/TrustAndRestrict', () => {
	describe('Snapshot test with react-test-renderer', () => {
		test('Testing TrustAndRestrict is rendering', () => {
			const wrapper = renderer.create(
				<TrustAndRestrict />
			).toJSON();
			expect(wrapper).toMatchSnapshot();
		});
	});
});

describe('app/panel/components/Settings/', () => {
	test('isValidUrlorWildcard should return true with url entered', () => {
		let input = 'ghostery.com';
		let fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = 'localhost:3000';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);
	});

	test('isValidUrlorWildcard should return true with wildcard URL entered', () => {
		let input = 'developer.*.org';
		let fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = '*.com';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = '*';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = 'developer.*';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = '****';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);
	});

	test('isValidUrlorWildcard should return false with wildcard URL entered', () => {
		let input = '<script>*</script>';
		let fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '+$@@#$*';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = 'αράδειγμα.δοκιμ.*';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = 'SELECT * FROM USERS';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);
	});

	test('isValidUrlorWildcard should return false with regex entered', () => {
		let input = ')';
		let fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '++';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '/foo(?)/';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);
	});

	test('isValidUrlorWildcard should return false with unsafe test entered', () => {
		let input = '/^(\w+\s?)*$/'; // eslint-disable-line no-useless-escape
		let fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '/^([0-9]+)*$/';
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '(x\w{1,10})+y'; // eslint-disable-line no-useless-escape
		fn = jest.spyOn(TrustAndRestrict, 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = TrustAndRestrict.isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);
	});
});
