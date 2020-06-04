/**
 * Message Helper for Content Scripts
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
 * @namespace ContentScriptUtils
 */
import { log } from '../../../src/utils/common';
import { sendMessageInPromise as panelSendPromiseMessage, sendMessage as panelSendMessage } from '../../panel/utils/msg';

/**
 * Message wrapper function
 * @param  {string} origin 		content script origin
 * @return {Object}				set of APIs for handling messages
 */
export default function(origin) {
	/**
	 * Send a message wrapped in a promise.
	 * @memberOf  ContentScriptUtils
	 *
	 * @param  {string} 	name 		message name
	 * @param  {Object} 	message 	message data
	 * @return {Promise}				response or null
	 */
	function sendMessageInPromise(name, message) {
		return panelSendPromiseMessage(name, message, origin);
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
		panelSendMessage(name, message, origin, callback);
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
		panelSendMessage(name, message, '', callback);
	}

	return {
		sendMessageInPromise,
		sendMessage,
		sendMessageToBackground,
	};
}
