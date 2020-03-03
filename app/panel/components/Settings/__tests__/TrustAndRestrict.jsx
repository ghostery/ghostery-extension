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
import { shallow } from 'enzyme';
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
		const wrapper = shallow(<TrustAndRestrict />);
		let input = 'ghostery.com';

		let fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = 'localhost:3000';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);
	});

	test('isValidUrlorWildcard should return true with wildcard URL entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);

		let input = 'developer.*.org';
		let fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = '*.com';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = '*';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = 'developer.*';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);

		input = '****';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(true);
	});

	test('isValidUrlorWildcard should return false with wildcard URL entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);

		let input = '<script>*</script>';
		let fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '+$@@#$*';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = 'αράδειγμα.δοκιμ.*';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = 'SELECT * FROM USERS';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);
	});

	test('isValidUrlorWildcard should return false with regex entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);

		let input = ')';
		let fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '++';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '/foo(?)/';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);
	});

	test('isValidUrlorWildcard should return false with unsafe test entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);

		let input = '/^(\w+\s?)*$/';
		let fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		let returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '/^([0-9]+)*$/';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);

		input = '(x\w{1,10})+y';
		fn = jest.spyOn(wrapper.instance(), 'isValidUrlorWildcard');
		when(fn).calledWith(input);
		returnValue = wrapper.instance().isValidUrlorWildcard(input);
		expect(returnValue).toBe(false);
	});
});
