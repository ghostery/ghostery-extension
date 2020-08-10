/**
 * Import Export Settings Test Component
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
import { mount } from 'enzyme';
import ImportExport from '../ImportExport';

jest.mock('../../../../../src/classes/Globals', () => ({
	BROWSER_INFO: {
		name: 'firefox',
	}
}));

describe('app/panel/Settings/ImportExport.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('ImportExport is rendered correctly with baseline props', () => {
			const settingsData = {
				pageUrl: '',
				exportResultText: '',
				importResultText: '',
				actionSuccess: false,
			};
			const actions = {
				exportSettings: () => {},
				importSettingsDialog: () => {},
				importSettingsNative: () => {},
			};

			const component = renderer.create(
				<ImportExport
					settingsData={settingsData}
					actions={actions}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('ImportExport is rendered correctly with happy-path props', () => {
			const settingsData = {
				pageUrl: 'https://example.com',
				exportResultText: 'Your settings have been successfully exported to your downloads folder on August 8, 2020 6:08 PM',
				importResultText: 'Your settings have been successfully imported on September 12, 2020 6:08 PM',
				actionSuccess: true,
			};
			const actions = {
				exportSettings: () => {},
				importSettingsDialog: () => {},
				importSettingsNative: () => {},
			};

			const component = renderer.create(
				<ImportExport
					settingsData={settingsData}
					actions={actions}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('ImportExport is rendered correctly with unhappy-path props', () => {
			const settingsData = {
				pageUrl: 'chrome://extensions',
				exportResultText: 'Ghostery cannot export settings when the current page is one of the reserved browser pages. Please navigate to a different page and try again.',
				importResultText: 'That is the incorrect file type. Please choose a .ghost file and try again.',
				actionSuccess: false,
			};
			const actions = {
				exportSettings: () => {},
				importSettingsDialog: () => {},
				importSettingsNative: () => {},
			};

			const component = renderer.create(
				<ImportExport
					settingsData={settingsData}
					actions={actions}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('ImportExport functions correctly', () => {
			const settingsData = {
				pageUrl: '',
				exportResultText: '',
				importResultText: '',
				actionSuccess: false,
			};
			const actions = {
				exportSettings: jest.fn(),
				importSettingsDialog: jest.fn(),
				importSettingsNative: jest.fn(),
			};
			const component = mount(
				<ImportExport
					settingsData={settingsData}
					actions={actions}
				/>
			);

			expect(actions.exportSettings.mock.calls.length).toBe(0);
			expect(actions.importSettingsDialog.mock.calls.length).toBe(0);
			expect(actions.importSettingsNative.mock.calls.length).toBe(0);
			expect(component.find('.export-result').text()).toBe('');
			expect(component.find('.import-result').text()).toBe('');

			component.find('.export').simulate('click');
			component.setProps({
				settingsData: {
					pageUrl: '',
					exportResultText: 'export-result-text',
					importResultText: '',
					actionSuccess: true,
				}
			});
			expect(actions.exportSettings.mock.calls.length).toBe(1);
			expect(component.find('.export-result').text()).toBe('export-result-text');

			component.find('.import').simulate('click');
			component.setProps({
				settingsData: {
					pageUrl: '',
					exportResultText: '',
					importResultText: 'import-result-text',
					actionSuccess: true,
				}
			});
			expect(actions.importSettingsDialog.mock.calls.length).toBe(1);
			expect(component.find('.import-result').text()).toBe('import-result-text');

			component.find('#select-file').simulate('change');
			expect(actions.importSettingsNative.mock.calls.length).toBe(1);
		});
	});
});
