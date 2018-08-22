/**
 * TabInfo Class
 *
 * this._tabInfo[tab_id]: {
 *		hash: 			{string} 	location.hash
 *		host: 			{string} 	everything from the start until the first "/"
 *		incognito: 		{boolean} 	enabled/disabled
 *		needsReload: 	{Object}	indicates that changes were made in Ghostery (pause, block, unblock) and the tab should be reloaded
 *		pageTiming		{Object}	window.performance data
 *		partialScan: 	{boolean} 	true if Ghostery was not there from the very start (main_frame load onwards)
 *		path: 			{string} 	everything after the first "/"
 *		prefetched: 	{boolean}	indicates that the tab was prefetched and not part of the main window
 *		purplebox: 		{boolean}	indicates that the purplebox.js script has been loaded on this tab
 *		protocol: 		{string} 	"http"
 *		smartBlock: 	{Object}	smart blocking stats for this tab
 * 		url: 			{string} 	full url
 * }
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

import PolicySmartBlock from './PolicySmartBlock';
import { processUrl } from '../utils/utils';

/**
 * Class for handling a map of tab objects corresponding to
 * the currently running browser tabs.
 * @memberOf  BackgroundClasses
 */
class TabInfo {
	constructor() {
		this.policySmartBlock = new PolicySmartBlock();

		// @private
		this._tabInfo = {};
		this._tabInfoPersist = {};
	}

	/**
	 * Create a new _tabInfo object
	 * @param  {number} tab_id			tab id
	 * @param  {string} tab_url		tab url
	 */
	create(tab_id, tab_url) {
		const numOfReloads = this.getTabInfoPersist(tab_id, 'numOfReloads') || 0;
		const info = {
			needsReload: { changes: {} },
			partialScan: true,
			prefetched: false,
			purplebox: false,
			rewards: false,
			timestamp: Date.now(),
			// assign only when smartBlock is enabled so avoid false positives
			// when enabling smartBlock is enabled for the first time
			firstLoadTimestamp: this.policySmartBlock.shouldCheck(tab_id) && (numOfReloads === 0 ? Date.now() : (this.getTabInfoPersist(tab_id, 'firstLoadTimestamp') || 0)) || 0,
			reloaded: this.policySmartBlock.checkReloadThreshold(tab_id),
			numOfReloads,
			smartBlock: {
				blocked: {},
				unblocked: {},
			},
			insecureRedirects: [],
		};

		this._tabInfo[tab_id] = info;
		this._updateUrl(tab_id, tab_url);
	}

	/**
	 * Getter method
	 * @param  	{number} 		tab_id		tab id
	 * @param 	{string}	property 	property name
	 * @return 	{Object}				_tabInfo data
	 */
	getTabInfo(tab_id, property) {
		if (this._tabInfo.hasOwnProperty(tab_id)) {
			if (property) {
				return this._tabInfo[tab_id][property];
			}
			return this._tabInfo[tab_id];
		}
		return false;
	}

	/**
	 * Getter method for tab parameters which we want to persist during the session.
	 * @param  {number} 	tab_id		tab id
	 * @param {string}	property 	persitant property name
	 * @return {Object}				persistent data for this tab
	 */
	getTabInfoPersist(tab_id, property) {
		if (this._tabInfoPersist.hasOwnProperty(tab_id)) {
			if (property) {
				return this._tabInfoPersist[tab_id][property];
			}
			return this._tabInfoPersist[tab_id];
		}
		return false;
	}

	/**
	 * Setter method
	 * @param {number} 	tab_id		tab id
	 * @param {string}	property 	property name
	 * @param {*} 		value 		property value
	 */
	setTabInfo(tab_id, property, value) {
		if (this._tabInfo.hasOwnProperty(tab_id)) {
			// check for 'url' property case
			if (property === 'url') {
				this._updateUrl(tab_id, value);
			} else {
				this._tabInfo[tab_id][property] = value;
			}
		}
	}

	/**
	 * Set Smart Blocking counts for this tab
	 * @param {number} 	tabId 		tab id
	 * @param {number} 	appId		tracker id
	 * @param {string} 	rule   		smart blocking rule name
	 * @param {boolean} blocked		kind of policy to set
	 */
	setTabSmartBlockAppInfo(tabId, appId, rule, blocked) {
		if (!this._tabInfo.hasOwnProperty(tabId)) { return; }

		const policy = blocked ? 'blocked' : 'unblocked';
		if (typeof this._tabInfo[tabId].smartBlock[policy][appId] === 'undefined') {
			this._tabInfo[tabId].smartBlock[policy][appId] = [];
		}
		if (this._tabInfo[tabId].smartBlock[policy][appId].indexOf(rule) === -1) {
			this._tabInfo[tabId].smartBlock[policy][appId].push(rule);
		}
	}

	/**
	 * Clear tab data for _tabInfo
	 * Persist numOfReloads and firstLoadTimestamp data to be able to detect tab reloads
	 * without using the chrome.history API
	 * @param  {number} tab_id		tab id
	 */
	clear(tab_id) {
		if (!this._tabInfo.hasOwnProperty(tab_id)) { return; }
		const { numOfReloads, firstLoadTimestamp } = this._tabInfo[tab_id];

		// TODO potential memory leak?
		this._tabInfoPersist[tab_id] = {
			numOfReloads,
			firstLoadTimestamp,
		};
		delete this._tabInfo[tab_id];
	}

	/**
	 * Handle URL property update
	 *
	 * @private
	 *
	 * @param  {number} 	tab_id		tab id
	 * @param  {string} tab_url		tab url
	 */
	_updateUrl(tab_id, tab_url) {
		const parsed = processUrl(tab_url);
		this._tabInfo[tab_id].url = tab_url;
		this._tabInfo[tab_id].protocol = parsed.protocol;
		this._tabInfo[tab_id].host = parsed.host;
		this._tabInfo[tab_id].path = parsed.path;
		this._tabInfo[tab_id].hash = parsed.anchor;
		this._tabInfo[tab_id].partialScan = false;
	}
}

// return the class as a singleton
export default new TabInfo();
