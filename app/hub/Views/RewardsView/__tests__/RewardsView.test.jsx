/**
 * Reward View Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import RewardsView from '../RewardsView';

describe('app/hub/Views/RewardsView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('rewards view is rendered correctly', () => {
			const component = renderer.create(
				<RewardsView />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const component = shallow(<RewardsView />);
			expect(component.find('.RewardsView').length).toBe(1);
			expect(component.find('.RewardsView--paddingTop').length).toBe(3);
			expect(component.find('.RewardsView__promoFeature').length).toBe(3);
			expect(component.find('.RewardsView__promoTitle').length).toBe(3);
			expect(component.find('.RewardsView__promoDescription').length).toBe(3);
		});
	});
});
