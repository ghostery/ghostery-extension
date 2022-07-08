/**
 * Common Feature Test Component
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
import CommonFeature from '../CommonFeature';

// Fake the translation function to only return the translation key
global.t = function(str) {
	return str;
};

// Fake the Tooltip implementation
jest.mock('../../../../shared-components/Tooltip');

describe('app/panel/components/CommonFeature.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('CommonFeature is rendered correctly with falsy props', () => {
			const component = renderer.create(
				<div>
					<CommonFeature
						clickButton={() => {}}
						type="anti_track"
						active={false}
						commonInactive={false}
						isSmaller={false}
					/>
					<CommonFeature
						clickButton={() => {}}
						type="ad_block"
						active={false}
						commonInactive={false}
						isSmaller={false}
						isCondensed={false}
						isTooltipHeader={false}
						isTooltipBody={false}
						tooltipPosition=""
					/>
					<CommonFeature
						clickButton={() => {}}
						type="smart_block"
						active={false}
						commonInactive={false}
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

		test('CommonFeature is rendered correctly with some truthy props', () => {
			const component = renderer.create(
				<div>
					<CommonFeature
						clickButton={() => {}}
						type="anti_track"
						active
						commonInactive={false}
						isSmaller={false}
					/>
					<CommonFeature
						clickButton={() => {}}
						type="ad_block"
						active
						commonInactive
						isSmaller={false}
						isCondensed={false}
						isTooltipHeader={false}
						isTooltipBody={false}
						tooltipPosition=""
					/>
					<CommonFeature
						clickButton={() => {}}
						type="smart_block"
						active
						commonInactive
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

		test('CommonFeature is rendered correctly with all truthy props', () => {
			const component = renderer.create(
				<div>
					<CommonFeature
						clickButton={() => {}}
						type="anti_track"
						active
						commonInactive
						isSmaller
						isCondensed
						isTooltipHeader
						isTooltipBody
						tooltipPosition="right"
					/>
					<CommonFeature
						clickButton={() => {}}
						type="ad_block"
						active
						commonInactive
						isSmaller
						isCondensed
						isTooltipHeader
						isTooltipBody
						tooltipPosition="top"
					/>
					<CommonFeature
						clickButton={() => {}}
						type="smart_block"
						active
						commonInactive
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
		test('CommonFeature handles clicks correctly', () => {
			const clickButton = jest.fn();
			const component = shallow(
				<CommonFeature
					clickButton={clickButton}
					type="smart_block"
					active
					commonInactive
					isSmaller
				/>
			);
			expect(clickButton.mock.calls.length).toBe(0);
			component.find('.CommonFeature').simulate('click');
			expect(clickButton.mock.calls.length).toBe(0);

			component.setProps({ commonInactive: false });
			component.find('.CommonFeature').simulate('click');

			component.setProps({ active: false });
			component.find('.CommonFeature').simulate('click');
			expect(clickButton.mock.calls.length).toBe(2);
			expect(clickButton.mock.calls[0][0].status).toBe(true);
			expect(clickButton.mock.calls[1][0].status).toBe(false);
		});
	});
});
