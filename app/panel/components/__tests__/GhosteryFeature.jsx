/**
 * Ghostery Feature Test Component
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
import GhosteryFeature from '../BuildingBlocks/GhosteryFeature';

// Fake the translation function to only return the translation key
global.t = function(str) {
	return str;
};

// Fake the Tooltip implementation
jest.mock('../Tooltip');

describe('app/panel/components/GhosteryFeature.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('GhosteryFeature is rendered correctly props are falsy', () => {
			const component = renderer.create(
				<div>
					<GhosteryFeature
						handleClick={() => {}}
						type="trust"
						sitePolicy={false}
						blockingPausedOrDisabled={false}
						showText={false}
						tooltipPosition=""
						short={false}
						narrow={false}
					/>
					<GhosteryFeature
						handleClick={() => {}}
						type="restrict"
						sitePolicy={false}
						blockingPausedOrDisabled={false}
						showText={false}
						tooltipPosition=""
						short={false}
						narrow={false}
					/>
				</div>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('GhosteryFeature is rendered correctly some props are truthy', () => {
			const component = renderer.create(
				<div>
					<GhosteryFeature
						handleClick={() => {}}
						type="trust"
						sitePolicy={2}
						blockingPausedOrDisabled={false}
						showText
						tooltipPosition="right"
						short
						narrow={false}
					/>
					<GhosteryFeature
						handleClick={() => {}}
						type="restrict"
						sitePolicy={2}
						blockingPausedOrDisabled={false}
						showText
						tooltipPosition="right"
						short
						narrow={false}
					/>
				</div>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('GhosteryFeature is rendered correctly props are truthy', () => {
			const component = renderer.create(
				<div>
					<GhosteryFeature
						handleClick={() => {}}
						type="trust"
						sitePolicy={1}
						blockingPausedOrDisabled
						showText
						tooltipPosition="top"
						short
						narrow
					/>
					<GhosteryFeature
						handleClick={() => {}}
						type="restrict"
						sitePolicy={1}
						blockingPausedOrDisabled
						showText
						tooltipPosition="top"
						short
						narrow
					/>
				</div>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('GhosteryFeature has the correct class names', () => {
			const component = shallow(
				<GhosteryFeature
					handleClick={() => {}}
					type="restrict"
					sitePolicy={false}
					blockingPausedOrDisabled={false}
					showText={false}
					tooltipPosition=""
					short={false}
					narrow={false}
				/>
			);
			expect(component.find('.GhosteryFeatureButton.restrict').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton.trust').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton.not-clickable').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton.clickable').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--normal').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--short').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--narrow').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--inactive').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--active').length).toBe(0);

			component.setProps({ narrow: true, sitePolicy: 1 });
			expect(component.find('.GhosteryFeatureButton--normal').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--short').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--narrow').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--inactive').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--active').length).toBe(1);

			component.setProps({ short: true, type: 'trust' });
			expect(component.find('.GhosteryFeatureButton.restrict').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton.trust').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--normal').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--short').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--narrow').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--inactive').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--active').length).toBe(0);

			component.setProps({ narrow: false, sitePolicy: 2 });
			expect(component.find('.GhosteryFeatureButton--normal').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--short').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--narrow').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--inactive').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--active').length).toBe(1);

			component.setProps({ short: false, blockingPausedOrDisabled: true });
			expect(component.find('.GhosteryFeatureButton.not-clickable').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton.clickable').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--normal').length).toBe(1);
			expect(component.find('.GhosteryFeatureButton--short').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--narrow').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--inactive').length).toBe(0);
			expect(component.find('.GhosteryFeatureButton--active').length).toBe(1);
		});

		test('GhosteryFeature handles clicks correctly', () => {
			const handleClick = jest.fn();
			const component = shallow(
				<GhosteryFeature
					handleClick={handleClick}
					type="restrict"
					sitePolicy={false}
					blockingPausedOrDisabled
					showText={false}
					tooltipPosition=""
					short={false}
					narrow={false}
				/>
			);

			expect(handleClick.mock.calls.length).toBe(0);
			component.find('.GhosteryFeatureButton').simulate('click');
			expect(handleClick.mock.calls.length).toBe(0);

			component.setProps({ blockingPausedOrDisabled: false });
			component.find('.GhosteryFeatureButton').simulate('click');
			expect(handleClick.mock.calls.length).toBe(1);
		});
	});
});
