/**
 * Toggle Checkbox Test Component
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
import ToggleCheckbox from '../ToggleCheckbox';

describe('app/shared-components/ToggleCheckbox component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('toggle checkbox is rendered correctly when checked', () => {
			const initialState = {
				checked: true,
				onChange: () => {},
			};

			const component = renderer.create(
				<ToggleCheckbox {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('toggle checkbox is rendered correctly when not checked', () => {
			const initialState = {
				checked: false,
				onChange: () => {},
			};

			const component = renderer.create(
				<ToggleCheckbox {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				checked: false,
				onChange: jest.fn(),
			};

			const component = shallow(<ToggleCheckbox {...initialState} />);
			expect(component.find('.ToggleCheckbox').length).toBe(1);
			expect(component.find('.ToggleCheckbox svg').length).toBe(1);
			expect(component.find('.ToggleCheckbox svg path').length).toBe(1);
			expect(component.find('.ToggleCheckbox.ToggleCheckbox--active').length).toBe(0);

			expect(initialState.onChange.mock.calls.length).toBe(0);
			component.find('.ToggleCheckbox').simulate('click');
			expect(initialState.onChange.mock.calls.length).toBe(1);

			expect(component.find('.ToggleCheckbox--active').length).toBe(0);
			component.setProps({ checked: true });
			expect(component.find('.ToggleCheckbox--active').length).toBe(1);
		});
	});
});
