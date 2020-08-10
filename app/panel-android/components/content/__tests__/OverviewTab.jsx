/**
 * OverviewTab Test Component
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
import OverviewTab from '../OverviewTab';

jest.mock('../../../../panel/components/Tooltip');

describe('app/panel-android/components/content/OverviewTab.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('OverviewTab component with falsy props and SiteNotScanned', () => {
			const panel = {
				enable_ad_block: false,
				enable_anti_tracking: false,
				enable_smart_block: false,
				smartBlock: { blocked: {}, unblocked: {} },
			};
			const summary = {
				categories: [],
				trackerCounts: {
					allowed: 0,
					blocked: 0,
				},
				sitePolicy: false,
				paused_blocking: false,
			};
			const blocking = {
				siteNotScanned: true,
				pageUrl: '',
			};
			const cliqzModuleData = {
				adBlock: { trackerCount: 0 },
				antiTracking: { trackerCount: 0 },
			};

			const component = renderer.create(
				<OverviewTab
					panel={panel}
					summary={summary}
					blocking={blocking}
					cliqzModuleData={cliqzModuleData}
					clickAccount={() => {}}
					clickSettings={() => {}}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('OverviewTab component with truthy props and no SiteNotScanned', () => {
			const panel = {
				enable_ad_block: true,
				enable_anti_tracking: true,
				enable_smart_block: true,
				smartBlock: { blocked: { 1: true }, unblocked: { 2: true, 3: true } },
			};
			const summary = {
				categories: ['ads', 'trackers'],
				trackerCounts: {
					allowed: 3,
					blocked: 5,
				},
				sitePolicy: false,
				paused_blocking: true,
			};
			const blocking = {
				siteNotScanned: false,
				pageUrl: 'http://example.com',
			};
			const cliqzModuleData = {
				adBlock: { trackerCount: 8 },
				antiTracking: { trackerCount: 13 },
			};

			const component = renderer.create(
				<OverviewTab
					panel={panel}
					summary={summary}
					blocking={blocking}
					cliqzModuleData={cliqzModuleData}
					clickAccount={() => {}}
					clickSettings={() => {}}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Functionality tests mounted with Enzyme', () => {
		test('OverviewTab component clicks work', () => {
			const panel = {
				enable_ad_block: false,
				enable_anti_tracking: false,
				enable_smart_block: false,
				smartBlock: { blocked: {}, unblocked: {} },
			};
			const summary = {
				categories: [],
				trackerCounts: {
					allowed: 0,
					blocked: 0,
				},
				sitePolicy: false,
				paused_blocking: false,
			};
			const blocking = {
				siteNotScanned: true,
				pageUrl: '',
			};
			const cliqzModuleData = {
				adBlock: { trackerCount: 0 },
				antiTracking: { trackerCount: 0 },
			};

			const clickAccount = jest.fn();
			const clickSettings = jest.fn();

			const component = mount(
				<OverviewTab
					panel={panel}
					summary={summary}
					blocking={blocking}
					cliqzModuleData={cliqzModuleData}
					clickAccount={clickAccount}
					clickSettings={clickSettings}
					callGlobalAction={() => {}}
				/>
			);
			expect(clickAccount.mock.calls.length).toBe(0);
			expect(clickSettings.mock.calls.length).toBe(0);
			expect(component.find('.OverviewTab__NavigationLink').length).toBe(2);

			component.find('.OverviewTab__NavigationLink').at(0).simulate('click');
			expect(clickAccount.mock.calls.length).toBe(1);
			expect(clickSettings.mock.calls.length).toBe(0);

			component.find('.OverviewTab__NavigationLink').at(1).simulate('click');
			expect(clickAccount.mock.calls.length).toBe(1);
			expect(clickSettings.mock.calls.length).toBe(1);
		});
	});
});
