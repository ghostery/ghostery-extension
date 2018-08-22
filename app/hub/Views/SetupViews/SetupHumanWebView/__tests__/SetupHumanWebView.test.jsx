/**
 * Setup Human Web View Test Component
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
import SetupHumanWebView from '../SetupHumanWebView';

describe('app/hub/Views/SetupViews/SetupHumanWebView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('setup human web view is rendered correctly', () => {
			const initialState = {
				enableHumanWeb: true,
				changeHumanWeb: () => {},
			};

			const component = renderer.create(
				<SetupHumanWebView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				enableHumanWeb: true,
				changeHumanWeb: () => {},
			};

			const component = shallow(<SetupHumanWebView {...initialState} />);
			expect(component.find('.SetupHumanWeb').length).toBe(1);
			expect(component.find('.SetupHumanWeb__label').length).toBe(1);
		});
	});
});
