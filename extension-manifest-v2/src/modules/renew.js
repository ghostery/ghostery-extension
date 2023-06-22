/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
import browser from 'webextension-polyfill';

import { openNewTab } from '../utils/utils';

import conf from '../classes/ConfData';
import globals from '../classes/Globals';
import ABTest from '../classes/ABTest';

const _14_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 14;
let timeoutId;

function clear() {
	if (timeoutId) {
		clearTimeout(timeoutId);
		browser.storage.local.remove(['renew_setup']);
	}
}

function revoke() {
	// reset all onboarding flags
	conf.setup_complete = false;
	conf.setup_skip = false;
	conf.setup_timestamp = null;

	globals.ONBOARDED_FEATURES.forEach((confName) => {
		conf[confName] = false;
	});

	// Clear renew setup
	clear();

	// Open onboarding
	openNewTab({ url: '/app/templates/onboarding.html?renew=1', become_active: true });
}

export default async function setup() {
	if (ABTest.hasTest('terms') && conf.setup_complete && !conf.enable_human_web) {
		let { renew_setup } = await browser.storage.local.get(['renew_setup']);
		const now = Date.now();

		if (!renew_setup) {
			renew_setup = {
				timestamp: now + _14_DAYS_IN_MS,
				lastSeen: 0,
			};
			browser.storage.local.set({ renew_setup });
		}

		if (!timeoutId) {
			timeoutId = setTimeout(revoke, renew_setup.timestamp - now);
		}

		return renew_setup;
	}

	clear();

	return null;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.action) {
		case 'renew:setup':
			setup().then(sendResponse);
			return true;
		case 'renew:clear':
			revoke();
			break;
		default:
			break;
	}

	return false;
});
