/**
 * Reward Detail Test Component
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
import { shallow } from 'enzyme';
import RewardDetail from '../BuildingBlocks/RewardDetail';

// Fake the translation function to only return the translation key
global.t = function (str) {
	return str;
};

// Fake the Tooltip implementation
jest.mock('../Tooltip');

describe('app/panel/components/BuildingBlocks/RewardDetail.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('reward detail is rendered with all values present', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				code: 'test_code',
				conditions: 'test reward conditions',
				description: 'test reward description',
				expires: 1527880170315,
				id: 'test_reward_id',
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				pictureUrl: 'https://www.ghostery.com/wp-content/uploads/2017/12/simple-detailed-1024x833.png',
				redeemUrl: 'https://www.offer-redeem-test.com',
				redeemText: 'redeem now',
				text: 'test reward title'
			};
			const component = renderer.create(<RewardDetail {...initialState} />).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('reward detail is rendered with missing text', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				code: 'test_code',
				conditions: 'test reward conditions',
				description: 'test reward description',
				expires: 1527880170315,
				id: 'test_reward_id',
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				pictureUrl: 'https://www.ghostery.com/wp-content/uploads/2017/12/simple-detailed-1024x833.png',
				redeemUrl: 'https://www.offer-redeem-test.com',
				redeemText: 'redeem now',
				text: ''
			};
			const component = renderer.create(<RewardDetail {...initialState} />).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('reward detail is rendered with missing description', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				code: 'test_code',
				conditions: 'test reward conditions',
				description: '',
				expires: 1527880170315,
				id: 'test_reward_id',
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				pictureUrl: 'https://www.ghostery.com/wp-content/uploads/2017/12/simple-detailed-1024x833.png',
				redeemUrl: 'https://www.offer-redeem-test.com',
				redeemText: 'redeem now',
				text: 'test reward title'
			};
			const component = renderer.create(<RewardDetail {...initialState} />).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('reward detail is rendered with missing code', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				code: '',
				conditions: 'test reward conditions',
				description: 'test reward description',
				expires: 1527880170315,
				id: 'test_reward_id',
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				pictureUrl: 'https://www.ghostery.com/wp-content/uploads/2017/12/simple-detailed-1024x833.png',
				redeemUrl: 'https://www.offer-redeem-test.com',
				redeemText: 'redeem now',
				text: 'test reward title'
			};
			const component = renderer.create(<RewardDetail {...initialState} />).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('reward detail is rendered with missing conditions', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				code: 'test_code',
				conditions: '',
				description: 'test reward description',
				expires: 1527880170315,
				id: 'test_reward_id',
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				pictureUrl: 'https://www.ghostery.com/wp-content/uploads/2017/12/simple-detailed-1024x833.png',
				redeemUrl: 'https://www.offer-redeem-test.com',
				redeemText: 'redeem now',
				text: 'test reward title'
			};
			const component = renderer.create(<RewardDetail {...initialState} />).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('reward detail is rendered correctly the code is copied', () => {
			const initialState = {
				actions: {
					updateRewardsData: () => {},
					toggleOffersEnabled: () => {},
					removeOffer: () => {},
					setOfferRead: () => {},
					sendSignal: () => {}
				},
				code: 'test_code',
				conditions: 'test reward conditions',
				description: 'test reward description',
				expires: 1527880170315,
				id: 'test_reward_id',
				logoUrl: 'https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo.svg',
				pictureUrl: 'https://www.ghostery.com/wp-content/uploads/2017/12/simple-detailed-1024x833.png',
				redeemUrl: 'https://www.offer-redeem-test.com',
				redeemText: 'redeem now',
				text: 'test reward title'
			};
			const component = shallow(<RewardDetail {...initialState} />);
			expect(component.text()).toEqual(expect.stringContaining('rewards_copy_code'));
			expect(component.text()).not.toEqual(expect.stringContaining('rewards_code_copied'));
			component.setState({ copyText: t('rewards_code_copied') });
			expect(component.text()).not.toEqual(expect.stringContaining('rewards_copy_code'));
			expect(component.text()).toEqual(expect.stringContaining('rewards_code_copied'));
		});
	});
});
