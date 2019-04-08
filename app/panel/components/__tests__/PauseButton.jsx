/**
 * Pause Button Test Component
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
import PauseButton from '../BuildingBlocks/PauseButton';

// Fake the translation function to only return the translation key
global.t = function (str) {
	return str;
};

// Fake the Tooltip implementation
jest.mock('../Tooltip');

describe('app/panel/components/BuildingBlocks/PauseButton.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('unpaused state in simple view', () => {
			const initialState = {
				isAbPause: false,
				isPaused: false,
				isPausedTimeout: null,
				clickPause: () => {},
				dropdownItems: [
					{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
					{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
					{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
				],
				isCentered: true,
				isCondensed: false,
			};
			const component = renderer.create(<PauseButton {...initialState} />).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('paused state in detailed view', () => {
			const initialState = {
				isAbPause: false,
				isPaused: true,
				isPausedTimeout: null,
				clickPause: () => {},
				dropdownItems: [
					{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
					{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
					{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
				],
				isCentered: false,
				isCondensed: false,
			};
			const component = renderer.create(<PauseButton {...initialState} />).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('paused state in detailed condensed view', () => {
			const initialState = {
				isAbPause: true,
				isPaused: true,
				isPausedTimeout: null,
				clickPause: () => {},
				dropdownItems: [
					{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
					{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
					{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
				],
				isCentered: false,
				isCondensed: true,
			};
			const component = renderer.create(<PauseButton {...initialState} />).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the state of the pause button correctly when Ghostery is not paused', () => {
			const initialState = {
				isPaused: false,
				isPausedTimeout: null,
				clickPause: () => {},
				dropdownItems: [
					{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
					{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
					{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
				],
				isCentered: false,
				isCondensed: false,
			};
			const component = shallow(<PauseButton {...initialState} />);
			expect(component.find('.button').length).toBe(2);
			expect(component.find('.button.button-pause').length).toBe(1);
			expect(component.find('.button.button-pause.active').length).toBe(0);
			expect(component.find('.button.button-pause.smaller').length).toBe(1);
			expect(component.find('.button.button-pause.smallest').length).toBe(0);
			expect(component.find('.dropdown-container').length).toBe(1);
			expect(component.find('.dropdown-container .dropdown-item').length).toBe(0);
			expect(component.find('.button-caret').length).toBe(1);
			expect(component.find('.button-caret.active').length).toBe(0);
			component.setState({ showDropdown: true });
			expect(component.find('.dropdown-container .dropdown-item').length).toBe(3);
			expect(component.find('.dropdown-container .dropdown-item.selected').length).toBe(0);
			expect(component.find('.button-caret.active').length).toBe(1);
		});

		test('the state of the pause button correctly when Ghostery is paused', () => {
			const initialState = {
				isPaused: true,
				isPausedTimeout: 1800000,
				clickPause: () => {},
				dropdownItems: [
					{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
					{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
					{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
				],
				isCentered: true,
				isCondensed: false,
			};
			const component = shallow(<PauseButton {...initialState} />);
			expect(component.find('.button').length).toBe(2);
			expect(component.find('.button.button-pause').length).toBe(1);
			expect(component.find('.button.button-pause.active').length).toBe(1);
			expect(component.find('.button.button-pause.smaller').length).toBe(0);
			expect(component.find('.button.button-pause.smallest').length).toBe(0);
			expect(component.find('.dropdown-container').length).toBe(1);
			expect(component.find('.dropdown-container .dropdown-item').length).toBe(0);
			expect(component.find('.button-caret').length).toBe(1);
			expect(component.find('.button-caret.active').length).toBe(0);
			component.setState({ showDropdown: true });
			expect(component.find('.dropdown-container .dropdown-item').length).toBe(3);
			expect(component.find('.dropdown-container .dropdown-item.selected').length).toBe(1);
			expect(component.find('.button-caret.active').length).toBe(1);
		});

		test('the pause button correctly it is centered and condensed', () => {
			const initialState = {
				isPaused: false,
				isPausedTimeout: null,
				clickPause: () => {},
				dropdownItems: [
					{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
					{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
					{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
				],
				isCentered: true,
				isCondensed: true,
			};
			const component = shallow(<PauseButton {...initialState} />);
			expect(component.find('.button').length).toBe(2);
			expect(component.find('.button.button-pause').length).toBe(1);
			expect(component.find('.button.button-pause.smaller').length).toBe(0);
			expect(component.find('.button.button-pause.smallest').length).toBe(1);
		});
	});
});
