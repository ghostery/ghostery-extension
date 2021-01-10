/**
 * BlockSettings View Test Component
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
import { MemoryRouter } from 'react-router';
import BlockSettingsView from '../BlockSettingsView';

const noop = () => {};
jest.mock('../../../../../shared-components/Tooltip');

describe('app/ghostery-browser-hub/Views/OnboardingViews/Step2_BlockSettingsView/BlockSettingsView.test.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('BlockSettings View is rendered correctly', () => {
			const initialState = {
				actions: {
					setAntiTracking: noop,
					setAdBlock: noop,
					setSmartBlocking: noop,
					setBlockingPolicy: noop,
					setToast: noop,
					setSetupStep: noop,
				}
			};
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
			const initialState = {
				actions: {
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
			const component = shallow(<BlockSettingsView {...initialState} />);
			expect(component.find('.BlockSettingsView_checkbox').length).toBe(1);
			expect(component.find('.BlockSettingsView__radioButtonContainer').length).toBe(9);

			const instance = component.instance();

			instance.toggleRecommendedChoices(true);
			expect(component.state('blockAds')).toBe(true);
			expect(component.state('kindsOfTrackers')).toBe(1);
			expect(component.state('antiTracking')).toBe(true);
			expect(component.state('smartBrowsing')).toBe(true);

			instance.handleAnswerChange('blockAds', false);
			expect(component.state('blockAds')).toBe(false);

			instance.handleSubmit();
			expect(initialState.actions.setAntiTracking.mock.calls.length).toBe(1);
			expect(initialState.actions.setAdBlock.mock.calls.length).toBe(1);
			expect(initialState.actions.setSmartBlocking.mock.calls.length).toBe(1);
			expect(initialState.actions.setBlockingPolicy.mock.calls.length).toBe(1);
			expect(initialState.actions.setSetupStep.mock.calls.length).toBe(1);

			expect(component).toMatchSnapshot();
		});
	});
});
