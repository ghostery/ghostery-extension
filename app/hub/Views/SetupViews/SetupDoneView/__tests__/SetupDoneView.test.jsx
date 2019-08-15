/**
 * Setup Done View Test Component
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
import { MemoryRouter } from 'react-router';
import SetupDoneView from '../SetupDoneView';

describe('app/hub/Views/SetupViews/SetupDoneView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('setup human web view is rendered correctly', () => {
			const initialState = {
				features: [
					{
						id: 'feature-1',
						title: 'Feature 1 Title',
						description: 'feature 1 description',
						buttonText: 'feature 1 button text',
						buttonHref: '/feature/1',
					},
					{
						id: 'feature-2',
						title: 'Feature 2 Title',
						description: 'feature 2 description',
						buttonText: 'feature 2 button text',
						buttonHref: '/feature/2',
					},
					{
						id: 'feature-3',
						title: 'Feature 3 Title',
						description: 'feature 3 description',
						buttonText: 'feature 3 button text',
						buttonHref: '/feature/3',
					},
				],
			};

			const component = renderer.create(
				<MemoryRouter>
					<SetupDoneView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				features: [
					{
						id: 'feature-1',
						title: 'Feature 1 Title',
						description: 'feature 1 description',
						buttonText: 'feature 1 button text',
						buttonHref: '/feature/1',
					},
					{
						id: 'feature-2',
						title: 'Feature 2 Title',
						description: 'feature 2 description',
						buttonText: 'feature 2 button text',
						buttonHref: '/feature/2',
					},
					{
						id: 'feature-3',
						title: 'Feature 3 Title',
						description: 'feature 3 description',
						buttonText: 'feature 3 button text',
						buttonHref: '/feature/3',
					},
				],
			};

			const component = shallow(<SetupDoneView {...initialState} />);
			expect(component.find('.SetupDone__feature').length).toBe(3);
		});
	});
});
