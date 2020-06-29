/**
 * BlockingCategories Test Component
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
import { shallow } from 'enzyme';
import BlockingCategories from '../BlockingCategories';

describe('app/panel-android/components/content/BlockingCategories.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('BlockingCategories component as site', () => {
			const categories = [
				{
					id: 'cat-1',
					name: 'Category-1',
					num_total: 1,
					num_blocked: 1,
					trackers: [
						{
							id: 1,
							name: 'Tracker 1',
							ss_allowed: false,
							ss_blocked: false,
							blocked: true,
						},
					],
					img_name: 'category-1-image-url',
				},
				{
					id: 'cat-2',
					name: 'Category-2',
					num_total: 5,
					num_blocked: 3,
					trackers: [
						{
							id: 2,
							name: 'Tracker 2',
							ss_allowed: false,
							ss_blocked: false,
							blocked: true,
						},
						{
							id: 3,
							name: 'Tracker 3',
							ss_allowed: false,
							ss_blocked: false,
							blocked: true,
						},
						{
							id: 4,
							name: 'Tracker 4',
							ss_allowed: false,
							ss_blocked: false,
							blocked: true,
						},
						{
							id: 5,
							name: 'Tracker 5',
							ss_allowed: false,
							ss_blocked: false,
							blocked: false,
						},
						{
							id: 6,
							name: 'Tracker 6',
							ss_allowed: false,
							ss_blocked: false,
							blocked: false,
						},
					],
					img_name: 'category-2-image-url',
				},
			];
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategories
					type="site"
					categories={categories}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingCategories component as global', () => {
			const categories = [
				{
					id: 'cat-1',
					name: 'Category-1',
					num_total: 1,
					num_blocked: 1,
					trackers: [
						{
							id: '1',
							name: 'Tracker 1',
							blocked: true,
						},
					],
					img_name: 'category-1-image-url',
				},
				{
					id: 'cat-2',
					name: 'Category-2',
					num_total: 5,
					num_blocked: 3,
					trackers: [
						{
							id: '2',
							name: 'Tracker 2',
							blocked: true,
						},
						{
							id: '3',
							name: 'Tracker 3',
							blocked: true,
						},
						{
							id: '4',
							name: 'Tracker 4',
							blocked: true,
						},
						{
							id: '5',
							name: 'Tracker 5',
							blocked: false,
						},
						{
							id: '6',
							name: 'Tracker 6',
							blocked: false,
						},
					],
					img_name: 'category-2-image-url',
				},
			];
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategories
					type="global"
					categories={categories}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Functionality tests shallow mounted with Enzyme', () => {
		test('BlockingCategories component toggle category clicks work', () => {
			const categories = [
				{
					id: 'cat-1',
					name: 'Category-1',
					num_total: 1,
					num_blocked: 1,
					trackers: [
						{
							id: '1',
							name: 'Tracker 1',
							blocked: true,
						},
					],
					img_name: 'category-1-image-url',
				},
				{
					id: 'cat-2',
					name: 'Category-2',
					num_total: 5,
					num_blocked: 3,
					trackers: [
						{
							id: '2',
							name: 'Tracker 2',
							blocked: true,
						},
						{
							id: '3',
							name: 'Tracker 3',
							blocked: true,
						},
						{
							id: '4',
							name: 'Tracker 4',
							blocked: true,
						},
						{
							id: '5',
							name: 'Tracker 5',
							blocked: false,
						},
						{
							id: '6',
							name: 'Tracker 6',
							blocked: false,
						},
					],
					img_name: 'category-2-image-url',
				},
			];
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = shallow(
				<BlockingCategories
					type="site"
					categories={categories}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			);
			const instance = component.instance();

			expect(component.state('openCategoryIndex')).toBe(-1);
			expect(instance.getOpenStatus(0)).toBe(false);

			instance.toggleCategoryOpen(0);
			expect(component.state('openCategoryIndex')).toBe(0);
			expect(instance.getOpenStatus(0)).toBe(true);

			component.setProps({ type: 'global' });
			expect(component.state('openCategoryIndex')).toBe(-1);
			expect(instance.getOpenStatus(0)).toBe(false);
		});
	});
});
