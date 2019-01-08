/**
 * Plus View Test Component
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
import PlusView from '../PlusView';

describe('app/hub/Views/PlusView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('plus view is rendered correctly when the user is not a plus', () => {
			const initialState = {
				isSignedIn: false,
				isPlus: false,
				onPlusClick: () => {},
			};

			const component = renderer.create(
				<PlusView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('plus view is rendered correctly when the user is signed in but not a plus', () => {
			const initialState = {
				isSignedIn: true,
				isPlus: false,
				onPlusClick: () => {},
			};

			const component = renderer.create(
				<PlusView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('plus view is rendered correctly when the user is a plus', () => {
			const initialState = {
				isSignedIn: true,
				isPlus: true,
				onPlusClick: () => {},
			};

			const component = renderer.create(
				<PlusView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				isSignedIn: false,
				isPlus: false,
				onPlusClick: jest.fn(),
			};

			const component = shallow(<PlusView {...initialState} />);
			expect(component.find('.PlusView').length).toBe(1);
			expect(component.find('.PlusView__headingImage').length).toBe(1);
			expect(component.find('.PlusView__headingTitle').length).toBe(5);
			expect(component.find('.PlusView__headingDescription').length).toBe(5);
			expect(component.find('.PlusView__headingCost').length).toBe(1);
			expect(component.find('.PlusView__perk').length).toBe(3);
			expect(component.find('.PlusView__perkIcon').length).toBe(3);
			expect(component.find('.PlusView__perkTitle').length).toBe(3);
			expect(component.find('.PlusView__perkDescription').length).toBe(3);
			expect(component.find('.PlusView__manifestoContainer').length).toBe(1);
			expect(component.find('.PlusView__manifestoBackground').length).toBe(1);
			expect(component.find('.PlusView__manifestoText').length).toBe(1);
			expect(component.find('.PlusView__featureImage').length).toBe(5);

			expect(initialState.onPlusClick.mock.calls.length).toBe(0);
			component.find('.PlusView__button').first().simulate('click');
			expect(initialState.onPlusClick.mock.calls.length).toBe(1);

			expect(component.find('.PlusView__button').first().props().href).toBe('https://signon.ghosterystage.com/subscribe')
			component.setProps({ isSignedIn: true });
			expect(component.find('.PlusView__button').first().props().href).toBe('https://account.ghosterystage.com/subscription?target=subscribe')

			expect(component.find('.PlusView__button').length).toBe(8);
			expect(component.find('.PlusView__button.disabled').length).toBe(0);
			component.setProps({ isPlus: true });
			expect(component.find('.PlusView__button').length).toBe(8);
			expect(component.find('.PlusView__button.disabled').length).toBe(8);
		});
	});
});
