/**
 * Panel Action creators
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { sendMessageInPromise } from '../../panel/utils/msg';

export function getPanelData(tabId) {
	return sendMessageInPromise('getPanelData', {
		tabId,
		view: 'panel',
	});
}

export function getSummaryData(tabId) {
	return sendMessageInPromise('getPanelData', {
		tabId,
		view: 'summary',
	});
}

export function getBlockingData(tabId) {
	return sendMessageInPromise('getPanelData', {
		tabId,
		view: 'blocking',
	});
}

export function getSettingsData() {
	return sendMessageInPromise('getPanelData', {
		view: 'settings',
	});
}
