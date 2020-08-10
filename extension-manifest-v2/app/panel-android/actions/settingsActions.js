/**
 * Tracker Action creators
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

import moment from 'moment/min/moment-with-locales.min';
import { sendMessage, sendMessageInPromise } from '../../panel/utils/msg';
import { hashCode } from '../../../src/utils/common';

// Function taken from app/content-scripts/notifications.js
function _saveToFile({ content, type }) {
	const textFileAsBlob = new Blob([content], { type: 'text/plain' });
	const ext = type === 'Ghostery-Backup' ? 'ghost' : 'json';
	const d = new Date();
	const dStr = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
	const fileNameToSaveAs = `${type}-${dStr}.${ext}`;
	let url = '';
	if (window.URL) {
		url = window.URL.createObjectURL(textFileAsBlob);
	} else {
		url = window.webkitURL.createObjectURL(textFileAsBlob);
	}

	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', fileNameToSaveAs);
	document.body.appendChild(link);
	link.click();
}

function _importFromFile(fileToLoad) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = (fileLoadedEvent) => {
			try {
				const backup = JSON.parse(fileLoadedEvent.target.result);
				if (backup.hash !== hashCode(JSON.stringify(backup.settings))) {
					throw new Error('Invalid hash');
				}
				const settings = (backup.settings || {}).conf || {};
				resolve(settings);
			} catch (err) {
				reject(err);
			}
		};
		fileReader.readAsText(fileToLoad, 'UTF-8');
	});
}

function _chooseFile() {
	return new Promise((resolve) => {
		const inputEl = document.createElement('input');
		inputEl.type = 'file';
		inputEl.addEventListener('change', () => {
			resolve(inputEl.files[0]);
		});
		inputEl.click();
	});
}

export function updateDatabase() {
	// Send Message to Background
	return sendMessageInPromise('update_database').then((result) => {
		let resultText;
		if (result && result.success === true) {
			if (result.updated === true) {
				resultText = t('settings_update_success');
			} else {
				resultText = t('settings_update_up_to_date');
			}
		} else {
			resultText = t('settings_update_failed');
		}

		// Update State for PanelAndroid UI
		return {
			settings: {
				dbUpdateText: resultText,
				...result.confData,
			}
		};
	});
}

export function updateSettingCheckbox({ actionData }) {
	const { name, checked } = actionData;
	const updatedState = {};

	if (name === 'trackers_banner_status' || name === 'reload_banner_status') {
		updatedState.panel = { [name]: checked };
	} else if (name === 'toggle_individual_trackers') {
		updatedState.blocking = { [name]: checked };
		updatedState.settings = { [name]: checked };
	} else {
		updatedState.settings = { [name]: checked };
	}

	// Send Message to Background
	sendMessage('setPanelData', { [name]: checked });

	// Update State for PanelAndroid UI
	return updatedState;
}

export function selectItem({ actionData }) {
	const { event, value } = actionData;

	// Send Message to Background
	sendMessage('setPanelData', { [event]: value });

	// Update State for PanelAndroid UI
	return {
		settings: {
			[event]: value,
		},
	};
}

export function exportSettings({ state }) {
	return sendMessageInPromise('getAndroidSettingsForExport').then((result) => {
		const { needsReload } = state;
		const settings_last_exported = Number((new Date()).getTime());
		const exportResultText = `${t('settings_export_success')} ${moment(settings_last_exported).format('LLL')}`;

		_saveToFile(result);

		return {
			needsReload,
			settings: {
				actionSuccess: true,
				settings_last_exported,
				exportResultText,
			}
		};
	});
}

export function importSettingsNative({ actionData, state }) {
	return new Promise((resolve) => {
		const { needsReload } = state;
		const settings_last_imported = Number((new Date()).getTime());
		const importResultText = `${t('settings_import_success')} ${moment(settings_last_imported).format('LLL')}`;

		_importFromFile(actionData).then((settings) => {
			// Taken from panel/reducers/settings.js
			const imported_settings = { ...settings };
			if (imported_settings.hasOwnProperty('alert_bubble_timeout')) {
				imported_settings.alert_bubble_timeout = Math.min(30, imported_settings.alert_bubble_timeout);
			}

			imported_settings.settings_last_imported = Number((new Date()).getTime());
			imported_settings.importResultText = `${t('settings_import_success')} ${moment(imported_settings.settings_last_imported).format('LLL')}`;
			imported_settings.actionSuccess = true;

			// persist to background
			sendMessage('setPanelData', imported_settings);

			return resolve({
				needsReload: true,
				settings: {
					actionSuccess: true,
					settings_last_imported,
					importResultText,
				}
			});
		}).catch(() => resolve({
			needsReload,
			settings: {
				actionSuccess: false,
				importResultText: t('settings_import_file_error'),
			}
		}));
	});
}

export function importSettingsDialog({ state }) {
	return _chooseFile().then(fileToLoad => importSettingsNative({ actionData: fileToLoad, state }));
}
