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
import Step1_CreateAccountView from '../Step1_CreateAccountView';

jest.mock('../../Step1_CreateAccountForm', () => {
  const CreateAccountForm = () => <div />;
  return CreateAccountForm;
});

jest.mock('../../Step1_LogInForm', () => {
  const LogInForm = () => <div />;
  return LogInForm;
});

const noop = () => {};
describe('app/hub/Views/Step1_CreateAccountView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('Create Account Form view is rendered correctly', () => {
			const initialState = {
				user: null,
				actions: {
					setSetupStep: noop
				}
			};

			const component = renderer.create(
				<MemoryRouter>
					<Step1_CreateAccountView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('Create Account Form view is rendered correctly when user is logged in', () => {
			const initialState = {
				user: {
					plusAccess: true
				},
				actions: {
					setSetupStep: noop
				}
			};

			const component = shallow(<Step1_CreateAccountView {...initialState} />);
			expect(component.find('.Step1_CreateAccountView__alreadySignedIn').length).toBe(1);
		});
	});
});
