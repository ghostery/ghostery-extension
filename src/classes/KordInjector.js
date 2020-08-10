/**
 * Kord Injector
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
import ExtMessenger from './ExtMessenger';
import { log } from '../utils/common';

/**
 * Class for handling cross-extension messaging.
 * @memberOf  BackgroundClasses
 */
export default class KordInjector {
	constructor() {
		this.extensionId = 'cliqz@cliqz.com';
		this.moduleWrappers = new Map();
		this._messageHandler = this._messageHandler.bind(this);
	}

	init() {
		ExtMessenger.addListener(this._messageHandler);
	}

	unload() {
		ExtMessenger.removeListener(this._messageHandler);
	}

	module(moduleName) {
		if (!this.moduleWrappers.has(moduleName)) {
			this.moduleWrappers.set(moduleName, this._createModuleWrapper(moduleName));
		}
		const wrapper = this.moduleWrappers.get(moduleName);
		return wrapper.createProxy();
	}

	_createModuleWrapper(moduleName) {
		return new Spanan((m) => {
			const message = { ...m };
			message.moduleName = moduleName;
			ExtMessenger.sendMessage(this.extensionId, message);
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
