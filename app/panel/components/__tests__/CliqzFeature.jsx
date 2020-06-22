/**
 * Cliqz Feature Test Component
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
import CliqzFeature from '../BuildingBlocks/CliqzFeature';

// Fake the translation function to only return the translation key
global.t = function(str) {
	return str;
};

// Fake the Tooltip implementation
jest.mock('../Tooltip');

describe('app/panel/components/CliqzFeature.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('CliqzFeature is rendered correctly with falsy props', () => {
			const component = renderer.create(
				<div>
					<CliqzFeature
						clickButton={() => {}}
						type="anti_track"
						active={false}
						cliqzInactive={false}
						isSmaller={false}
					/>
					<CliqzFeature
						clickButton={() => {}}
						type="ad_block"
						active={false}
						cliqzInactive={false}
						isSmaller={false}
						isCondensed={false}
						isTooltipHeader={false}
						isTooltipBody={false}
						tooltipPosition=""
					/>
					<CliqzFeature
						clickButton={() => {}}
						type="smart_block"
						active={false}
						cliqzInactive={false}
						isSmaller={false}
						isCondensed={false}
						isTooltipHeader={false}
						isTooltipBody={false}
						tooltipPosition=""
					/>
				</div>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('CliqzFeature is rendered correctly with some truthy props', () => {
			const component = renderer.create(
				<div>
					<CliqzFeature
						clickButton={() => {}}
						type="anti_track"
						active
						cliqzInactive={false}
						isSmaller={false}
					/>
					<CliqzFeature
						clickButton={() => {}}
						type="ad_block"
						active
						cliqzInactive
						isSmaller={false}
						isCondensed={false}
						isTooltipHeader={false}
						isTooltipBody={false}
						tooltipPosition=""
					/>
					<CliqzFeature
						clickButton={() => {}}
						type="smart_block"
						active
						cliqzInactive
						isSmaller={false}
						isCondensed
						isTooltipHeader
						isTooltipBody
						tooltipPosition="top"
					/>
				</div>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('CliqzFeature is rendered correctly with all truthy props', () => {
			const component = renderer.create(
				<div>
					<CliqzFeature
						clickButton={() => {}}
						type="anti_track"
						active
						cliqzInactive
						isSmaller
						isCondensed
						isTooltipHeader
						isTooltipBody
						tooltipPosition="right"
					/>
					<CliqzFeature
						clickButton={() => {}}
						type="ad_block"
						active
						cliqzInactive
						isSmaller
						isCondensed
						isTooltipHeader
						isTooltipBody
						tooltipPosition="top"
					/>
					<CliqzFeature
						clickButton={() => {}}
						type="smart_block"
						active
						cliqzInactive
						isSmaller
						isCondensed
						isTooltipHeader
						isTooltipBody
						tooltipPosition="top"
					/>
				</div>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('CliqzFeature handles clicks correctly', () => {
			const clickButton = jest.fn();
			const component = shallow(
				<CliqzFeature
					clickButton={clickButton}
					type="smart_block"
					active
					cliqzInactive
					isSmaller
				/>
			);
			expect(clickButton.mock.calls.length).toBe(0);
			component.find('.CliqzFeature').simulate('click');
			expect(clickButton.mock.calls.length).toBe(0);

			component.setProps({ cliqzInactive: false });
			component.find('.CliqzFeature').simulate('click');

			component.setProps({ active: false });
			component.find('.CliqzFeature').simulate('click');
			expect(clickButton.mock.calls.length).toBe(2);
			expect(clickButton.mock.calls[0][0].status).toBe(true);
			expect(clickButton.mock.calls[1][0].status).toBe(false);
		});
	});
});
