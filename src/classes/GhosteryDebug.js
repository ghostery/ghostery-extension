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

import account from './Account';
import globals from './Globals';
import tabInfo from './TabInfo';
import foundBugs from './FoundBugs';

/**
 * @class for debugging Ghostery via the background.js console.
 * @memberof BackgroundClasses
 */
class GhosteryDebug {
	getTabInfo() {
		function _getActiveTabIds() {
			return new Promise((resolve, reject) => {
				chrome.tabs.query({
					active: true,
				}, (tabs) => {
					if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); }
					const tabIds = tabs.map(tab => tab.id);
					resolve(tabIds);
				});
			});
		}

		return new Promise((resolve, reject) => {
			_getActiveTabIds().then((tabIds) => {
				this.activeTabIds = tabIds;
				this.tabInfo = { ...tabInfo._tabInfo };
				this.foundBugs = {
					foundApps: { ...foundBugs._foundApps },
					foundBugs: { ...foundBugs._foundBugs },
				};
				resolve(tabIds);
			}).catch(reject);
		});
	}

	getUserData() {
		function _getUserCookies() {
			return new Promise((resolve, reject) => {
				chrome.cookies.getAll({
					url: globals.COOKIE_URL,
				}, (cookiesArr) => {
					if (cookiesArr === null) { return reject(); }
					return resolve(cookiesArr);
				});
			});
		}

		return new Promise((resolve, reject) => {
			Promise.all([
				_getUserCookies(),
				account.getUser(),
				account.getUserSettings(),
				account.getUserSubscriptionData(),
			]).then(([userCookies, userData, syncedUserSettings, userSubscriptionData]) => {
				this.user = {
					userCookies,
					userData,
					syncedUserSettings,
					userSubscriptionData,
				};
				resolve(this.user);
			}).catch(reject);
		});
	}
}

export default new GhosteryDebug();
