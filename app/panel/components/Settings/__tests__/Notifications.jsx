/**
 * Notifications Settings Test Component
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
import Notifications from '../Notifications';

describe('app/panel/Settings/Notifications.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('Notifications is rendered correctly with falsy props', () => {
			const settingsData = {
				show_cmp: false,
				notify_upgrade_updates: false,
				notify_promotions: false,
				notify_library_updates: false,
				reload_banner_status: false,
				trackers_banner_status: false,
				show_badge: false,
			};

			const component = renderer.create(
				<Notifications
					settingsData={settingsData}
					toggleCheckbox={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('Notifications is rendered correctly with truthy props', () => {
			const settingsData = {
				show_cmp: true,
				notify_upgrade_updates: true,
				notify_promotions: true,
				notify_library_updates: true,
				reload_banner_status: true,
				trackers_banner_status: true,
				show_badge: true,
			};

			const component = renderer.create(
				<Notifications
					settingsData={settingsData}
					toggleCheckbox={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('Notifications functions correctly', () => {
			const settingsData = {
				show_cmp: false,
				notify_upgrade_updates: false,
				notify_promotions: false,
				notify_library_updates: false,
				reload_banner_status: false,
				trackers_banner_status: false,
				show_badge: false,
			};
			const toggleCheckbox = jest.fn();

			const component = mount(
				<Notifications
					settingsData={settingsData}
					toggleCheckbox={toggleCheckbox}
				/>
			);

			expect(toggleCheckbox.mock.calls.length).toBe(0);
			component.find('#settings-announcements').simulate('click');
			component.find('#settings-new-features').simulate('click');
			component.find('#settings-new-promotions').simulate('click');
			component.find('#settings-new-trackers').simulate('click');
			component.find('#settings-show-reload-banner').simulate('click');
			component.find('#settings-show-trackers-banner').simulate('click');
			component.find('#settings-show-count-badge').simulate('click');
			expect(toggleCheckbox.mock.calls.length).toBe(7);
		});
	});
});
