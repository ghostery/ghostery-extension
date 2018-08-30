/**
 * Setup Blocking Dropdown Test Component
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
import SetupBlockingDropdown from '../SetupBlockingDropdown';

// Mock Necessary Imports
jest.mock('../../../../../panel/components/Settings/GlobalBlocking', () => props => <div>Mock Global Blocking</div>);

describe('app/hub/Views/SetupViews/SetupBlockingDropdown component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('setup blocking dropdown component is rendered correctly', () => {
			const initialState = {
				settingsData: {},
				actions: {
					filter: () => {},
					showNotification: () => {},
					toggleExpandAll: () => {},
					toggleExpandCategory: () => {},
					updateBlockAllTrackers: () => {},
					updateCategoryBlocked: () => {},
					updateSearchValue: () => {},
					updateTrackerBlocked: () => {},
				},
				handleDoneClick: () => {},
			};

			const component = renderer.create(
				<SetupBlockingDropdown {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				settingsData: {},
				actions: {
					filter: () => {},
					showNotification: () => {},
					toggleExpandAll: () => {},
					toggleExpandCategory: () => {},
					updateBlockAllTrackers: () => {},
					updateCategoryBlocked: () => {},
					updateSearchValue: () => {},
					updateTrackerBlocked: () => {},
				},
				handleDoneClick: jest.fn(),
			};

			const component = shallow(<SetupBlockingDropdown {...initialState} />);
			expect(component.find('.SetupBlockingDropdown').length).toBe(1);
			expect(component.find('.callout-container').length).toBe(0);
			expect(component.find('.callout.toast.success').length).toBe(0);
			expect(component.find('.callout-text').length).toBe(0);
			expect(component.find('.SetupBlockingDropdown__buttonContainer').length).toBe(1);

			component.setState({
				showToast: true,
				toastText: 'example text',
			});
			expect(component.find('.callout-container').length).toBe(1);
			expect(component.find('.callout.toast.success').length).toBe(1);
			expect(component.find('.callout-text').length).toBe(1);

			expect(initialState.handleDoneClick.mock.calls.length).toBe(0);
			component.find('.SetupBlockingDropdown__buttonContainer .button').simulate('click');
			expect(initialState.handleDoneClick.mock.calls.length).toBe(1);
		});
	});
});
