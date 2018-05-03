/**
 * Rewards Test Component
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
import { MemoryRouter } from 'react-router';
import Rewards from '../Rewards';

// Fake the translation function to only return the translation key
global.t = function (str) {
	return str;
};

describe('app/panel/components/Rewards.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('rewards is rendered correctly when rewards is on and rewards is null', () => {
			const initialState = {
				actions: {
					getRewardsData: () => {},
					sendSignal: () => {},
				},
				location: {
					pathname: '/detail/rewards/list',
				},
				enable_offers: true,
				is_expanded: false
			};
			const component = renderer.create(
				<MemoryRouter initialEntries={[ '/detail/rewards/list' ]}>
					<Rewards {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('rewards is rendered correctly when rewards is off and rewards is null', () => {
			const initialState = {
				actions: {
					getRewardsData: () => {},
					sendSignal: () => {},
				},
				location: {
					pathname: '/detail/rewards/list',
				},
				enable_offers: false,
				is_expanded: false
			};
			const component = renderer.create(
				<MemoryRouter initialEntries={[ '/detail/rewards/list' ]}>
					<Rewards {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
