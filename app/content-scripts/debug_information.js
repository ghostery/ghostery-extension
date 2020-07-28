/**
 * Ghostery Debug Information ContentScript
 *
 * This file provides a way for users to view and download their debug information
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

/**
 * Set the text in this file so it can be translated.
 * Define `t` so the translation string will get picked up by `tools/token-checker.js`.
 */
const t = chrome.i18n.getMessage;
document.getElementById('debug-information').innerText = t('debug_information_load');

/**
* This message to background.js creates a return message to both this file
* and to `./notifications.js`.  To prevent a race condition, we wrap
* `... .innerText = response;` in an interval and check whether notifications.js
* has created an anchor tag before displaying debug information on the page.
*/
chrome.runtime.sendMessage({ name: 'debug_information' }, (response) => {
	const interval = setInterval(() => {
		if (document.getElementsByTagName('a').length > 0) {
			clearInterval(interval);
			document.getElementById('debug-information').innerText = response;
		}
	}, 500);
});
