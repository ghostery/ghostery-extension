/**
 * Reward List Item Test Component
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
import RewardListItem from '../BuildingBlocks/RewardListItem';

// Fake the translation function to only return the translation key
global.t = function (str) {
	return str;
};

describe('app/panel/components/BuildingBlocks/RewardListItem.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('reward list item is rendered correctly', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				disabled: false,
				expires: 1527885633645,
				id: 'test_reward_id',
				index: 0,
				isLong: false,
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				text: 'test reward title',
				unread: false
			};
			const component = renderer.create(
				<MemoryRouter>
					<RewardListItem {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('reward list item is rendered correctly when disabled', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				disabled: true,
				expires: 1527885633645,
				id: 'test_reward_id',
				index: 0,
				isLong: false,
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				text: 'test reward title',
				unread: false
			};
			const component = renderer.create(
				<MemoryRouter>
					<RewardListItem {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('reward list item is rendered correctly when unread', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				disabled: false,
				expires: 1527885633645,
				id: 'test_reward_id',
				index: 0,
				isLong: false,
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				text: 'test reward title',
				unread: true
			};
			const component = renderer.create(
				<MemoryRouter>
					<RewardListItem {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('reward list item is rendered correctly when elongated', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				disabled: false,
				expires: 1527885633645,
				id: 'test_reward_id',
				index: 0,
				isLong: true,
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				text: 'test reward title',
				unread: false
			};
			const component = renderer.create(
				<MemoryRouter>
					<RewardListItem {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('reward list item is rendered correctly when disabled, unread, and elongated', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				disabled: true,
				expires: 1527885633645,
				id: 'test_reward_id',
				index: 0,
				isLong: true,
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				text: 'test reward title',
				unread: true
			};
			const component = renderer.create(
				<MemoryRouter>
					<RewardListItem {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
