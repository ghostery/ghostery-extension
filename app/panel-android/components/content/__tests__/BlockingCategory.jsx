/**
 * BlockingCategory Test Component
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
import BlockingCategory from '../BlockingCategory';

describe('app/panel-android/components/content/BlockingCategory.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('BlockingCategory component when sitePolicy Restricted', () => {
			const category = {
				id: 'cat-1',
				name: 'Category-1',
				num_total: 1,
				num_blocked: 0,
				trackers: [],
				img_name: 'category-1-image-url',
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: true,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={() => {}}
					open={false}
					type="site"
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingCategory component when sitePolicy Trusted', () => {
			const category = {
				id: 'cat-1',
				name: 'Category-1',
				num_total: 1,
				num_blocked: 0,
				trackers: [],
				img_name: 'category-1-image-url',
			};
			const siteProps = {
				isTrusted: true,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={() => {}}
					open={false}
					type="site"
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingCategory component when sitePolicy Trusted & Paused', () => {
			const category = {
				id: 'cat-1',
				name: 'Category-1',
				num_total: 1,
				num_blocked: 0,
				trackers: [],
				img_name: 'category-1-image-url',
			};
			const siteProps = {
				isTrusted: true,
				isRestricted: false,
				isPaused: true,
			};

			const component = renderer.create(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={() => {}}
					open={false}
					type="site"
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingCategory component as site with all trackers ss_blocked', () => {
			const category = {
				id: 'cat-1',
				name: 'Category-1',
				num_total: 1,
				num_blocked: 0,
				trackers: [
					{
						id: '1',
						name: 'Tracker 1',
						blocked: false,
						ss_allowed: false,
						ss_blocked: true,
					},
				],
				img_name: 'category-1-image-url',
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={() => {}}
					open={false}
					type="site"
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingCategory component as site with all trackers ss_allowed', () => {
			const category = {
				id: 'cat-1',
				name: 'Category-1',
				num_total: 1,
				num_blocked: 0,
				trackers: [
					{
						id: '1',
						name: 'Tracker 1',
						blocked: false,
						ss_allowed: true,
						ss_blocked: true,
					},
				],
				img_name: 'category-1-image-url',
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={() => {}}
					open={false}
					type="site"
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingCategory component as global with no trackers blocked', () => {
			const category = {
				id: 'cat-1',
				name: 'Category-1',
				num_total: 1,
				num_blocked: 0,
				trackers: [
					{
						id: '1',
						name: 'Tracker 1',
						blocked: false,
					},
				],
				img_name: 'category-1-image-url',
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={() => {}}
					open={false}
					type="global"
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingCategory component as global with all trackers blocked', () => {
			const category = {
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
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={() => {}}
					open={false}
					type="global"
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingCategory component as global with mixed trackers blocked', () => {
			const category = {
				id: 'cat-1',
				name: 'Category-1',
				num_total: 2,
				num_blocked: 1,
				trackers: [
					{
						id: '1',
						name: 'Tracker 1',
						blocked: false,
					},
					{
						id: '2',
						name: 'Tracker 2',
						blocked: true,
					},
				],
				img_name: 'category-1-image-url',
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={() => {}}
					open={false}
					type="global"
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Functionality tests shallow mounted with Enzyme', () => {
		test('BlockingCategory component category click works', () => {
			const category = {
				id: 'cat-1',
				name: 'Category-1',
				num_total: 2,
				num_blocked: 1,
				trackers: [
					{
						id: '1',
						name: 'Tracker 1',
						blocked: false,
					},
					{
						id: '2',
						name: 'Tracker 2',
						blocked: true,
					},
				],
				img_name: 'category-1-image-url',
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const toggleCategoryOpen = jest.fn();
			const callGlobalAction = jest.fn();

			const component = shallow(
				<BlockingCategory
					key="cat-1"
					index={1}
					category={category}
					toggleCategoryOpen={toggleCategoryOpen}
					open={false}
					type="site"
					siteProps={siteProps}
					callGlobalAction={callGlobalAction}
				/>
			);

			expect(component.find('.BlockingCategory__tracker').length).toBe(0);
			component.find('.BlockingCategory__details').simulate('click');
			component.setProps({ open: true });
			expect(toggleCategoryOpen.mock.calls.length).toBe(1);
			expect(component.find('.BlockingCategory__tracker').length).toBe(2);

			expect(callGlobalAction.mock.calls.length).toBe(0);
			component.find('.BlockingSelectButton').simulate('click', { stopPropagation: () => {} });
			component.setProps({ type: 'global' });
			component.find('.BlockingSelectButton').simulate('click', { stopPropagation: () => {} });

			expect(callGlobalAction.mock.calls[0][0].actionData.type).toBe('site');
			expect(callGlobalAction.mock.calls[1][0].actionData.type).toBe('global');
		});
	});
});
