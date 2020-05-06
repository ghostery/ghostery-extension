/**
 * Ghostery Checkout Events
 *
 * This file connects the extension to all Checkout pages
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
/**
 * @namespace CheckoutPagesContentScript
 */
import msgModule from './utils/msg';

const msg = msgModule('checkout_pages');
const { sendMessage } = msg;
/**
 * Use to call init to initialize functionality
 * @var  {Object} initialized to an object with init method as its property
 */
const CheckoutPagesContentScript = (function(window) {
	/**
	 * Initialize functionality of this script.
	 * @memberOf CheckoutPagesContentScript
	 * @package
	 */
	const _listeners = [
		'checkoutPage.buyPlus',
		'checkoutPage.ping',
	];
	const _initialize = function() {
		_listeners.forEach(name => window.addEventListener(name, () => sendMessage(name)));
	};

	return {
		/**
		 * Initialize functionality of this script.
		 * @memberOf CheckoutPagesContentScript
		 * @public
		 */
		init() {
			_initialize();
		}
	};
}(window, document));

CheckoutPagesContentScript.init();
