/**
 * Toggle Switch Test Component
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
import ToggleSwitch from '../ToggleSwitch';

describe('app/shared-components/ToggleSwitch component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('toggle switch is rendered correctly when checked', () => {
			const initialState = {
				checked: true,
				locked: false,
				onChange: () => {},
			};

			const component = renderer.create(
				<ToggleSwitch {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('toggle switch is rendered correctly when not checked', () => {
			const initialState = {
				checked: false,
				onChange: () => {},
			};

			const component = renderer.create(
				<ToggleSwitch {...initialState} />
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

			const component = shallow(<ToggleSwitch {...initialState} />);
			expect(component.find('.ToggleSwitch').length).toBe(1);
			expect(component.find('.ToggleSwitch__bar').length).toBe(1);
			expect(component.find('.ToggleSwitch__circle').length).toBe(1);
			expect(component.find('.ToggleSwitch--active').length).toBe(0);

			expect(initialState.onChange.mock.calls.length).toBe(0);
			component.find('.ToggleSwitch').simulate('click');
			expect(initialState.onChange.mock.calls.length).toBe(1);

			expect(component.find('.ToggleSwitch--active').length).toBe(0);
			component.setProps({ checked: true });
			expect(component.find('.ToggleSwitch--active').length).toBe(1);
		});
	});
});
