/**
 * Message Utilities
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

import { log } from '../../../src/utils/common';

/**
 * Default callback handler for sendMessage. Allows us to handle
 * 'Unchecked runtime.lastError: The message port closed before a response was received' errors.
 * This occurs when the `chrome.runtime.onmessage` handler returns `false` with no `callback()`
 * but `chrome.runtime.sendMessage` has been passed a default callback.
 */
const defaultCallback = () => {
	if (chrome.runtime.lastError) {
		log('defaultCallback error:', chrome.runtime.lastError);
	}
};

/**
 * Send a message to the handlers in src/background wrapped in a
 * promise. This should be used for messages that require a callback.
 * @memberOf PanelUtils
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @return {Promise}
 */
export function sendMessageInPromise(name, message, origin = '') {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({
			name,
			message,
			origin,
		}, (response) => {
			if (chrome.runtime.lastError) {
				log(chrome.runtime.lastError, name, message);
				resolve(false);
			}
			resolve(response);
		});
	});
}

/**
 * Send a message to the handlers in src/background. This should be used for
 * messages that don't require a callback.
 * @memberOf PanelUtils
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {string} 	origin	 	message origin
 * @param  {function} 	callback 	callback message
 * @return {Object}		response
 * @todo  runtime.sendMessage does not return any value.
 */
export function sendMessage(name, message, origin = '', callback = defaultCallback()) {
	log('Panel sendMessage: sending to background', name);
	return chrome.runtime.sendMessage({
		name,
		message,
		origin,
	}, callback);
}

/**
 * Send a message to the handlers in src/background relating to rewards.
 * This should be used for messages that don't require a callback.
 * @memberOf PanelUtils
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {function} 	callback 	callback message
 * @return {Object}		response
 * @todo  runtime.sendMessage does not return any value.
 */
export function sendRewardMessage(name, message, callback = defaultCallback()) {
	log('Panel sendRewardMessage: sending to background', name);
	return chrome.runtime.sendMessage({
		name,
		message,
		origin: 'rewardsPanel',
	}, callback);
}

/**
 * Handle clicks on links with a fixed destination
 */
export function handleClickOnNewTabLink(e) {
	e.preventDefault();

	let linkTag = e.target;
	while (!linkTag.href) {
		linkTag = linkTag.parentElement;
	}
	const { href } = linkTag;

	sendMessage('openNewTab', {
		url: href,
		become_active: true,
	});
}

/**
 * Send a message to open a Account.Subscription tab.
 * This should be used for messages that don't require a callback.
 * @memberOf PanelUtils
 */
export function openSubscriptionPage() {
	sendMessage('account.openSubscriptionPage');
	window.close();
}

/**
 * Send a message to open a Checkout tab.
 * This should be used for messages that don't require a callback.
 * @memberOf PanelUtils
 */
export function openCheckoutPage(utm) {
	sendMessage('account.openCheckoutPage', { utm });
	window.close();
}

/**
 * Send a message to open a Support tab based on the current user state.
 * This should be used for messages that don't require a callback.
 * @memberOf PanelUtils
 */
export function openSupportPage(e) {
	e.preventDefault();
	sendMessage('account.openSupportPage');
	window.close();
}

/**
 * Send a message to open the hub
 * This should be used for messages that don't require a callback.
 * @memberOf PanelUtils
 */
export function openHubPage(e) {
	e.preventDefault();
	sendMessage('openHubPage');
	window.close();
}
