/**
 * Message Utilities
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

import globals from '../../../src/classes/Globals';
import { log } from '../../../src/utils/common';

const { onMessage } = chrome.runtime;
const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');

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
let MESSAGE_ID = 0;
const listenerSet = new Set();
const resolveMap = new Map();
const NO_ORIGIN = 'no_origin';
export function sendMessageInPromise(name, message, origin = '') {
	// On Edge 39.14965.1001.0 callback is not called when multiple
	// Edge instances are running. So instead we pass the message back
	// from background. See onMessageHandler, HANDLE UNIVERSAL EVENTS HERE
	// in src/background.js. To be removed, once Edge is fixed.
	if (IS_EDGE) {
		MESSAGE_ID++;
		const messageId = MESSAGE_ID.toString();
		return new Promise((resolve) => {
			resolveMap.set(messageId, resolve);
			const key = (origin === '') ? NO_ORIGIN : origin;
			if (!listenerSet.has(key)) {
				listenerSet.add(key);
				onMessage.addListener((request, sender, sendResponse) => {
					const callback = resolveMap.get(request.name);
					if (callback) {
						callback(request.message);
					}
					if (sendResponse) {
						sendResponse();
					}
				});
			}
			chrome.runtime.sendMessage({
				name,
				message,
				messageId,
				resolve,
				origin,
			}, () => {
				if (chrome.runtime.lastError) {
					log('sendMessageInPromise error:', chrome.runtime.lastError);
				}
			});
		});
	}
	return new Promise(((resolve) => {
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
	}));
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
	// @EDGE chrome.runtime.sendMessage(message) works, but the `callback` of
	// chrome.runtime.sendMessage(message, callback) fails to
	// execute and chrome.runtime.lastError is undefined.
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
 * Send a message to open a Subscription or Subscribe tab.
 * Which one is determined in background based on the current user state.
 * This should be used for messages that don't require a callback.
 * @memberOf PanelUtils
 */
export function openSubscriptionPage() {
	sendMessage('account.openSubscriptionPage');
	window.close();
}

/**
 * Send a message to open a Support tab
 * based on the current user state.
 * This should be used for messages that don't require a callback.
 * @memberOf PanelUtils
 */
export function openSupportPage() {
	sendMessage('account.openSupportPage');
	window.close();
}
