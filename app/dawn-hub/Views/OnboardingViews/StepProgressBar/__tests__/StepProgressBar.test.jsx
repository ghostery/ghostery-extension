/**
 * StepProgressBar Test Component
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
import StepProgressBar from '../StepProgressBar';
import { WELCOME, LOGIN, BLOCK_SETTINGS, CHOOSE_DEFAULT_SEARCH, CHOOSE_PLAN, SUCCESS } from '../../../OnboardingView/OnboardingConstants';

const noop = () => {};

describe('app/dawn-hub/Views/OnboardingViews/StepProgressBar/StepProgressBar.test.jsx', () => {
	const initialState = {
		currentStep: LOGIN,
		actions: {
			logout: noop
		}
	};
	describe('Snapshot tests with react-test-renderer', () => {
		test('StepProgressBar is rendered correctly', () => {
			const component = renderer.create(
				<MemoryRouter>
					<StepProgressBar {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('StepProgressBar View step 0', () => {
			const step_0_initialState = {
				...initialState,
				currentStep: WELCOME,
			};

			const component = shallow(<StepProgressBar {...step_0_initialState } />);

			expect(component).toMatchSnapshot();
		});
		test('StepProgressBar View step 1', () => {
			const step_1_initialState = {
				...initialState,
				currentStep: LOGIN
			};

			const component = shallow(<StepProgressBar {...step_1_initialState } />);

			expect(component).toMatchSnapshot();
		});

		test('StepProgressBar View step 2', () => {
			const step_2_initialState = {
				...initialState,
				currentStep: BLOCK_SETTINGS
			};

			const component = shallow(<StepProgressBar {...step_2_initialState } />);
		});

		test('StepProgressBar View step 4', () => {
			const step_4_initialState = {
				currentStep: CHOOSE_PLAN
			};

			const component = shallow(<StepProgressBar {...step_4_initialState} />);

			expect(component).toMatchSnapshot();
		});

		test('StepProgressBar View step 5', () => {
			const step_5_initialState = {
				...initialState,
				currentStep: SUCCESS
			};

			const component = shallow(<StepProgressBar {...step_5_initialState} />);

			expect(component).toMatchSnapshot();
		});
	});
});
