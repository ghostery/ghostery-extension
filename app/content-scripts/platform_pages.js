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
const { sendMessage, sendMessageInPromise } = msg;
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
		// alert background that this content script has loaded
		sendMessage('platformPageLoaded');
		window.addEventListener('getExtId', () => {
			sendMessageInPromise('getExtId')
				.then((extId) => {
					const sendExtId = new CustomEvent('sendExtId', { detail: extId });
					window.dispatchEvent(sendExtId);
				});
		});
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

if (document.readyState === 'complete'
	|| document.readyState === 'loaded'
	|| document.readyState === 'interactive'
) {
	PlatformPagesContentScript.init();
} else {
	window.addEventListener('load', () => {
		PlatformPagesContentScript.init();
	});
}
