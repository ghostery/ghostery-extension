/**
 * BlockingTab Test Component
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
import BlockingTab from '../BlockingTab';

describe('app/panel-android/components/content/BlockingTab.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('BlockingTab component as site with falsy props', () => {
			const component = renderer.create(
				<BlockingTab
					type="site"
					categories={[]}
					siteProps={{}}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTab component as global with falsy props', () => {
			const component = renderer.create(
				<BlockingTab
					type="global"
					categories={[]}
					siteProps={{}}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTab component as site with tracker falsy props', () => {
			const component = renderer.create(
				<BlockingTab
					type="site"
					categories={[
						{
							id: '1',
							name: 'Test1',
							num_total: 1,
							num_blocked: 1,
							trackers: [],
							img_name: 'category-image-url',
						},
					]}
					siteProps={{
						isTrusted: false,
						isRestricted: false,
						isPaused: false,
					}}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTab component as global with tracker truthy props', () => {
			const component = renderer.create(
				<BlockingTab
					type="global"
					categories={[
						{
							id: '1',
							name: 'Test1',
							num_total: 1,
							num_blocked: 1,
							trackers: [],
							img_name: 'category-image-url',
						},
						{
							id: '2',
							name: 'Test2',
							num_total: 5,
							num_blocked: 3,
							trackers: [],
							img_name: 'category-image-url-2',
						},
					]}
					siteProps={{
						isTrusted: true,
						isRestricted: false,
						isPaused: true,
					}}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
