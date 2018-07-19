import Spanan from 'spanan';

export class ExtMessenger {
	addListener(fn) {
		chrome.runtime.onMessageExternal.addListener(fn);
	}

	removeListener(fn) {
		chrome.runtime.onMessageExternal.removeListener(fn);
	}

	sendMessage(extensionId, message) {
		chrome.runtime.sendMessage(extensionId, message, () => {});
	}
}

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
			console.error('unhandled message', message);
		}
		this.moduleWrappers.get(message.moduleName).handleMessage(message);
	}
}
