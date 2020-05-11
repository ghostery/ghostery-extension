/**
 * Rewards Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import Rewards from '../Rewards';
import DynamicUIPortContext from '../../contexts/DynamicUIPortContext';


// Fake the translation function to only return the translation key
global.t = function(str) {
	return str;
};

describe('app/panel/components/Rewards.jsx', () => {
	const dynamicUIPort = {
		onMessage: { addListener: jest.fn() },
		postMessage: jest.fn(),
	};

	describe('Snapshot tests with react-test-renderer', () => {
		test('rewards is rendered correctly when rewards is on and rewards is null', () => {
			const actions = {
				updateRewardsData: () => {},
				sendSignal: () => {},
			};
			const location = {
				pathname: '/detail/rewards/list',
			};
			const component = renderer.create(
				<MemoryRouter initialEntries={['/detail/rewards/list']}>
					<DynamicUIPortContext.Provider value={dynamicUIPort}>
						<Rewards
							actions={actions}
							location={location}
							enable_offers
							is_expanded={false}
						/>
					</DynamicUIPortContext.Provider>
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('rewards is rendered correctly when rewards is off and rewards is null', () => {
			const actions = {
				updateRewardsData: () => {},
				sendSignal: () => {},
			};
			const location = {
				pathname: '/detail/rewards/list',
			};
			const component = renderer.create(
				<MemoryRouter initialEntries={['/detail/rewards/list']}>
					<DynamicUIPortContext.Provider value={dynamicUIPort}>
						<Rewards
							actions={actions}
							location={location}
							enable_offers={false}
							is_expanded={false}
						/>
					</DynamicUIPortContext.Provider>
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
