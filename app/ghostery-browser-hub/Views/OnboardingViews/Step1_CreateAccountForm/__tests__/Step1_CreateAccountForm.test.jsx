/**
 * Create Account View Test Component
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
import { Step1_CreateAccountForm } from '../Step1_CreateAccountForm';


jest.mock('../../../../../shared-components/ToggleCheckbox', () => {
  const ToggleCheckbox = () => <div />;
  return ToggleCheckbox;
});

const noop = () => {};
describe('app/hub/Views/Step1_CreateAccountForm component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('create account view is rendered correctly', () => {
			const initialState = {
				email: 'test@example.com',
				emailError: false,
				confirmEmail: 'test@example.com',
				confirmEmailError: false,
				firstName: 'First',
				lastName: 'Last',
				isUpdatesChecked: true,
				legalConsentChecked: true,
				password: '',
				confirmPassword: '',
				passwordInvalidError: false,
				passwordLengthError: false,
				handleInputChange: noop,
				handleUpdatesCheckboxChange: noop,
				handleLegalConsentCheckboxChange: noop,
				handleSubmit: jest.fn(),
			};

			const component = renderer.create(
				<MemoryRouter>
					<Step1_CreateAccountForm {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				email: 'test@example.com',
				emailError: false,
				confirmEmail: 'test@example.com',
				confirmEmailError: false,
				firstName: 'First',
				lastName: 'Last',
				isUpdatesChecked: true,
				legalConsentChecked: true,
				password: '',
				confirmPassword: '',
				passwordInvalidError: false,
				passwordLengthError: false,
				handleInputChange: noop,
				handleUpdatesCheckboxChange: noop,
				handleLegalConsentCheckboxChange: noop,
				handleSubmit: jest.fn(),
			};

			const component = shallow(<Step1_CreateAccountForm {...initialState} />);

			expect(component.find('.Step1_CreateAccountForm__inputBox').length).toBe(6);
			expect(component.find('.Step1_CreateAccountForm__ctaButton').length).toBe(1);

			expect(initialState.handleSubmit.mock.calls.length).toBe(0);
			component.find('form').simulate('submit');
			expect(initialState.handleSubmit.mock.calls.length).toBe(1);
		});

		test('the sad path of the component with errors', () => {
			const initialState = {
				email: 'test@example.com',
				emailError: true,
				confirmEmail: 'badConfirmEmail@example.com',
				confirmEmailError: true,
				firstName: 'First',
				lastName: 'Last',
				isUpdatesChecked: false,
				legalConsentChecked: false,
				password: 'password',
				confirmPassword: 'badPassword',
				passwordInvalidError: true,
				passwordLengthError: true,
				handleInputChange: noop,
				handleUpdatesCheckboxChange: noop,
				handleLegalConsentCheckboxChange: noop,
				handleSubmit: jest.fn(),
			};

			const component = shallow(<Step1_CreateAccountForm {...initialState} />);
			component.find('form').simulate('submit');
			expect(component.find('.Step1_CreateAccountForm__inputErrorContainer').length).toBe(4);
			expect(component).toMatchSnapshot();

		});
	});
});
