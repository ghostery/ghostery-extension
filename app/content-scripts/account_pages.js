/**
 * Ghostery Account & ExtensionWeb Events
 *
 * This file connects the extension to all ExtensionWeb and Account
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
 * @namespace AccountPagesContentScript
 */
import msgModule from './utils/msg';

const msg = msgModule('account_pages');
const { sendMessage } = msg;
/**
 * Use to call init to initialize functionality
 * @var  {Object} initialized to an object with init method as its property
 */
const AccountPagesContentScript = (function (window) {
	/**
	 * Initialize functionality of this script.
	 * @memberOf AccountPagesContentScript
	 * @package
	 */
	const _listeners = [
		'accountPage.login',
		'accountPage.register',
		'accountPage.getUser',
		'accountPage.getUserSubscriptionData',
		'accountPage.logout',
	];
	const _initialize = function () {
		_listeners.forEach(name => window.addEventListener(name, () => sendMessage(name)));
	};

	return {
		/**
		 * Initialize functionality of this script.
		 * @memberOf AccountPagesContentScript
		 * @public
		 */
		init() {
			_initialize();
		}
	};
}(window, document));

AccountPagesContentScript.init();
