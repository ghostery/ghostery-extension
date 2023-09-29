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
let intervalId;
let callback;

function revoke() {
	// reset all onboarding flags
	conf.setup_complete = false;
	conf.setup_skip = false;
	conf.setup_timestamp = null;

	globals.ONBOARDED_FEATURES.forEach((confName) => {
		conf[confName] = false;
	});
}

function openOnboarding() {
	// Open onboarding
	openNewTab({ url: chrome.runtime.getURL('/app/templates/onboarding.html?renew=1'), become_active: true });
}

export default async function renew() {
	if (
		ABTest.hasTest('terms') &&
		conf.setup_complete &&
		!conf.enable_human_web &&
		!intervalId
	) {
		let { renew_setup } = await browser.storage.local.get(['renew_setup']);
		const now = Date.now();

		if (!renew_setup) {
			renew_setup = now + _14_DAYS_IN_MS;
			browser.storage.local.set({ renew_setup });
		}

		if (now > renew_setup) {
			revoke();
			openOnboarding();
			return;
		}

		// Setup showing the popup every hour
		intervalId = setInterval(async () => {
			if (Date.now() > renew_setup) {
				revoke();
				openOnboarding();
				return;
			}

			// Clean up the listener if there was no navigation the last time
			if (callback) {
				browser.webNavigation.onDOMContentLoaded.removeListener(callback);
			}

			callback = (details) => {
				if (details.frameId === 0 && details.url.match(/^https?/)) {
					// Clean up current listener
					browser.webNavigation.onDOMContentLoaded.removeListener(callback);

					browser.tabs.sendMessage(details.tabId, { action: 'renew:show', timestamp: renew_setup });
				}
			};

			browser.webNavigation.onDOMContentLoaded.addListener(callback);
		}, 1000 * 60 * 60);
	}
}

browser.runtime.onMessage.addListener((msg) => {
	if (msg.action === 'renew:revoke') {
		openOnboarding();
	} else if (msg.name === 'setup_complete' || msg.name === 'setup_skip') {
		if (msg.name === 'setup_skip') {
			revoke();
		}

		clearInterval(intervalId);
		if (callback) browser.webNavigation.onDOMContentLoaded.removeListener(callback);
		browser.storage.local.remove(['renew_setup']);
	}
});
