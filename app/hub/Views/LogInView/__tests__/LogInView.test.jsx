/**
 * LogIn View Test Component
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
import LogInView from '../LogInView';

describe('app/hub/Views/LogIn component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('login view is rendered correctly', () => {
			const initialState = {
				email: 'test@example.com',
				password: '',
				emailError: false,
				passwordError: false,
				handleSubmit: () => {},
				handleInputChange: () => {},
			};

			const component = renderer.create(
				<MemoryRouter>
					<LogInView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				email: 'test@example.com',
				password: '',
				emailError: false,
				passwordError: false,
				handleSubmit: () => {},
				handleInputChange: () => {},
			};

			const component = shallow(<LogInView {...initialState} />);
			expect(component.find('.LogInView').length).toBe(1);
			expect(component.find('.LogInView__inputBox').length).toBe(2);
			expect(component.find('button[type="submit"]').length).toBe(1);

			expect(component.find('.LogInView__inputError').length).toBe(0);
			component.setProps({ emailError: true });
			expect(component.find('.LogInView__inputError').length).toBe(1);
		});
	});
});
