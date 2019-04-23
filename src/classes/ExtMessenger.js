/**
 * Extension Messenger
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

import Spanan from 'spanan';
import { log } from '../utils/common';

/**
 * Factory class for messaging handlers
 * @memberOf  BackgroundClasses
 */
export class ExtMessenger {
	addListener(fn) {
		chrome.runtime.onMessageExternal.addListener(fn);
	}

	removeListener(fn) {
		chrome.runtime.onMessageExternal.removeListener(fn);
	}

	sendMessage(extensionId, message) {
		chrome.runtime.sendMessage(extensionId, message, () => {
			if (chrome.runtime.lastError) {
				log('ExtMessenger sendMessage error:', chrome.runtime.lastError);
			}
		});
	}
}

/**
 * Class for handling cross-extension messaging.
 * @memberOf  BackgroundClasses
 */
export default class KordInjector {
	constructor() {
		this.messenger = new ExtMessenger();
		this.extensionId = 'cliqz@cliqz.com';
		this.moduleWrappers = new Map();
		this._messageHandler = this._messageHandler.bind(this);
	}

	init() {
		this.messenger.addListener(this._messageHandler);
	}

	unload() {
		this.messenger.removeListener(this._messageHandler);
	}

	module(moduleName) {
		if (!this.moduleWrappers.has(moduleName)) {
			this.moduleWrappers.set(moduleName, this._createModuleWrapper(moduleName));
		}
		const wrapper = this.moduleWrappers.get(moduleName);
		return wrapper.createProxy();
	}

	_createModuleWrapper(moduleName) {
		return new Spanan((message) => {
			message.moduleName = moduleName;
			this.messenger.sendMessage(this.extensionId, message);
		});
	}

	_messageHandler(messageJSON, sender) {
		const message = JSON.parse(messageJSON);
		if (sender.id !== this.extensionId) {
			return;
		}
		if (!this.moduleWrappers.has(message.moduleName)) {
			log('KordInjector error: Unhandled message', message);
		}
		this.moduleWrappers.get(message.moduleName).handleMessage(message);
	}
}
