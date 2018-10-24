/**
 * Setup Anti-Suite View Test Component
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
import SetupAntiSuiteView from '../SetupAntiSuiteView';

describe('app/hub/Views/SetupViews/SetupAntiSuiteView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('setup anti-suite view is rendered correctly', () => {
			const initialState = {
				features: [
					{
						id: 'test-feature-1',
						name: 'Test Feature One',
						enabled: true,
						toggle: () => {},
						description: 'The first test feature',
					},
					{
						id: 'test-feature-2',
						name: 'Test Feature Two',
						enabled: false,
						toggle: () => {},
						description: 'The second test feature',
					},
				],
			};

			const component = renderer.create(
				<SetupAntiSuiteView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('More Snapshot tests with react-test-renderer, but for edge cases', () => {
		test('edge case where features is an empty array', () => {
			const initialState = {
				features: [],
			};

			const component = renderer.create(
				<SetupAntiSuiteView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				features: [
					{
						id: 'test-feature-1',
						name: 'Test Feature One',
						enabled: true,
						toggle: () => {},
						icon: '',
						description: 'The first test feature',
					},
					{
						id: 'test-feature-2',
						name: 'Test Feature Two',
						enabled: false,
						toggle: () => {},
						icon: '',
						description: 'The second test feature',
					},
				],
			};

			const component = shallow(<SetupAntiSuiteView {...initialState} />);
			expect(component.find('.row').length).toBe(3);
			expect(component.find('.test-feature-1').length).toBe(2);
			expect(component.find('.test-feature-2').length).toBe(2);
			expect(component.find('.test-feature-1.active').length).toBe(2);
			expect(component.find('.test-feature-2.active').length).toBe(0);
		});

		test('the non-happy path of the component', () => {
			const initialState = {
				features: [],
			};

			const component = shallow(<SetupAntiSuiteView {...initialState} />);
			expect(component.find('.row').length).toBe(1);
		});
	});
});
