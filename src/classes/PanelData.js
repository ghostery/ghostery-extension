/**
 * Panel Data Class
 *
 * Coordinates the assembly and transmission
 * of conf, bug, Cliqz module, and reward data to the extension panel
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
import { getCliqzAdblockingData, getCliqzAntitrackingData } from '../utils/cliqzModuleData';
import { getActiveTab, flushChromeMemoryCache, processUrl } from '../utils/utils';
import { objectEntries, log } from '../utils/common';

const SYNC_SET = new Set(globals.SYNC_ARRAY);
const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const { IS_CLIQZ } = globals;
const policy = new Policy();

/**
 * PanelData coordinates the assembly and transmission of data to the extension panel
 *
 * Table of contents
 * [PORT MANAGEMENT] 	functions that handle initializing, storing, and tearing down port connections
 * [DATA TRANSFER]		functions that send data to the extension panel through existing ports
 * [DATA SETTING]		functions that set and store non-port data values	
 * @memberOf  BackgroundClasses
 */
class PanelData {
	constructor() {
		this._activeTab = null;
		this._categories = [];
		this._trackerList = [];
		this._uiPorts = new Map();
	}

	// [PORT MANAGEMENT]
	/**
	 * Invoked from background.js when Panel, Summary, Blocking, and/or Rewards React components
	 * initiate a port connection to the background in their componentDidMount lifecycle events
	 * @param 	{Object}	port	the port object passed to the onConnect listener in background.js that calls this function
	 */
	initUIPort(port) {
		getActiveTab((tab) => {
			const { name } = port;

			this._uiPorts.set(name, port);

			if (name === 'panelUIPort') {
				this._activeTab = tab;
				account.getUserSettings().catch(err => log('Failed getting user settings from PanelData#initUIPort:', err));
			}

			this._attachDisconnectListeners(name, port);

			this._sendInitialData(name, port);
		});
	}

	/**
	 * A chunk of the work that initUIPort does, broken out to increase readability
	 * @param	{string}	name	the name of the port being initialized
	 * @param	{Object}	port	the port that is being initialized
	 */
	_attachDisconnectListeners(name, port) {
		// TODO debug the rewardsUIPort disconnect listener logic so that its net effect isn't zero, heh
		if (name === 'rewardsUIPort') {
			port.onDisconnect.addListener(rewards.panelHubClosedListener);
		}

		port.onDisconnect.addListener((p) => {
			// (does the listener run?)
			if (name === 'rewardsUIPort') {
				p.onDisconnect.removeListener(rewards.panelHubClosedListener);
			}

			// The panel port disconnects when & only when the whole extension panel is closing.
			// We disconnect and throw away any remaining open ports when this happens
			// to reduce the risk of bugs and memory leaks
			if (name === 'panelUIPort') {
				this._uiPorts.forEach((leftoverPort) => {
					leftoverPort.disconnect();
				});
				this._uiPorts.clear();
				this._activeTab = null;
			} else {
				this._uiPorts.delete(name);
			}
		});
	}

	/**
	 * Another chunk of the work that initUIPort does, broken out to increase readability
	 * @param	{string}	name	the name of the port being initialized
	 * @param	{Object}	port	the port that is being initialized
	 */
	_sendInitialData(name, port) {
		if (!this._activeTab) { return; }

		switch (name) {
			case 'blockingUIPort':
				this._setTrackerListAndCategories();
				port.postMessage(this._getBlockingData());
				break;
			case 'panelUIPort':
				this._setTrackerListAndCategories();
				port.postMessage(this._getInitData());
				break;
			case 'rewardsUIPort':
				port.postMessage(this._getRewardsData());
				break;
			case 'settingsUIPort':
				port.postMessage(this._getSettingsData());
				break;
			case 'summaryUIPort':
				this._sendCliqzModulesData(port);
				this.sendPageLoadTime(this._activeTab.id);
				break;
			default:
				break;
		}
	}
	// [/PORT MANAGEMENT]

	// [DATA TRANSFER]
	/**
	 * An intent-clarifying wrapper used to call sendPageLoadTime in EventHandlers#onBeforeNavigate
	 * @param 	{number}	tab_id	
	 */
	clearPageLoadTime(tab_id) {
		this.sendPageLoadTime(tab_id, true);
	}

	/**
	 * The page_performance content script, injected by EventHandlers#onNavigationCompleted,
	 * gathers window.performance data and sends it in a message to background.js
	 * The message handler in background.js calls this function so that the data
	 * gets forwarded to the extension panel if it's open
	 * @param	{number}	tab_id
	 * @param	{boolean}	clearData	should we simply blank out the page performance data, or fetch it from tabInfo?
	 */
	sendPageLoadTime(tab_id, clearData) {
		if (!this._activeTab || this._activeTab.id !== tab_id) { return; }

		const summaryUIPort = this._uiPorts.get('summaryUIPort');
		if (!summaryUIPort) { return; }

		summaryUIPort.postMessage({
			performanceData: clearData ? false : tabInfo.getTabInfo(tab_id, 'pageTiming')
		});
	}

	/**
	 * Invoked in EventHandlers#onBeforeRequest when a new bug has been found
	 */
	updatePanelUI() {
		if (!this._activeTab) { return; }

		if (this._uiPorts.has('summaryUIPort') || this._uiPorts.has('blockingUIPort')) {
			this._setTrackerListAndCategories();
		}

		this._uiPorts.forEach((port) => {
			const { name } = port;
			switch (name) {
				case 'blockingUIPort':
					port.postMessage(this._getBlockingData());
					break;
				case 'panelUIPort':
					port.postMessage(this._getPanelUpdateData());
					break;
				case 'summaryUIPort':
					port.postMessage(this._getSummaryUpdateData());
					this._sendCliqzModulesData(port);
					break;
				default:
					break;
			}
		});
	}

	/**
	 * Get conf and tracker data for Blocking view
	 * @return {Object}		Blocking view data
	 */
	_getBlockingData() {
		return {
			expand_all_trackers: conf.expand_all_trackers,
			site_specific_blocks: conf.site_specific_blocks,
			site_specific_unblocks: conf.site_specific_unblocks,
			siteNoteScanned: !this._trackerList || false, // TODO make sure this does not change the previous logic
			pageUrl: this._activeTab.url,
			categories: this._categories,
			...this._settingsAndBlockingCommonData()
		};
	}

	/**
	 * Called when and only when the panel is first (re-)opened on a tab
	 * @return {Object}		All data fields used by the panel, summary, and blocking (if in expert mode) views
	 */
	_getInitData() {
		const currentAccount = conf.account;
		if (currentAccount && currentAccount.user) {
			currentAccount.user.subscriptionsPlus = account.hasScopesUnverified(['subscriptions:plus']);
		}
		const { id } = this._activeTab;

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
				tab_id: id,
				unread_offer_ids: rewards.unreadOfferIds,
				account: currentAccount,
				...this._getPanelUpdateData(id)
			},
			summary: this._getSummaryInitData(),
			blocking: conf.is_expert ? this._getBlockingData() : false
		};
	}

	// TODO: Determine whether needsReload and/or smartBlock ever actually change!
	/**
	 * Gets panel data that may change when a new tracker is found
	 * @param	{number}	tabId
	 * @return	{Object}	new needsReload and smartBlock values from tabInfo
	 */
	_getPanelUpdateData(tabId) {
		const id = tabId || this._activeTab.id;
		const { needsReload, smartBlock } = tabInfo.getTabInfo(id);
		return {
			needsReload,
			smartBlock
		};
	}

	// TODO check to see if this might ever need to get updated while panel is open
	// if not, does this need to be a port?
	/**
	 * Get rewards data for the Rewards View
	 * @return {Object} Rewards view data
	 */
	_getRewardsData() {
		return {
			enable_offers: conf.enable_offers,
			rewards: rewards.storedOffers,
			unread_offer_ids: rewards.unreadOfferIds,
		};
	}

	/**
	 * Get conf and tracker data for Settings View.
	 * @return {Object}		Settings View data
	 */
	_getSettingsData() {
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
			new_app_ids: conf.new_app_ids,
			settings_last_imported: conf.settings_last_imported,
			settings_last_exported: conf.settings_last_exported,
			show_alert: conf.show_alert,
			show_badge: conf.show_badge,
			show_cmp: conf.show_cmp,
			language: conf.language, // required for the setup page that does not have access to panelView data
			...this._getSettingsAndBlockingCommonData()
		};
	}

	/**
	 * Returns the data that would otherwise be missing if the settings view was opened
	 * without the blocking view having been opened first
	 * @return	{Object}	data needed by both blocking and settings views
	 */
	_getSettingsAndBlockingCommonData() {
		return {
			selected_app_ids: conf.selected_app_ids,
			show_tracker_urls: conf.show_tracker_urls,
			toggle_individual_trackers: conf.toggle_individual_trackers
		};
	}

	/**
	 * Get conf and tracker data for Summary View
	 * @return {Object}		Summary view data
	 */
	_getSummaryInitData() {
		const { id, url } = this._activeTab;
		const pageHost = url && processUrl(url).host || '';

		return {
			paused_blocking: globals.SESSION.paused_blocking,
			paused_blocking_timeout: globals.SESSION.paused_blocking_timeout,
			site_blacklist: conf.site_blacklist,
			site_whitelist: conf.site_whitelist,
			pageHost,
			pageUrl: url || '',
			siteNotScanned: this._trackerList || false,
			sitePolicy: policy.getSitePolicy(url) || false,
			...this._getSummaryUpdateData(id, url)
		};
	}

	/**
	 * Get the summary view data that may change when a new tracker is found
	 * @return {Object}		Fresh alertCounts, categories, and trackerCounts values
	 */
	_getSummaryUpdateData(tabId, tabUrl) {
		const id = tabId || this._activeTab.id;
		const url = tabUrl || this._activeTab.url;

		return {
			alertCounts: foundBugs.getAppsCountByIssues(id, url) || {},
			categories: this._categories,
			trackerCounts: foundBugs.getAppsCountByBlocked(id) || {}
		};
	}

	/** 
	 * Retrieves antitracking and adblock Cliqz data and sends it to the panel
	 * @param {Object}	port	the port to send the data through
	 */
	_sendCliqzModulesData(port) {
		const modules = { adblock: {}, antitracking: {} };
		const { id } = this._activeTab;

		modules.adblock = getCliqzAdblockingData(id);
		getCliqzAntitrackingData(id).then((antitrackingData) => {
			modules.antitracking = antitrackingData;
			port.postMessage(modules);
		}).catch(() => {
			port.postMessage(modules);
		});
	}
	// [/DATA TRANSFER]


	// [DATA SETTING]
	/** 
	 * Memoize the tracker list and categories values to reduce code duplicdation between the blocking and summary data getters, 
	 * and since these values may be accessed 2+ times in a single updatePanelUI call
	 */
	_setTrackerListAndCategories() {
		const { id, url } = this._activeTab;
		const pageHost = url && processUrl(url).host || '';
		
		this._trackerList = foundBugs.getApps(id, false, url) || [];
		this._categories = this._buildCategories(id, url, pageHost, trackerList);
	}

	/**
	 * Update Conf properties with new data from the UI.
	 * Called via setPanelData message.
	 * @param  {Object} data
	 */
	set(data) {
		let syncSetDataChanged = false;

		if (IS_EDGE || IS_CLIQZ) {
			data.enable_human_web = false;
			data.enable_offers = false;
		}
		if (IS_CLIQZ) {
			data.enable_ad_block = false;
			data.enable_anti_tracking = false;
		}

		const _pausedBlockingHelper = () => {
			button.update();
			flushChromeMemoryCache();
			dispatcher.trigger('globals.save.paused_blocking');
		};

		// Set the conf from data
		for (const [key, value] of objectEntries(data)) {
			if (conf.hasOwnProperty(key) && !_.isEqual(conf[key], value)) {
				conf[key] = value;
				if (SYNC_SET.has(key)) {
					syncSetDataChanged = true;
				}
			} else if (key === 'paused_blocking') {
				if (typeof value === 'number') {
					// pause blocking
					globals.SESSION.paused_blocking = true;
					globals.SESSION.paused_blocking_timeout = value;
					// enable after timeout
					setTimeout(() => {
						globals.SESSION.paused_blocking = false;
						_pausedBlockingHelper();
					}, value);
				} else {
					// toggle blocking
					globals.SESSION.paused_blocking = value;
					globals.SESSION.paused_blocking_timeout = 0;
				}

				_pausedBlockingHelper();
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
}

// return the class as a singleton
export default new PanelData();
