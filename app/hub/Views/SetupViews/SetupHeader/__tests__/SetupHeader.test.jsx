/**
 * Setup Header Test Component
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
import SetupHeader from '../SetupHeader';

describe('app/hub/Views/SetupViews/SetupHeader component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('setup header is rendered correctly', () => {
			const initialState = {
				title: 'Test Title',
				titleImage: 'test-title-image',
			};

			const component = renderer.create(
				<SetupHeader {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				title: 'Test Title',
				titleImage: 'test-title-image',
			};

			const component = shallow(<SetupHeader {...initialState} />);
			expect(component.find('.SetupHeader').length).toBe(1);
			expect(component.find('.SetupHeader img').length).toBe(1);
			expect(component.find('.SetupHeader__title h3').length).toBe(1);
		});
	});
});
