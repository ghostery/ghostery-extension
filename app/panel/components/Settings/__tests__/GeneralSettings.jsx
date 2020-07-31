/**
 * GeneralSettings Settings Test Component
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
import GeneralSettings from '../GeneralSettings';

jest.spyOn(GeneralSettings, 'getDbLastUpdated').mockImplementation(settingsData => settingsData.bugs_last_checked);

describe('app/panel/Settings/GeneralSettings.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('GeneralSettings is rendered correctly with falsy props', () => {
			const settingsData = {
				language: 'en',
				bugs_last_checked: 0,
				enable_autoupdate: false,
				show_tracker_urls: false,
				enable_click2play: false,
				enable_click2play_social: false,
				toggle_individual_trackers: false,
				ignore_first_party: false,
				block_by_default: false,
			};
			const actions = {
				updateDatabase: () => {},
			};

			const component = renderer.create(
				<GeneralSettings
					settingsData={settingsData}
					actions={actions}
					toggleCheckbox={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('GeneralSettings is rendered correctly with truthy props', () => {
			const settingsData = {
				language: 'en',
				bugs_last_checked: 1000000,
				enable_autoupdate: true,
				dbUpdateText: 'database-updated-text',
				show_tracker_urls: true,
				enable_click2play: true,
				enable_click2play_social: true,
				toggle_individual_trackers: true,
				ignore_first_party: true,
				block_by_default: true,
			};
			const actions = {
				updateDatabase: () => {},
			};

			const component = renderer.create(
				<GeneralSettings
					settingsData={settingsData}
					actions={actions}
					toggleCheckbox={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('GeneralSettings functions correctly', () => {
			const settingsData = {
				language: 'en',
				bugs_last_checked: 0,
				enable_autoupdate: false,
				show_tracker_urls: false,
				enable_click2play: false,
				enable_click2play_social: false,
				toggle_individual_trackers: false,
				ignore_first_party: false,
				block_by_default: false,
			};
			const actions = {
				updateDatabase: jest.fn(),
			};
			const toggleCheckbox = jest.fn();

			const component = mount(
				<GeneralSettings
					settingsData={settingsData}
					actions={actions}
					toggleCheckbox={toggleCheckbox}
				/>
			);

			expect(actions.updateDatabase.mock.calls.length).toBe(0);
			component.find('#update-now-span').simulate('click');
			expect(actions.updateDatabase.mock.calls.length).toBe(1);

			expect(toggleCheckbox.mock.calls.length).toBe(0);
			component.find('input[type="checkbox"]').at(0).simulate('click');
			component.find('#settings-allow-trackers').simulate('click');
			expect(toggleCheckbox.mock.calls.length).toBe(2);
		});
	});
});
