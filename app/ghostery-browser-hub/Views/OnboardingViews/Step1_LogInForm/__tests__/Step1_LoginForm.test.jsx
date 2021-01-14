/**
 * Create Account View Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router';
import Step1_LoginForm from '../Step1_LoginForm';

const noop = () => {};
describe('app/hub/Views/Step1_LoginForm component', () => {
	const initialState = {
		email: '',
		password: '',
		emailError: false,
		passwordError: false,
		handleSubmit: noop,
		handleInputChange: noop,
		handleForgotPassword: noop
	};
	describe('Snapshot tests with react-test-renderer', () => {
		test('Login Form view is rendered correctly', () => {

			const component = renderer.create(
				<MemoryRouter>
					<Step1_LoginForm {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const happyState = {
				...initialState,
				email: 'test@example.com',
				password: 'examplePassword',
				handleSubmit: jest.fn(),
			}

			const component = shallow(<Step1_LoginForm {...happyState} />);
			expect(happyState.handleSubmit.mock.calls.length).toBe(0);
			component.find('form').simulate('submit');
			expect(happyState.handleSubmit.mock.calls.length).toBe(1);
		});

		test('the sad path of the component with errors', () => {
			const sadState = {
				...initialState,
				email: 'test@example.com',
				password: 'examplePassword',
				emailError: true,
				passwordError: true,
				handleSubmit: jest.fn(),
			};

			const component = shallow(<Step1_LoginForm {...sadState} />);

			expect(sadState.handleSubmit.mock.calls.length).toBe(0);
			component.find('form').simulate('submit');
			expect(sadState.handleSubmit.mock.calls.length).toBe(1);
		})
	});
});
