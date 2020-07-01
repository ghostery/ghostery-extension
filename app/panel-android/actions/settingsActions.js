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

import { sendMessage, sendMessageInPromise } from '../../panel/utils/msg';

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
