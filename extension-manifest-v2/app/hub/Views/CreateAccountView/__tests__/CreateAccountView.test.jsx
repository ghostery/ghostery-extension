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
import CreateAccountView from '../CreateAccountView';

describe('app/hub/Views/CreateAccount component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('create account view is rendered correctly', () => {
			const initialState = {
				email: 'test@example.com',
				emailError: false,
				confirmEmail: 'test@example.com',
				confirmEmailError: false,
				firstName: 'First',
				lastName: 'Last',
				legalConsentChecked: true,
				password: '',
				passwordInvalidError: false,
				passwordLengthError: false,
				promotionsChecked: false,
				handleInputChange: () => {},
				handleLegalConsentCheckboxChange: () => {},
				handlePromotionsCheckboxChange: () => {},
				handleSubmit: () => {},
			};

			const component = renderer.create(
				<MemoryRouter>
					<CreateAccountView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('create account view is rendered correctly with empty inputs and errors', () => {
			const initialState = {
				email: '',
				emailError: true,
				confirmEmail: '',
				confirmEmailError: true,
				firstName: '',
				lastName: '',
				legalConsentChecked: false,
				password: '',
				passwordInvalidError: true,
				passwordLengthError: true,
				promotionsChecked: true,
				handleInputChange: () => {},
				handleLegalConsentCheckboxChange: () => {},
				handlePromotionsCheckboxChange: () => {},
				handleSubmit: () => {},
			};

			const component = renderer.create(
				<MemoryRouter>
					<CreateAccountView {...initialState} />
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
				legalConsentChecked: true,
				password: '',
				passwordInvalidError: false,
				passwordLengthError: false,
				promotionsChecked: false,
				handleInputChange: () => {},
				handleLegalConsentCheckboxChange: () => {},
				handlePromotionsCheckboxChange: () => {},
				handleSubmit: jest.fn(),
			};

			const component = shallow(<CreateAccountView {...initialState} />);
			expect(component.find('.CreateAccountView').length).toBe(1);
			expect(component.find('.CreateAccountView__headerImage').length).toBe(1);
			expect(component.find('.CreateAccountView__inputBox').length).toBe(5);
			expect(component.find('button[type="submit"]').length).toBe(1);

			expect(component.find('.CreateAccountView__inputError').length).toBe(0);
			component.setProps({ emailError: true });
			expect(component.find('.CreateAccountView__inputError').length).toBe(1);

			expect(initialState.handleSubmit.mock.calls.length).toBe(0);
			component.find('form').simulate('submit');
			expect(initialState.handleSubmit.mock.calls.length).toBe(1);
		});
	});
});
