/**
 * OptIn Settings Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import OptIn from '../OptIn';

describe('app/panel/Settings/OptIn.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('OptIn is rendered correctly with falsy props', () => {
			const settingsData = {
				enable_metrics: false,
				enable_human_web: false,
			};

			const component = renderer.create(
				<OptIn
					settingsData={settingsData}
					toggleCheckbox={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('OptIn is rendered correctly with truthy props', () => {
			const settingsData = {
				enable_metrics: true,
				enable_human_web: true,
			};

			const component = renderer.create(
				<OptIn
					settingsData={settingsData}
					toggleCheckbox={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('OptIn functions correctly', () => {
			const settingsData = {
				enable_metrics: true,
				enable_human_web: true,
			};
			const toggleCheckbox = jest.fn();

			const component = mount(
				<OptIn
					settingsData={settingsData}
					toggleCheckbox={toggleCheckbox}
				/>
			);

			expect(toggleCheckbox.mock.calls.length).toBe(0);
			component.find('#settings-share-usage').simulate('click');
			component.find('#settings-share-human-web').simulate('click');
			expect(toggleCheckbox.mock.calls.length).toBe(2);
		});
	});
});
