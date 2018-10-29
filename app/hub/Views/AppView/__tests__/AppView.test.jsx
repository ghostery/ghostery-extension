/**
 * App View Test Component
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
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router';
import AppView from '../AppView';

// Mock Necessary Imports
jest.mock('../../SideNavigationView', () => props => <div>Mock Side Navigation</div>);

describe('app/hub/Views/AppView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('app view is rendered correctly', () => {
			const initialState = {
				app: {
					toastMessage: 'Example toast message',
					toastClass: 'toast-class',
				},
				exitToast: () => {},
			};

			const component = renderer.create(
				<MemoryRouter>
					<AppView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				app: {
					toastMessage: '',
					toastClass: 'toast-class',
				},
				exitToast: jest.fn(),
			};

			const component = mount(<AppView {...initialState} />);
			expect(component.find('.App').length).toBe(1);
			expect(component.find('.App__mainContent').length).toBe(1);

			expect(component.find('.toast-class').length).toBe(0);
		});
	});
});
