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
global.t = function(str) {
	return str;
};

// Fake the Tooltip implementation
jest.mock('../Tooltip');

describe('app/panel/components/BuildingBlocks/PauseButton.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('unpaused state in simple view', () => {
			const dropdownItems = [
				{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
				{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
				{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
			];
			const component = renderer.create(
				<PauseButton
					isPaused={false}
					isPausedTimeout={null}
					clickPause={() => {}}
					dropdownItems={dropdownItems}
					isCentered
					isCondensed={false}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('paused state in detailed view', () => {
			const dropdownItems = [
				{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
				{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
				{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
			];
			const component = renderer.create(
				<PauseButton
					isPaused
					isPausedTimeout={null}
					clickPause={() => {}}
					dropdownItems={dropdownItems}
					isCentered={false}
					isCondensed={false}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('paused state in detailed condensed view', () => {
			const dropdownItems = [
				{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
				{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
				{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
			];
			const component = renderer.create(
				<PauseButton
					isPaused
					isPausedTimeout={null}
					clickPause={() => {}}
					dropdownItems={dropdownItems}
					isCentered={false}
					isCondensed
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the state of the pause button correctly when Ghostery is not paused', () => {
			const dropdownItems = [
				{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
				{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
				{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
			];
			const component = shallow(
				<PauseButton
					isPaused={false}
					isPausedTimeout={null}
					clickPause={() => {}}
					dropdownItems={dropdownItems}
					isCentered={false}
					isCondensed={false}
				/>
			);
			expect(component.find('.button').length).toBe(2);
			expect(component.find('.button.button-pause').length).toBe(1);
			expect(component.find('.button.button-pause.active').length).toBe(0);
			expect(component.find('.button.button-pause.smaller').length).toBe(1);
			expect(component.find('.button.button-pause.smallest').length).toBe(0);
			expect(component.find('.dropdown-container').length).toBe(0);
			expect(component.find('.dropdown-container .dropdown-item').length).toBe(0);
			expect(component.find('.button-caret').length).toBe(1);
			expect(component.find('.button-caret.active').length).toBe(0);
			component.setState({ showDropdown: true });
			expect(component.find('.dropdown-container').length).toBe(1);
			expect(component.find('.dropdown-container .dropdown-item').length).toBe(3);
			expect(component.find('.dropdown-container .dropdown-item.selected').length).toBe(0);
			expect(component.find('.button-caret.active').length).toBe(1);
		});

		test('the state of the pause button correctly when Ghostery is paused', () => {
			const dropdownItems = [
				{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
				{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
				{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
			];
			const component = shallow(
				<PauseButton
					isPaused
					isPausedTimeout={1800000}
					clickPause={() => {}}
					dropdownItems={dropdownItems}
					isCentered
					isCondensed={false}
				/>
			);
			expect(component.find('.button').length).toBe(2);
			expect(component.find('.button.button-pause').length).toBe(1);
			expect(component.find('.button.button-pause.active').length).toBe(1);
			expect(component.find('.button.button-pause.smaller').length).toBe(0);
			expect(component.find('.button.button-pause.smallest').length).toBe(0);
			expect(component.find('.dropdown-container').length).toBe(0);
			expect(component.find('.dropdown-container .dropdown-item').length).toBe(0);
			expect(component.find('.button-caret').length).toBe(1);
			expect(component.find('.button-caret.active').length).toBe(0);
			component.setState({ showDropdown: true });
			expect(component.find('.dropdown-container').length).toBe(1);
			expect(component.find('.dropdown-container .dropdown-item').length).toBe(3);
			expect(component.find('.dropdown-container .dropdown-item.selected').length).toBe(1);
			expect(component.find('.button-caret.active').length).toBe(1);
		});

		test('the pause button correctly it is centered and condensed', () => {
			const dropdownItems = [
				{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
				{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
				{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
			];
			const component = shallow(
				<PauseButton
					isPaused={false}
					isPausedTimeout={null}
					clickPause={() => {}}
					dropdownItems={dropdownItems}
					isCentered
					isCondensed
				/>
			);
			expect(component.find('.button').length).toBe(2);
			expect(component.find('.button.button-pause').length).toBe(1);
			expect(component.find('.button.button-pause.smaller').length).toBe(0);
			expect(component.find('.button.button-pause.smallest').length).toBe(1);
		});

		test('the pause button correctly handles clicks', () => {
			const clickPause = jest.fn();
			const dropdownItems = [
				{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
				{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
				{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
			];
			const component = shallow(
				<PauseButton
					isPaused={false}
					isPausedTimeout={null}
					clickPause={clickPause}
					dropdownItems={dropdownItems}
					isCentered
					isCondensed
				/>
			);
			expect(clickPause.mock.calls.length).toBe(0);
			component.find('.button-pause').simulate('click');

			component.setState({ showDropdown: true });
			component.find('.dropdown').childAt(0).simulate('click');

			component.setState({ showDropdown: true });
			component.find('.dropdown').childAt(1).simulate('click');

			component.setState({ showDropdown: true });
			component.find('.dropdown').childAt(2).simulate('click');

			expect(clickPause.mock.calls.length).toBe(4);
			expect(clickPause.mock.calls[0][0]).toBeFalsy();
			expect(clickPause.mock.calls[1][0]).toBe(30);
			expect(clickPause.mock.calls[2][0]).toBe(60);
			expect(clickPause.mock.calls[3][0]).toBe(1440);
		});
	});
});
