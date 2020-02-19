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
	test('isValidUrlWildcardOrRegex should return true with url entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);
		const input = 'ghostery.com';

		const fn = jest.spyOn(wrapper.instance(), 'isValidUrlWildcardOrRegex');
		when(fn)
			.calledWith(input)
			.mockReturnValue(true);
		const returnValue = wrapper.instance().isValidUrlWildcardOrRegex(input);
		expect(returnValue).toBe(true);
	});

	test('isValidUrlWildcardOrRegex should return true with wildcard URL entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);
		const input = 'developer.*.org';

		const fn = jest.spyOn(wrapper.instance(), 'isValidUrlWildcardOrRegex');
		when(fn)
			.calledWith(input)
			.mockReturnValue(true);
		const returnValue = wrapper.instance().isValidUrlWildcardOrRegex(input);
		expect(returnValue).toBe(true);
	});

	test('isValidUrlWildcardOrRegex should return true with regex URL entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);
		const input = '[ds]eveloper.mozilla.org';

		const fn = jest.spyOn(wrapper.instance(), 'isValidUrlWildcardOrRegex');
		when(fn)
			.calledWith(input)
			.mockReturnValue(true);
		const returnValue = wrapper.instance().isValidUrlWildcardOrRegex(input);
		expect(returnValue).toBe(true);
	});

	test('isValidUrlWildcardOrRegex should return false with unsafe regex entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);
		const input = '/^(\w+\s?)*$/';

		const fn = jest.spyOn(wrapper.instance(), 'isValidUrlWildcardOrRegex');
		when(fn)
			.calledWith(input)
			.mockReturnValue(false);
		const returnValue = wrapper.instance().isValidUrlWildcardOrRegex(input);
		expect(returnValue).toBe(false);
	});

	test('isValidUrlWildcardOrRegex should return false with incorrect regex format entered', () => {
		const wrapper = shallow(<TrustAndRestrict />);
		const input = '[.ghostery.com';

		const fn = jest.spyOn(wrapper.instance(), 'isValidUrlWildcardOrRegex');
		when(fn)
			.calledWith(input)
			.mockReturnValue(false);
		const returnValue = wrapper.instance().isValidUrlWildcardOrRegex(input);
		expect(returnValue).toBe(false);
	});
});
