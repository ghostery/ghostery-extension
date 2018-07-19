/**
 * Ghostery Platform & ExtensionWeb Events
 *
 * This file connects the extension to all ExtensionWeb and Platform
 * pages (extension, account, signon)
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
/**
 * @namespace PlatformPagesContentScript
 */
import msgModule from './utils/msg';

const msg = msgModule('platform_pages');
const { sendMessage, sendMessageToBackground } = msg;
/**
 * Use to call init to initialize functionality
 * @var  {Object} initialized to an object with init method as its property
 */
const PlatformPagesContentScript = (function (window, document) {
	/**
	 * Initialize functionality of this script.
	 * @memberOf PlatformPagesContentScript
	 * @package
	 */
	const _initialize = function () {
		// Add listener to logout-link in platform header
		let logoutLink = document.getElementsByClassName('logout-link');
		logoutLink = logoutLink ? logoutLink[0] : null;
		if (logoutLink) {
			logoutLink.addEventListener('click', (e) => {
				sendMessageToBackground('account.logout'); // send empty object to log out
			});
		}
		// Add listener to cancelModal
		const cancelDialog = document.getElementById('cancelModal');
		if (cancelDialog) {
			let yesButton = cancelDialog.getElementsByClassName('button blue float-right');
			yesButton = yesButton ? yesButton[0] : null;
			if (yesButton) {
				yesButton.addEventListener('click', (e) => {
					sendMessageToBackground('account.logout'); // send empty object to log out
				});
			}
		}
		// alert background that this content script has loaded
		sendMessage('platformPageLoaded');
	};

	return {
		/**
		 * Initialize functionality of this script.
		 * @memberOf PlatformPagesContentScript
		 * @public
		 */
		init() {
			_initialize();
		}
	};
}(window, document));

window.addEventListener('load', () => {
	PlatformPagesContentScript.init();
});
