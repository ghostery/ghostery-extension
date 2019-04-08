/**
 * SignedIn View Test Component
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
import SignedInView from '../SignedInView';

describe('app/hub/Views/SignedIn component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('signed in view is rendered correctly', () => {
			const initialState = {
				email: 'test@example.com',
			};

			const component = renderer.create(
				<MemoryRouter>
					<SignedInView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				email: 'test@example.com',
			};

			const component = shallow(<SignedInView {...initialState} />);
			expect(component.find('.SignedInView').length).toBe(1);
			expect(component.find('.SignedInView__headerImage').length).toBe(1);
		});
	});
});
