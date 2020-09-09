/**
 * Ghostery Debug Class
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import abtest from './ABTest';
import account from './Account';
import confData from './ConfData';
import globals from './Globals';
import tabInfo from './TabInfo';
import foundBugs from './FoundBugs';
import { alwaysLog } from '../utils/common';
import { getObjectSlice } from '../utils/utils';

/**
 * @class for debugging Ghostery via the background.js console.
 * @memberof BackgroundClasses
 */

/*
	Ghostery: {
  modules : {
	globals: {},
	conf: {},
	...
  },
  actions: {
	enableDebugging: function(),
	triggerABTest(),
	...
  }
}
	 */
class GhosteryDebug {
	constructor() {
		this.isLog = chrome.runtime.getManifest().debug || false;

		this.modules = {
			globals: {},
			conf: {},
		};

		this.actions = {
			getABTests: () => abtest.getTests(),
			getConfData: slice => getObjectSlice(confData, slice),
			getGlobals: slice => getObjectSlice(globals, slice),
			hitABServerWithIr: ir => abtest.fetch(ir),
			toggleLogging: () => this._toggleLogging(),
		};

		this.accountEvents = [];
		this.browserInfo = globals.BROWSER_INFO;
		this.extensionInfo = {
			name: globals.EXTENSION_NAME,
			version: globals.EXTENSION_VERSION,
		};
		this.globals = { ...globals };

		const _cookieChangeEvent = (changeInfo) => {
			const { removed, cookie, cause } = changeInfo;
			const { domain, name } = cookie;
			if (domain.includes(globals.GHOSTERY_ROOT_DOMAIN)) {
				const type = `Cookie ${name} ${removed ? 'Removed' : 'Added'}`;
				this.addAccountEvent(type, cause, cookie);
			}
		};

		// Chrome Documentation: https://developer.chrome.com/extensions/cookies#event-onChanged
		// Mozilla Documentation: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/onChanged
		chrome.cookies.onChanged.addListener(_cookieChangeEvent);
	}

	help() {
		alwaysLog(
			'\nTHIS IS THE HELP SCREEN\n',
			`Log setting: ${this.isLog ? 'ON' : 'OFF'}`,
		);

		return ('~~~~~~~~~');
	}

	status() {
		alwaysLog(
			`\nLogging: ${this.isLog ? 'ON' : 'OFF'}`
		);

		return ('~~~~~~~~~');
	}

	_toggleLogging() {
		this.isLog = !this.isLog;

		return (`Logging is ${this.isLog ? 'ON' : 'OFF'}`);
	}

	init() {
		this.extensionInfo.installDate = confData.install_date;
		this.extensionInfo.versionHistory = confData.version_history;
		this.configurationData = { ...confData };
	}

	addAccountEvent(type, event, details) {
		const timestamp = new Date();
		const pushObj = { type, event, timestamp };
		if (details) {
			pushObj.details = details;
		}

		this.accountEvents.push(pushObj);
	}

	/**
	 * TODO: Review / revise this
	 * this.tabInfo[tabId] properties update without re-calling getTabInfo.
	 * this.foundApps[tabId].foundApps properties update without re-calling getTabInfo.
	 * this.foundApps[tabId].foundBugs properties update without re-calling getTabInfo.
	 *   No need to call `window.GHOSTERY.getTabInfo()` to see changes to object properties.
	 *   You will need to call `window.GHOSTERY` again to see changes as console object
	 *   properties are fixed to when the object was read by the console.
	 *   Only object properties will update, no new tabIds will be added.
	 *   Reloading the tab will end these updates.
	 */
	getActiveTabInfoAsync() {
		function _getActiveTabIds() {
			return new Promise((resolve) => {
				chrome.tabs.query({
					active: true,
				}, (tabs) => {
					if (chrome.runtime.lastError) {
						return resolve(chrome.runtime.lastError.message);
					}
					const tabIds = tabs.map(tab => tab.id);
					return resolve(tabIds);
				});
			});
		}

		alwaysLog('Results will be in the `activeTabInfo` property when the Promise resolves');

		return new Promise((resolve) => {
			_getActiveTabIds().then((tabIds) => {
				this.activeTabInfo = {
					activeTabIds: tabIds,
					tabInfo: { ...tabInfo._tabInfo },
					foundBugs: {
						foundApps: { ...foundBugs._foundApps },
						foundBugs: { ...foundBugs._foundBugs },
					},
				};
				resolve(tabIds);
			});
		});
	}

	getUserData() {
		function _getUserCookies() {
			return new Promise((resolve) => {
				chrome.cookies.getAll({
					url: globals.COOKIE_URL,
				}, resolve);
			});
		}

		function _getUser() {
			return new Promise((resolve) => {
				account.getUser().then(resolve).catch(resolve);
			});
		}

		function _getUserSettings() {
			return new Promise((resolve) => {
				account.getUserSettings().then(resolve).catch(resolve);
			});
		}

		function _getUserSubscriptionData() {
			return new Promise((resolve) => {
				account.getUserSubscriptionData().then(resolve).catch(resolve);
			});
		}

		return new Promise((resolve) => {
			Promise.all([
				_getUserCookies(),
				_getUser(),
				_getUserSettings(),
				_getUserSubscriptionData(),
			]).then(([userCookies, userData, syncedUserSettings, userSubscriptionData]) => {
				this.user = {
					userCookies,
					userData,
					syncedUserSettings,
					userSubscriptionData,
				};
				resolve(this.user);
			});
		});
	}

	getDebugInfo() {
		return new Promise((resolve) => {
			Promise.all([
				this.getTabInfo(),
				this.getUserData(),
			]).then(() => {
				resolve(this);
			});
		});
	}
}

const ghosteryDebug = new GhosteryDebug();
export default ghosteryDebug;

// extracted to minimize import surface into utils/common.js
export const isLog = () => ghosteryDebug.isLog;
