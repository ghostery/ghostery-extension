/**
 * Supporter View Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import SupporterView from '../SupporterView';

describe('app/hub/Views/SupporterView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('supporter view is rendered correctly when the user is not a supporter', () => {
			const initialState = {
				isSignedIn: false,
				isSupporter: false,
				onSupporterClick: () => {},
			};

			const component = renderer.create(
				<SupporterView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('supporter view is rendered correctly when the user is signed in but not a supporter', () => {
			const initialState = {
				isSignedIn: true,
				isSupporter: false,
				onSupporterClick: () => {},
			};

			const component = renderer.create(
				<SupporterView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('supporter view is rendered correctly when the user is a supporter', () => {
			const initialState = {
				isSignedIn: true,
				isSupporter: true,
				onSupporterClick: () => {},
			};

			const component = renderer.create(
				<SupporterView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				isSignedIn: false,
				isSupporter: false,
				onSupporterClick: jest.fn(),
			};

			const component = shallow(<SupporterView {...initialState} />);
			expect(component.find('.SupporterView').length).toBe(1);
			expect(component.find('.SupporterView__headingImage').length).toBe(1);
			expect(component.find('.SupporterView__headingTitle').length).toBe(5);
			expect(component.find('.SupporterView__headingDescription').length).toBe(5);
			expect(component.find('.SupporterView__headingCost').length).toBe(1);
			expect(component.find('.SupporterView__perk').length).toBe(3);
			expect(component.find('.SupporterView__perkIcon').length).toBe(3);
			expect(component.find('.SupporterView__perkTitle').length).toBe(3);
			expect(component.find('.SupporterView__perkDescription').length).toBe(3);
			expect(component.find('.SupporterView__manifestoContainer').length).toBe(1);
			expect(component.find('.SupporterView__manifestoBackground').length).toBe(1);
			expect(component.find('.SupporterView__manifestoText').length).toBe(1);
			expect(component.find('.SupporterView__featureImage').length).toBe(5);

			expect(initialState.onSupporterClick.mock.calls.length).toBe(0);
			component.find('.SupporterView__button').first().simulate('click');
			expect(initialState.onSupporterClick.mock.calls.length).toBe(1);

			expect(component.find('.SupporterView__button').first().props().href).toBe('https://signon.ghosterystage.com/subscribe')
			component.setProps({ isSignedIn: true });
			expect(component.find('.SupporterView__button').first().props().href).toBe('https://account.ghosterystage.com/subscription?target=subscribe')

			expect(component.find('.SupporterView__button').length).toBe(8);
			expect(component.find('.SupporterView__button.disabled').length).toBe(0);
			component.setProps({ isSupporter: true });
			expect(component.find('.SupporterView__button').length).toBe(8);
			expect(component.find('.SupporterView__button.disabled').length).toBe(8);
		});
	});
});
