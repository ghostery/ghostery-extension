/**
 * Donut Graph Test Component
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
import DonutGraph from '../BuildingBlocks/DonutGraph';

// Fake the translation function to only return the translation key
global.t = function(str) {
	return str;
};

// Fake the Tooltip implementation
jest.mock('../Tooltip');

describe('app/panel/components/DonutGraph.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('DonutGraph is rendered correctly when props are falsy', () => {
			const component = renderer.create(
				<DonutGraph
					renderRedscale={false}
					renderGreyscale={false}
					totalCount={0}
					ghosteryFeatureSelect={false}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('DonutGraph is rendered correctly when some props are truthy', () => {
			const component = renderer.create(
				<DonutGraph
					categories={[
						{
							id: 1,
							name: 'category-1',
							num_total: 1
						},
						{
							id: 2,
							name: 'category-2',
							num_total: 2
						},
						{
							id: 3,
							name: 'category-3',
							num_total: 3
						},
						{
							id: 4,
							name: 'category-4',
							num_total: 4
						},
					]}
					adBlock={{ unknownTrackerCount: 8 }}
					antiTracking={{ unknownTrackerCount: 8 }}
					renderRedscale
					renderGreyscale={false}
					totalCount={8}
					ghosteryFeatureSelect={1}
					isSmall={false}
					clickDonut={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('DonutGraph is rendered correctly when all props are truthy', () => {
			const component = renderer.create(
				<DonutGraph
					categories={[
						{
							id: 1,
							name: 'category-1',
							num_total: 1
						},
						{
							id: 2,
							name: 'category-2',
							num_total: 2
						},
						{
							id: 3,
							name: 'category-3',
							num_total: 3
						},
						{
							id: 4,
							name: 'category-4',
							num_total: 4
						},
					]}
					adBlock={{ unknownTrackerCount: 8 }}
					antiTracking={{ unknownTrackerCount: 8 }}
					renderRedscale={false}
					renderGreyscale
					totalCount={38}
					ghosteryFeatureSelect={2}
					isSmall
					clickDonut={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('DonutGraph handles clicks correctly', () => {
			const clickDonut = jest.fn();
			const component = shallow(
				<DonutGraph
					renderRedscale={false}
					renderGreyscale={false}
					totalCount={10}
					ghosteryFeatureSelect={false}
					clickDonut={clickDonut}
				/>
			);
			expect(clickDonut.mock.calls.length).toBe(0);
			component.find('.DonutGraph__textCountContainer').simulate('click');
			expect(clickDonut.mock.calls.length).toBe(1);
			expect(clickDonut.mock.calls[0][0].type).toBe('trackers');
			expect(clickDonut.mock.calls[0][0].name).toBe('all');
		});
	});
});
