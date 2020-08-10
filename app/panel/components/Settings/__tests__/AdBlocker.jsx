/**
 * AdBlocker Settings Test Component
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
import AdBlocker from '../AdBlocker';

describe('app/panel/Settings/AdBlocker.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('AdBlocker is rendered correctly with AdOnly checked', () => {
			const settingsData = {
				cliqz_adb_mode: 0,
			};
			const actions = {
				selectItem: () => {},
			};

			const component = renderer.create(
				<AdBlocker
					settingsData={settingsData}
					actions={actions}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('AdBlocker is rendered correctly with Ads & Trackers checked', () => {
			const settingsData = {
				cliqz_adb_mode: 1,
			};
			const actions = {
				selectItem: () => {},
			};

			const component = renderer.create(
				<AdBlocker
					settingsData={settingsData}
					actions={actions}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('AdBlocker is rendered correctly with Ads, Trackers, & Annoyances checked', () => {
			const settingsData = {
				cliqz_adb_mode: 2,
			};
			const actions = {
				selectItem: () => {},
			};

			const component = renderer.create(
				<AdBlocker
					settingsData={settingsData}
					actions={actions}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('AdBlocker functions correctly', () => {
			const settingsData = {
				cliqz_adb_mode: 0,
			};
			const actions = {
				selectItem: jest.fn(),
			};

			const component = mount(
				<AdBlocker
					settingsData={settingsData}
					actions={actions}
				/>
			);

			expect(actions.selectItem.mock.calls.length).toBe(0);
			component.find('.RadioButtonGroup__label').at(0).simulate('click');
			component.find('.RadioButton__outerCircle').at(2).simulate('click');
			expect(actions.selectItem.mock.calls.length).toBe(2);
		});
	});
});
