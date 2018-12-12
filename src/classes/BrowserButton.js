/**
 * Browser Button Class
 *
 * Manages the browser's badge icon, text and title
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

import conf from './Conf';
import foundBugs from './FoundBugs';
import cliqz from './Cliqz';
import rewards from './Rewards';
import Policy from './Policy';
import { getTab } from '../utils/utils';
import { log } from '../utils/common';
import globals from './Globals';

const { adblocker, antitracking } = cliqz.modules;

/**
 * @class for handling Ghostery button.
 * @memberof BackgroundClasses
 */
class BrowserButton {
	constructor() {
		this.backgrounds = {
			alert: [255, 157, 0, 230],
			default: [51, 0, 51, 230]
		};
		this.policy = new Policy();
	}

	/**
	 * Update the Ghostery icon in the browser toolbar
	 * @param  {number} tabId		tab id
	 */
	update(tabId) {
		// Update this specific tab
		if (tabId) {
			// In ES6 classes, we need to bind context to callback function
			getTab(tabId, this._getIconCount.bind(this), (err) => {
				log('Button.update failed', err);
			});
		} else {
			// No tab ID was provided: update all active tabs
			chrome.tabs.query({
				active: true
			}, (tabs) => {
				// catch errors in case the tab no longer exists
				if (chrome.runtime.lastError) {
					log('chrome.tabs.query', chrome.runtime.lastError.message);
					return;
				}
				// map each tab to _getIconCount
				tabs.map(this._getIconCount.bind(this));
			});
		}
	}

	/**
	 * Set Ghostery icon in toolbar. We use a callback function in
	 * `chrome.browserAction.setIcon` to catch errors caused by closing
	 * multiple tabs at once.
	 *
	 * @private
	 *
	 * @param 	{boolean}	active			is Ghostery currently active / blocking enabled?
	 * @param 	{number} 	tabId			tab id
	 * @param 	{number}	trackerCount	current tracker count
	 * @param 	{boolean}	alert			is it a special case which requires button to change its background color?
	 */
	_setIcon(active, tabId, trackerCount, alert) {
		chrome.runtime.sendMessage({
			target: 'ANDROID_BROWSER',
			action: 'setIcon',
			payload: {
				text: trackerCount,
				tabId
			}
		});

		if (globals.BROWSER_INFO.os === 'android') { return; }
		if (tabId <= 0) { return; }

		const iconAlt = (!active) ? '_off' :
			(conf.enable_offers && rewards.unreadOfferIds.length > 0) ? '_star' : '';

		chrome.browserAction.setIcon({
			path: {
				19: `app/images/icon19${iconAlt}.png`,
				38: `app/images/icon38${iconAlt}.png`
			},
			tabId
		}, () => {
			if (chrome.runtime.lastError) {
				log('chrome.browserAction.setIcon', chrome.runtime.lastError);
			} else {
				// Because setBadgeText() and setBadgeBackgroundColor() don't
				// provide callbacks, we must check that the tab exists again to compensate for a race
				// condition that occurs if a user closes the tab while the trackers are still loading
				getTab(tabId, () => {
					// @EDGE setTitle not currently supported by EDGE
					if (typeof chrome.browserAction.setTitle === 'function') {
						chrome.browserAction.setTitle({
							title: chrome.i18n.getMessage('browser_button_tooltip'),
							tabId
						});
					}

					// Only show the badge if the conf setting allows it
					if (conf.show_badge) {
						// Don't show badgeText when there is a new reward and Ghostery is active
						// Otherwise set the tracker count to the badgeText
						const text = (conf.enable_offers && rewards.unreadOfferIds.length && active) ? '' : trackerCount;
						chrome.browserAction.setBadgeText({ text, tabId });

						// Set badge background color
						chrome.browserAction.setBadgeBackgroundColor({
							color: (alert ? this.backgrounds.alert : this.backgrounds.default),
							tabId
						});
					}
				});
			}
		});
	}

	/**
	 * Query foundbugs for any bugs on this tab
	 * and pass to _setIcon
	 *
	 * @private
	 *
	 * @param  {Object} tab 	tab object passed through via callback function
	 */
	_getIconCount(tab) {
		const tabId = tab.id;
		let	trackerCount = '';
		let alert = false;

		// Get tracker count for badgeText
		if (foundBugs.getBugs(tabId) === false) {
			// if no cached bug discovery data then:
			// 	+ Ghostery was enabled after the tab started loading
			// 	+ or, this is a tab onBeforeRequest doesn't run in (non-http/https page)
			trackerCount = '';
			this._setIcon(false, tabId, trackerCount, alert);
			return;
		}

		this._getAntiTrackCount(tabId).then((antiTrackingCount) => {
			const { appsCount, appsAlertCount } = this._getTrackerCount(tabId);
			const adBlockingCount = this._getAdBlockCount(tabId);

			alert = (appsAlertCount > 0);
			trackerCount = (appsCount + antiTrackingCount + adBlockingCount).toString();

			// gray-out the icon when blocking has been disabled for whatever reason
			if (trackerCount === '') {
				this._setIcon(false, tabId, trackerCount, alert);
			} else {
				this._setIcon(!globals.SESSION.paused_blocking && !this.policy.whitelisted(new URL(tab.url).hostname), tabId, trackerCount, alert);
			}
		});
	}

	/**
	 * Gets tracker count the traditional way, from BugDb
	 * @param  {number} tabId  the Tab Id
	 * @param  {string} tabUrl the Tab URL
	 * @return {Object}        the number of total trackers and alerted trackers in an Object
	 */
	_getTrackerCount(tabId, tabUrl) {
		const apps = foundBugs.getAppsCountByIssues(tabId, tabUrl);
		return {
			appsCount: apps.all,
			appsAlertCount: apps.total,
		};
	}

	/**
	 * Get tracker count for Anti Tracking in a promise
	 * @param  {number} tabId  the Tab Id
	 * @return {Promise}       the number of trackers as a Promise
	 */
	_getAntiTrackCount(tabId) {
		return new Promise((resolve) => {
			if (!conf.enable_anti_tracking || !antitracking.background) {
				resolve(0);
			}
			antitracking.background.actions.aggregatedBlockingStats(tabId).then((antiTracking) => {
				let totalUnsafeCount = 0;
				for (const category in antiTracking) {
					if (antiTracking.hasOwnProperty(category)) {
						for (const app in antiTracking[category]) {
							if (antiTracking[category][app] === 'unsafe') {
								totalUnsafeCount++;
							}
						}
					}
				}
				resolve(totalUnsafeCount);
			}).catch(() => {
				// if we encounter an error, return 0
				resolve(0);
			});
		});
	}

	/**
	 * Get tracker count for Ad Blocking
	 * @param  {number} tabId  the Tab Id
	 * @return {number}        the number of trackers in an object
	 */
	_getAdBlockCount(tabId) {
		if (!conf.enable_ad_block || !adblocker.background) {
			return 0;
		}
		const adBlocking = adblocker.background.actions.getAdBlockInfoForTab(tabId);
		return adBlocking && adBlocking.totalCount || 0;
	}
}

export default new BrowserButton();
