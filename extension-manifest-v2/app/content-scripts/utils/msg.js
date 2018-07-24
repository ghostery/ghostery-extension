/**
 * Message Helper for Content Scripts
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
 * @namespace ContentScriptUtils
 */
/* eslint no-use-before-define: 0 */

import globals from '../../../src/classes/Globals';
import { log } from '../../../src/utils/common';

/**
 * Message wrapper function
 * @param  {string} origin 		content script origin
 * @return {Object}				set of APIs for handling messages
 */
export default function (origin) {
	const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
	const { onMessage } = chrome.runtime;

	/**
	 * Send a message wrapped in a promise.
	 * @memberOf  ContentScriptUtils
	 *
	 * @param  {string} 	name 		message name
	 * @param  {Object} 	message 	message data
	 * @return {Promise}				response or null
	 */
	function sendMessageInPromise(name, message) {
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
					origin,
					messageId,
				}, () => {});
			});
		}
		return new Promise(((resolve) => {
			chrome.runtime.sendMessage({
				name,
				message,
				origin,
			}, (response) => {
				if (chrome.runtime.lastError) {
					log(chrome.runtime.lastError, origin, name, message);
					resolve(null);
				}
				resolve(response);
			});
		}));
	}

	/**
	 * Send a message with an 'origin' parameter. This
	 * will be picked up by handlers of messages coming from different context scripts.
	 * @memberOf  ContentScriptUtils
	 *
	 * @param  {string} 	name 		message name
	 * @param  {Object} 	message 	message data
	 * @param  {function} 	[callback] 	callback called by the message recipient
	 */
	function sendMessage(name, message, callback) {
		log(`origin ${origin} sending to handler`, name);
		_sendMessageToHandler(name, origin, message, callback);
	}

	/**
	 * Send a message without an `origin` parameter. This will
	 * be picked up by the general onMessageHandler in src/background.
	 * @memberOf  ContentScriptUtils
	 *
	 * @param  {string} 	name 		message name
	 * @param  {Object} 	message 	message data
	 * @param  {function} 	[callback] 	callback called by the message recipient
	 */
	function sendMessageToBackground(name, message, callback) {
		log(`origin ${origin} sending to background onMessageHandler`, name);
		_sendMessageToHandler(name, '', message, callback);
	}

	/**
	 * Send a message without an `origin` parameter. This will
	 * be picked up by the general onMessageHandler in src/background.
	 *
	 * @private
	 *
	 * @param  {string} 	name 		message name
	 * @param  {string} 	source 		message origin
	 * @param  {Object} 	message 	message data
	 * @param  {function} 	[callback] 	callback called by the message recipient
	 */
	function _sendMessageToHandler(name, source, message, callback = function () {}) {
		log(`_sendMessageToHandler:${source} sending to background`, name);
		// @EDGE chrome.runtime.sendMessage(message) works, but
		// const callback; chrome.runtime.sendMessage(message, callback) fails to
		// execute and chrome.runtime.lastError is undefined.
		chrome.runtime.sendMessage({
			name,
			message,
			origin: source, // prevents eslint no-shadow
		}, callback);
	}

	return {
		sendMessageInPromise,
		sendMessage,
		sendMessageToBackground,
	};
}
