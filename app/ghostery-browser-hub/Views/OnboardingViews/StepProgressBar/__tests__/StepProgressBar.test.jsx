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

describe('app/ghostery-browser-hub/Views/OnboardingViews/StepProgressBar/StepProgressBar.test.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('StepProgressBar is rendered correctly', () => {
			const initialState = {
				currentStep: LOGIN,
			};
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
			const initialState = {
				currentStep: WELCOME,
				actions: {
					logout: noop
				}
			};

			const component = shallow(<StepProgressBar {...initialState} />);

			expect(component.find('.StepProgressBar__line').length).toBe(0);
			expect(component.find('.StepProgressBar__column').length).toBe(0);
			expect(component).toMatchSnapshot();
		});
		test('StepProgressBar View step 1', () => {
			const initialState = {
				currentStep: LOGIN,
				actions: {
					logout: noop
				}
			};

			const component = shallow(<StepProgressBar {...initialState} />);

			expect(component.find('.StepProgressBar__line').length).toBe(3);
			expect(component.find('.StepProgressBar__column').length).toBe(4);
			expect(component.find('.current').length).toBe(2);
			expect(component.find('.incomplete').length).toBe(3);
			expect(component).toMatchSnapshot();
		});

		test('StepProgressBar View step 2', () => {
			const initialState = {
				currentStep: BLOCK_SETTINGS,
				actions: {
					logout: noop
				}
			};

			const component = shallow(<StepProgressBar {...initialState} />);

			expect(component.find('.step-completed').length).toBe(1);
			expect(component.find('.current').length).toBe(2);
			expect(component.find('.incomplete').length).toBe(2);
			expect(component).toMatchSnapshot();
		});

		test('StepProgressBar View step 4', () => {
			const initialState = {
				currentStep: CHOOSE_PLAN,
				actions: {
					logout: noop
				}
			};

			const component = shallow(<StepProgressBar {...initialState} />);

			expect(component.find('.step-completed').length).toBe(3);
			expect(component.find('.current').length).toBe(2);
			expect(component.find('.incomplete').length).toBe(0);
			expect(component).toMatchSnapshot();
		});

		test('StepProgressBar View step 5', () => {
			const initialState = {
				currentStep: SUCCESS,
				actions: {
					logout: noop
				}
			};

			const component = shallow(<StepProgressBar {...initialState} />);

			expect(component.find('.step-completed').length).toBe(4);
			expect(component.find('.current').length).toBe(0);
			expect(component.find('.incomplete').length).toBe(0);
			expect(component).toMatchSnapshot();
		});
	});
});
