/**
 * BlockSettings View Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router';
import BlockSettingsView from '../BlockSettingsView';

const noop = () => {};
jest.mock('../../../../../shared-components/Tooltip');

describe('app/dawn-hub/Views/OnboardingViews/Step2_BlockSettingsView/BlockSettingsView.test.jsx', () => {
	const initialState = {
		actions: {
			logout: noop,
			setAntiTracking: noop,
			setAdBlock: noop,
			setSmartBlocking: noop,
			setBlockingPolicy: noop,
			setToast: noop,
			setSetupStep: noop,
		}
	};
	describe('Snapshot tests with react-test-renderer', () => {
		test('BlockSettings View is rendered correctly', () => {
			const component = renderer.create(
				<MemoryRouter>
					<BlockSettingsView  {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('BlockSettings View happy path', () => {
			const happyState = {
				...initialState,
				actions: {
					logout: noop,
					setAntiTracking: jest.fn(),
					setAdBlock: jest.fn(),
					setSmartBlocking: jest.fn(),
					setBlockingPolicy: jest.fn(),
					setToast: noop,
					setSetupStep: jest.fn(),
				},
				history: {
					push: noop
				}
			};
			const component = shallow(<BlockSettingsView {...happyState } />);

			const instance = component.instance();

			instance.toggleRecommendedChoices(true);
			expect(component.state('enable_ad_block')).toBe(true);
			expect(component.state('kindsOfTrackers')).toBe(1);
			expect(component.state('enable_anti_tracking')).toBe(true);
			expect(component.state('enable_smart_block')).toBe(true);

			instance.handleAnswerChange('enable_ad_block', false);
			expect(component.state('enable_ad_block')).toBe(false);

			instance.handleSubmit();
			expect(happyState.actions.setAntiTracking.mock.calls.length).toBe(1);
			expect(happyState.actions.setAdBlock.mock.calls.length).toBe(1);
			expect(happyState.actions.setSmartBlocking.mock.calls.length).toBe(1);
			expect(happyState.actions.setBlockingPolicy.mock.calls.length).toBe(1);
			expect(happyState.actions.setSetupStep.mock.calls.length).toBe(1);

			expect(component).toMatchSnapshot();
		});
	});
});
