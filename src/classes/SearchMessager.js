/**
 * Search Messager
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

import ExtMessenger from './ExtMessenger';
import account from './Account';
import { log } from '../utils/common';

/**
 * @since 8.5.5
 *
 * Class for handling cross-extension messaging.
 * @memberOf  BackgroundClasses
 */
export default class SearchMessager {
	constructor() {
		this.extensionId = 'search@ghostery.com';
		this._messageHandler = this._messageHandler.bind(this);
	}

	init() {
		ExtMessenger.addListener(this._messageHandler);
	}

	unload() {
		ExtMessenger.removeListener(this._messageHandler);
	}

	_messageHandler(message, sender, sendResponse) {
		const recognized = [
			globals.GHOSTERY_SEARCH_CHROME_PRODUCTION_ID,
			globals.GHOSTERY_SEARCH_FIREFOX_PRODUCTION_ID,
		].indexOf(sender.id) !== -1;

		if (!recognized) {
			return false;
		}

		// allow search extension to refresh token
		if (message === 'refreshToken') {
			account.refreshToken()
				.then(() => sendResponse({ success: true }))
				.catch(error => sendResponse({ success: false, error }));
			return true;
		}
		log('SearchMessager error: Unhandled message', message);
		return false;
	}
}
