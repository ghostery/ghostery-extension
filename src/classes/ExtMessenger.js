/**
 * Extension Messenger
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

import { log } from '../utils/common';

/**
 * Factory class for messaging handlers
 * @memberOf  BackgroundClasses
 */
export default class ExtMessenger {
	static addListener(fn) {
		chrome.runtime.onMessageExternal.addListener(fn);
	}

	static removeListener(fn) {
		chrome.runtime.onMessageExternal.removeListener(fn);
	}

	static sendMessage(extensionId, message) {
		chrome.runtime.sendMessage(extensionId, message, () => {
			if (chrome.runtime.lastError) {
				log('ExtMessenger sendMessage error:', chrome.runtime.lastError);
			}
		});
	}
}
