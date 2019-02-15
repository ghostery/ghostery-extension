/**
 * Panel Data Class
 *
 * Handles data passed to the panel, and manages state by fetching
 * from Conf via Dispatcher events.
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

import _ from 'underscore';
import button from './BrowserButton';
import conf from './Conf';
import foundBugs from './FoundBugs';
import bugDb from './BugDb';
import globals from './Globals';
import Policy from './Policy';
import tabInfo from './TabInfo';
import rewards from './Rewards';
import account from './Account';
import dispatcher from './Dispatcher';
import { getActiveTab, flushChromeMemoryCache, processUrl } from '../utils/utils';
import { objectEntries, log } from '../utils/common';

const SYNC_SET = new Set(globals.SYNC_ARRAY);
const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const { IS_CLIQZ } = globals;
const policy = new Policy();

/**
 * PanelData coordinates the assembly and transmission of data to the extension panel
 * @memberOf  BackgroundClasses
 */
class PanelData {
	/**
	 * Create private instance varialbes for use behind public setters
	 * @return {Object}
	 */
	constructor() {
		this._uiPorts = new Map();
		this._activeTab = null;
	}

	initUIPort(port) {
		getActiveTab((tab) => {
			const { name } = port;

			// first time a port is being opened for a particular tab
			if (name === 'panelUIPort' && this._activeTab !== tab) {
				console.log('IVZ sending initData from initUIPort');
				this._activeTab = tab;
				port.postMessage(this.initData);
				account.getUserSettings().catch(err => log('Failed getting user settings from getPanelData:', err));
			}

			if (name === 'settingsUIPort') {
				port.postMessage(this.settingsView);
			}

			port.onDisconnect.addListener((p) => {
				console.log(`IVZ popup port DISCONNECTED: ${p.name}`);
				this._uiPorts.delete(p.name);
			});

			console.log(`IVZ popup CONNECTED with port: ${port.name}`);

			this._uiPorts.set(name, port);
			this._uiPorts.get(name).postMessage('BANANAS FOSTER to you from background!');
		});
	}

	updatePanelUI() {
		if (!this._activeTab) { return; }

		this._uiPorts.forEach((port) => {
			const { name } = port;
			switch (name) {
				case 'blockingUIPort':
					port.postMessage(this.blockingView);
					break;
				case 'panelUIPort':
					port.postMessage(this.panelUpdateView);
					break;
				case 'summaryUIPort':
					port.postMessage(this.summaryUpdateView);
					break;
				default:
					break;
			}
		});
	}

	/**
	 * Get PanelData for a specific view/tab
	 * @param  {string} view 	panel view name
	 * @param  {Object} tab 	tab
	 * @return {Object}      	view data
	 */
	// TODO not using this for initial panel data retrieval anymore, so see if we can unplug it from the rest and remove it altogether
	get(view, tab) {
		console.log('IVZ tab passed to PanelData#get:');
		console.log(tab);

		log(`Get data for ${view} view`);

		switch (view) {
			case 'blocking': // no longer used
				return this.blockingView;
			case 'rewards':
				return this.rewardsView;
			case 'settings': // no longer used
				return this.settingsView;
			case 'summary': // no longer used
				return this.summaryView;
			default:
				return false;
		}
	}

	/**
	 * Update Conf properties with new data from the UI.
	 * Called via setPanelData message.
	 * @param  {Object} data
	 */
	set(data) {
		let syncSetDataChanged = false;
		let otherDataChanged = false;

		if (IS_EDGE) {
			data.enable_human_web = false;
			data.enable_offers = false;
		}
		if (IS_CLIQZ) {
			data.enable_human_web = false;
			data.enable_offers = false;
			data.enable_ad_block = false;
			data.enable_anti_tracking = false;
		}

		// Set the conf from data
		for (const [key, value] of objectEntries(data)) {
			if (conf.hasOwnProperty(key) && !_.isEqual(conf[key], value)) {
				conf[key] = value;
				if (SYNC_SET.has(key)) {
					syncSetDataChanged = true;
				} else {
					otherDataChanged = true;
				}
			} else if (key === 'paused_blocking') {
				if (typeof value === 'number') {
					// pause blocking
					globals.SESSION.paused_blocking = true;
					globals.SESSION.paused_blocking_timeout = value;
					// enable after timeout
					setTimeout(() => {
						globals.SESSION.paused_blocking = false;
						// update button
						button.update();
						flushChromeMemoryCache();
						dispatcher.trigger('globals.save.paused_blocking');
					}, value);
				} else {
					// toggle blocking
					globals.SESSION.paused_blocking = value;
					globals.SESSION.paused_blocking_timeout = 0;
				}

				// update button
				button.update();
				flushChromeMemoryCache();
				dispatcher.trigger('globals.save.paused_blocking');
			}
		}

		if (data.needsReload) {
			getActiveTab((tab) => {
				if (tab && tab.id && tabInfo.getTabInfo(tab.id)) {
					tabInfo.setTabInfo(tab.id, 'needsReload', data.needsReload);
				}
			});
		}

		if (syncSetDataChanged) {
			// Push conf changes to the server
			account.saveUserSettings().catch(err => log('PanelData saveUserSettings', err));
		}

		if (otherDataChanged) {
			// update local _confData.
			// if only SYNC_SET data changed _buildConfData will be called through init in dispatch
			this._buildConfData();
		}
	}

	get initData() {
		const currentAccount = conf.account;
		if (currentAccount && currentAccount.user) {
			currentAccount.user.subscriptionsPlus = account.hasScopesUnverified(['subscriptions:plus']);
		}
		const { id } = this._activeTab;
		const { needsReload, smartBlock } = tabInfo.getTabInfo(id);

		return {
			panel: {
				enable_ad_block: conf.enable_ad_block,
				enable_anti_tracking: conf.enable_anti_tracking,
				enable_smart_block: conf.enable_smart_block,
				enable_offers: conf.enable_offers,
				is_expanded: conf.is_expanded,
				is_expert: conf.is_expert,
				is_android: globals.BROWSER_INFO.os === 'android',
				language: conf.language,
				reload_banner_status: conf.reload_banner_status,
				trackers_banner_status: conf.trackers_banner_status,
				current_theme: conf.current_theme,

				needsReload,
				smartBlock,
				tab_id: id,

				unread_offer_ids: rewards.unreadOfferIds,

				account: currentAccount
			},
			summary: this.summaryView,
			blocking: conf.is_expert ? this.blockingView : false,
		};
	}

	/**
	 * Get conf and tracker data for Summary View
	 * @return {Object}		Summary view data
	 */
	get summaryView() {
		const tab = this._activeTab;
		if (!tab) return {};

		const { id, url } = tab;
		const pageHost = url && processUrl(url).host || '';
		const trackerList = foundBugs.getApps(id, false, url) || [];

		return {
			paused_blocking: globals.SESSION.paused_blocking,
			paused_blocking_timeout: globals.SESSION.paused_blocking_timeout,
			site_blacklist: conf.site_blacklist,
			site_whitelist: conf.site_whitelist,

			// TODO substitute return value from summaryUpdateView for part of this to avoid code duplication
			alertCounts: tab && foundBugs.getAppsCountByIssues(id, url) || {},
			// TODO memoize the result of this._buildCategories ?
			categories: this._buildCategories(id, url, pageHost, trackerList),
			pageHost,
			pageUrl: url || '',
			performanceData: tabInfo.getTabInfo(id, 'pageTiming'),
			siteNotScanned: !trackerList || false,
			sitePolicy: policy.getSitePolicy(url) || false,
			trackerCounts: foundBugs.getAppsCountByBlocked(id) || {}
		};
	}

	get panelUpdateView() {
		const { id } = this._activeTab;
		const { needsReload, smartBlock } = tabInfo.getTabInfo(id);
		return {
			needsReload,
			smartBlock
		};
	}

	get summaryUpdateView() {
		const { id, url } = this._activeTab;
		const page_host = url && processUrl(url).host || '';
		const trackerList = foundBugs.getApps(id, false, url) || [];

		return {
			alertCounts: foundBugs.getAppsCountByIssues(id, url) || {},
			categories: this._buildCategories(id, url, page_host, trackerList),
			performanceData: tabInfo.getTabInfo(id, 'pageTiming'),
			trackerCounts: foundBugs.getAppsCountByBlocked(id) || {}
		};
	}

	/**
	 * Get conf and tracker data for Blocking View
	 * @return {Object}		Blocking view data
	 */
	get blockingView() {
		const tab = this._activeTab;
		if (!tab) { return {}; }

		const { id, url } = tab;
		const pageHost = url && processUrl(url).host || '';
		const trackerList = foundBugs.getApps(id, false, url) || [];

		return {
			expand_all_trackers: conf.expand_all_trackers,
			selected_app_ids: conf.selected_app_ids,
			show_tracker_urls: conf.show_tracker_urls,
			site_specific_blocks: conf.site_specific_blocks,
			site_specific_unblocks: conf.site_specific_unblocks,
			toggle_individual_trackers: conf.toggle_individual_trackers,
			siteNoteScanned: !trackerList || false,
			pageUrl: url,
			categories: this._buildCategories(id, url, pageHost, trackerList)
		};
	}

	/**
	 * Get rewards data for the Rewards View
	 * @return {Object} Rewards view data
	 */
	get rewardsView() {
		return {
			enable_offers: conf.enable_offers,
			rewards: rewards.storedOffers,
			unread_offer_ids: rewards.unreadOfferIds,
		};
	}

	/**
	 * Get conf and tracker data for Settings View. Note we have overlapping properties
	 * from blockView incase the user is in Simple Mode.
	 * @return {Object}		Settings View data
	 */
	get settingsView() {
		return {
			// custom
			categories: this._buildGlobalCategories(),
			offer_human_web: !IS_EDGE,

			// properties on conf
			alert_bubble_pos: conf.alert_bubble_pos,
			alert_bubble_timeout: conf.alert_bubble_timeout,
			block_by_default: conf.block_by_default,
			bugs_last_updated: conf.bugs_last_updated,
			enable_autoupdate: conf.enable_autoupdate,
			enable_click2play: conf.enable_click2play,
			enable_click2play_social: conf.enable_click2play_social,
			enable_human_web: conf.enable_human_web,
			enable_offers: conf.enable_offers,
			enable_metrics: conf.enable_metrics,
			hide_alert_trusted: conf.hide_alert_trusted,
			ignore_first_party: conf.ignore_first_party,
			notify_library_updates: conf.notify_library_updates,
			notify_upgrade_updates: conf.notify_upgrade_updates,
			selected_app_ids: conf.selected_app_ids,
			new_app_ids: conf.new_app_ids,
			settings_last_imported: conf.settings_last_imported,
			settings_last_exported: conf.settings_last_exported,
			show_alert: conf.show_alert,
			show_badge: conf.show_badge,
			show_cmp: conf.show_cmp,
			show_tracker_urls: conf.show_tracker_urls,
			toggle_individual_trackers: conf.toggle_individual_trackers,
			language: conf.language // required for the setup page that does not have access to panelView data
		};
	}

	/**
	 * Build category array for all trackers in DB. Used in Settings > Global Blocking
	 * @private
	 * @return {array} 			array of categories
	 */
	_buildGlobalCategories() {
		const categories = bugDb.db.categories || [];
		const selectedApps = conf.selected_app_ids || {};
		categories.forEach((category) => {
			const { trackers } = category;
			category.num_blocked = 0;
			trackers.forEach((tracker) => {
				tracker.blocked = selectedApps.hasOwnProperty(tracker.id);
				if (tracker.blocked) {
					category.num_blocked++;
				}
			});
		});
		return categories;
	}

	/**
	 * Build tracker categories based on the current trackerList for a given tab_id.
	 *
	 * @private
	 *
	 * @param  {number}   tab_id			tab id
	 * @param  {strng} tab_url			tab url
	 * @param  {strng} pageHost			tab url host
	 * @param  {Object} trackerList		list of trackers for the tab
	 * @return {array} 					array of categories
	 */
	_buildCategories(tab_id, tab_url, pageHost, trackerList) {
		const selectedAppIds = conf.selected_app_ids;
		const pageUnblocks = conf.site_specific_unblocks[pageHost] || [];
		const pageBlocks = conf.site_specific_blocks[pageHost] || [];
		const categories = {};
		const categoryArray = [];
		const smartBlockActive = conf.enable_smart_block;
		const smartBlock = tabInfo.getTabInfo(tab_id, 'smartBlock');

		trackerList.forEach((tracker) => {
			let category = tracker.cat;
			const blocked = selectedAppIds.hasOwnProperty(tracker.id);
			const ss_allowed = pageUnblocks.includes(+tracker.id);
			const ss_blocked = pageBlocks.includes(+tracker.id);
			const sb_blocked = smartBlockActive && smartBlock.blocked.hasOwnProperty(`${tracker.id}`);
			const sb_allowed = smartBlockActive && smartBlock.unblocked.hasOwnProperty(`${tracker.id}`);

			if (t(`category_${category}`) === `category_${category}`) {
				category = 'uncategorized';
			}

			if (categories.hasOwnProperty(category)) {
				categories[category].num_total++;
				if (ss_blocked || sb_blocked || (blocked && !ss_allowed && !sb_allowed)) {
					categories[category].num_blocked++;
				}
			} else {
				categories[category] = {
					id: category,
					name: t(`category_${category}`),
					description: t(`category_${category}_desc`),
					img_name: (category === 'advertising') ? 'adv' : // Because AdBlock blocks images with 'advertising' in the name.
						(category === 'social_media') ? 'smed' : category, // Because AdBlock blocks images with 'social' in the name.
					num_total: 1,
					num_blocked: (ss_blocked || sb_blocked || (blocked && !ss_allowed && !sb_allowed)) ? 1 : 0,
					trackers: [],
					expanded: conf.expand_all_trackers
				};
			}
			categories[category].trackers.push({
				id: tracker.id,
				name: tracker.name,
				description: '',
				blocked,
				ss_allowed,
				ss_blocked,
				shouldShow: true, // used for filtering tracker list
				catId: category,
				sources: tracker.sources,
				warningCompatibility: tracker.hasCompatibilityIssue,
				warningInsecure: tracker.hasInsecureIssue,
				warningSlow: tracker.hasLatencyIssue,
				warningSmartBlock: (smartBlock.blocked.hasOwnProperty(tracker.id) && 'blocked') || (smartBlock.unblocked.hasOwnProperty(tracker.id) && 'unblocked') || false,
			});
		});

		let	categoryName;
		for (categoryName in categories) {
			if (categories.hasOwnProperty(categoryName)) {
				categoryArray.push(categories[categoryName]);
			}
		}

		categoryArray.sort((a, b) => {
			a = a.name.toLowerCase(); // eslint-disable-line no-param-reassign
			b = b.name.toLowerCase(); // eslint-disable-line no-param-reassign
			return (a > b ? 1 : (a < b ? -1 : 0));
		});
		return categoryArray;
	}
}

// return the class as a singleton
export default new PanelData();
