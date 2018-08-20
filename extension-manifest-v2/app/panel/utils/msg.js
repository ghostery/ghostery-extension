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
 * Send a message to the handlers in src/background wrapped in a
 * promise. This should be used for messages that require a callback.
 * @memberOf PanelUtils
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @return {Promise}
 */
export function sendMessageInPromise(name, message) {
	// On Edge 39.14965.1001.0 callback is not called when multiple
	// Edge instances running. So instead we shoot message back
	// from background. See onMessageHandler, HANDLE UNIVERSAL EVENTS HERE
	// in src/background.js.To be removed, once Edge fixed.
	if (IS_EDGE) {
		return new Promise((resolve) => {
			const messageId = (`EDGE_${window.performance.now()}`).replace('.', '_');
			onMessage.addListener((request, sender, sendResponse) => {
				if (messageId === request.name) {
					resolve(request.message);
				}
				if (sendResponse) {
					sendResponse();
				}
			});
			chrome.runtime.sendMessage({
				name,
				message,
				messageId,
			}, () => {});
		});
	}
	return new Promise(((resolve) => {
		chrome.runtime.sendMessage({
			name,
			message,
		}, (response) => {
			if (chrome.runtime.lastError) {
				log(chrome.runtime.lastError, name, message);
				resolve(null);
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
 * @param  {function} 	callback 	callback message
 * @return {Object}		response
 * @todo  runtime.sendMessage does not return any value.
 */
export function sendMessage(name, message, callback = function () {}, origin = null) {
	log('Panel sendMessage: sending to background', name);
	// @EDGE chrome.runtime.sendMessage(message) works, but
	// const callback; chrome.runtime.sendMessage(message, callback) fails to execute and chrome.runtime.lastError is undefined.
	// const fallback = function () {}; // Workaround for Edge. callback cannot be undefined.
	// callback = callback || fallback;
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
export function sendRewardMessage(name, message, callback = function () {}) {
	log('Panel sendMessage: sending to background', name);
	// @EDGE chrome.runtime.sendMessage(message) works, but
	// const callback; chrome.runtime.sendMessage(message, callback) fails to execute and chrome.runtime.lastError is undefined.
	// const fallback = function () {}; // Workaround for Edge. callback cannot be undefined.
	// callback = callback || fallback;
	return chrome.runtime.sendMessage({
		name,
		message,
		origin: 'rewardsPanel',
	}, callback);
}
