/**
 * Home View Test Component
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
import { MemoryRouter } from 'react-router';
import HomeView from '../HomeView';

describe('app/hub/Views/HomeView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('home view is rendered correctly: all true', () => {
			const initialState = {
				justInstalled: true,
				setup_complete: true,
				tutorial_complete: true,
				enable_metrics: true,
				changeMetrics: () => {},
				account_text: 'test create account',
				account_link: '/test/create-account',
			};

			const component = renderer.create(
				<MemoryRouter>
					<HomeView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('home view is rendered correctly: all false', () => {
			const initialState = {
				justInstalled: false,
				setup_complete: false,
				tutorial_complete: false,
				enable_metrics: false,
				changeMetrics: () => {},
				account_text: 'test@example.com',
				account_link: '/test/user-profile',
			};

			const component = renderer.create(
				<MemoryRouter>
					<HomeView {...initialState} />
				</MemoryRouter>			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				justInstalled: true,
				setup_complete: false,
				tutorial_complete: false,
				enable_metrics: false,
				changeMetrics: jest.fn(),
				account_text: 'test username',
				account_link: '/test/url',
			};

			const component = shallow(<HomeView {...initialState} />);
			expect(component.find('.HomeView').length).toBe(1);
			expect(component.find('.button').length).toBe(3);
			expect(component.find('.HomeView__header').length).toBe(1);
			expect(component.find('.HomeView__subHeader').length).toBe(1);
			expect(component.find('.HomeView__supportContainer .clickable').length).toBe(1);

			expect(initialState.changeMetrics.mock.calls.length).toBe(0);
			component.find('.HomeView__supportContainer .clickable').simulate('click');
			expect(initialState.changeMetrics.mock.calls.length).toBe(1);

			expect(component.find('.HomeView__headerTagline').length).toBe(2);
			component.setProps({ justInstalled: false });
			expect(component.find('.HomeView__headerTagline').length).toBe(1);

			expect(component.find('.HomeView__featureButton.hollow').length).toBe(0);
			component.setProps({ tutorial_complete: true });
			expect(component.find('.HomeView__featureButton.hollow').length).toBe(1);

			component.setProps({ setup_complete: true });
			expect(component.find('.HomeView__featureButton.hollow').length).toBe(2);
		});
	});
});
