/**
 * Tutorial View Test Component
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
import TutorialView from '../TutorialView';

// Mock Necessary Imports
jest.mock('../../TutorialViews/TutorialNavigation', () => props => <div>Mock Tutorial Navigation</div>);

describe('app/hub/Views/TutorialView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('tutorial view is rendered correctly', () => {
			const initialState = {
				steps: [],
				sendMountActions: true,
			};

			const component = renderer.create(
				<MemoryRouter>
					<TutorialView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				steps: [],
				sendMountActions: true,
			};

			const component = shallow(<TutorialView {...initialState} />);
			expect(component.find('.TutorialView--paddingTopLarge').length).toBe(1);

			expect(component.find('[totalSteps=0]').length).toBe(1);
			expect(component.find('[totalSteps=2]').length).toBe(0);
			component.setProps({ steps: [
				{
					index: 0,
					path: '',
					bodyComponent: () => {},
				},
				{
					index: 1,
					path: '',
					bodyComponent: () => {},
				},
			] });
			expect(component.find('[totalSteps=0]').length).toBe(0);
			expect(component.find('[totalSteps=2]').length).toBe(1);
		});
	});
});
