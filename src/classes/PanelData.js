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
				const { url } = tab;

				this._activeTab = tab;
				this._activeTab.pageHost = url && processUrl(url).host || '';

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
				console.log('IVZ panelUIPort is closing!');

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

		let blockingData;
		switch (name) {
			case 'blockingUIPort':
				this._setTrackerListAndCategories();
				blockingData = this._getBlockingData();
				console.log('IVZ sending blocking data in PanelData#_sendInitialData:');
				console.log(blockingData);
				port.postMessage(blockingData);
				// port.postMessage(this._getBlockingData());
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
			...this._getSettingsAndBlockingCommonData()
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
			needsReload: needsReload || { changes: {} },
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
		const { url, pageHost } = this._activeTab;

		return {
			paused_blocking: globals.SESSION.paused_blocking,
			paused_blocking_timeout: globals.SESSION.paused_blocking_timeout,
			site_blacklist: conf.site_blacklist,
			site_whitelist: conf.site_whitelist,
			pageHost,
			pageUrl: url || '',
			siteNotScanned: !this._trackerList || false,
			sitePolicy: policy.getSitePolicy(url) || false,
			...this._getSummaryUpdateData()
		};
	}

	/**
	 * Get the summary view data that may change when a new tracker is found
	 * @return {Object}		Fresh alertCounts, categories, and trackerCounts values
	 */
	_getSummaryUpdateData() {
		const { id, url } = this._activeTab;

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

		// Set the conf from data
		for (const [key, value] of objectEntries(data)) {
			if (conf.hasOwnProperty(key) && !_.isEqual(conf[key], value)) {
				conf[key] = value;
				syncSetDataChanged = SYNC_SET.has(key) ? true : syncSetDataChanged;
			// TODO refactor - this work should probably not be the direct responsibility of PanelData
			} else if (key === 'paused_blocking') {
				if (typeof value === 'number') {
					// pause blocking
					globals.SESSION.paused_blocking = true;
					globals.SESSION.paused_blocking_timeout = value;
					// enable after timeout
					setTimeout(() => {
						globals.SESSION.paused_blocking = false;
						this._pausedBlockingHelper();
					}, value);
				} else {
					// toggle blocking
					globals.SESSION.paused_blocking = value;
					globals.SESSION.paused_blocking_timeout = 0;
				}

				this._pausedBlockingHelper();
			}
		}

		if (data.needsReload && this._activeTab) {
			tabInfo.setTabInfo(this._activeTab.id, 'needsReload', data.needsReload);
		}

		if (syncSetDataChanged) {
			// Push conf changes to the server
			account.saveUserSettings().catch(err => log('PanelData saveUserSettings', err));
		}
	}

	// TODO refactor - this work should likely not be the direct responsibility of PanelData
	/**
	 * Handles updates that need to happen in response to the extension being paused/unpaused
	 * Called by #set
	 */
	_pausedBlockingHelper() {
		button.update();
		flushChromeMemoryCache();
		dispatcher.trigger('globals.save.paused_blocking');
	}

	// TODO analyze whether this and foundBugs#getCategories can be refactored to reduce duplication
	/**
	 * Build tracker categories based on the current trackerList for a given tab_id.
	 * @private
	 * @return	{array}		array of categories
	 */
	_buildCategories() {
		const categories = {};
		const smartBlock = tabInfo.getTabInfo(this._activeTab.id, 'smartBlock');

		this._trackerList.forEach((tracker) => {
			const trackerState = this._getTrackerState(tracker, smartBlock);
			let { cat: category } = tracker;

			if (t(`category_${category}`) === `category_${category}`) {
				category = 'uncategorized';
			}

			if (categories.hasOwnProperty(category)) {
				categories[category].num_total++;
				if (this._addsUpToBlocked(trackerState)) { categories[category].num_blocked++; }
			} else {
				categories[category] = this._buildCategory(category, trackerState);
			}
			categories[category].trackers.push(this._buildTracker(tracker, trackerState, smartBlock));
		});

		const categoryArray = Object.values(categories);

		categoryArray.sort((a, b) => {
			a = a.name.toLowerCase(); // eslint-disable-line no-param-reassign
			b = b.name.toLowerCase(); // eslint-disable-line no-param-reassign
			return (a > b ? 1 : (a < b ? -1 : 0));
		});

		return categoryArray;
	}

	/**
	 * _buildCategories helper
	 * @param	{Object}	trackerState	object containing various block/allow states of a tracker
	 * @return	{boolean}	is the tracker blocked in one of the possible ways?
	 */
	_addsUpToBlocked({
		ss_blocked, sb_blocked, blocked, ss_allowed, sb_allowed
	}) {
		return (ss_blocked || sb_blocked || (blocked && !ss_allowed && !sb_allowed));
	}

	/**
	 * _buildCategories helper
	 * @param	{string}	category		the category of a tracker
	 * @param	{Object}	trackerState	object containing various block/allow states of a tracker
	 * @return	{Object}	an object with data for a new category
	 */
	_buildCategory(category, trackerState) {
		return {
			id: category,
			name: t(`category_${category}`),
			description: t(`category_${category}+desc`),
			img_name: (category === 'advertising') ? 'adv' : // Because AdBlock blocks images with 'advertising' in the name.
				(category === 'social_media') ? 'smed' : category, // Because AdBlock blocks images with 'social' in the name.
			num_total: 1,
			num_blocked: this._addsUpToBlocked(trackerState) ? 1 : 0,
			trackers: [],
			expanded: conf.expand_all_trackers
		};
	}

	/**
	 * _buildCategories helper
	 * Builds the tracker data object for a given tracker
	 * @private
	 * @param	{Object}	tracker
	 * @param	{Object}	trackerState
	 * @param	{Object}	smartBlock		smart blocking stats for the active tab
	 * @return	{Object}	object of tracker data
	 */
	_buildTracker(tracker, trackerState, smartBlock) {
		const {
			id, name, cat, sources, hasCompatibilityIssue, hasInsecureIssue, hasLatencyIssue
		} = tracker;
		const { blocked, ss_allowed, ss_blocked } = trackerState;

		return {
			id,
			name,
			description: '',
			blocked,
			ss_allowed,
			ss_blocked,
			shouldShow: true, // used for filtering tracker list
			catId: cat,
			sources,
			warningCompatibility: hasCompatibilityIssue,
			warningInsecure: hasInsecureIssue,
			warningSlow: hasLatencyIssue,
			warningSmartBlock: (smartBlock.blocked.hasOwnProperty(id) && 'blocked') || (smartBlock.unblocked.hasOwnProperty(id) && 'unblocked') || false
		};
	}

	/**
	 * _buildCategories helper
	 * Computes the various blocked/allowed states for a given tracker
	 * @private
	 * @param 	{Object}	tracker
	 * @param	{Object}	smartBlock
	 * @return	{Object}	the tracker's blocked/allowed states
	 */
	_getTrackerState({ trackerId }, smartBlock) {
		const { pageHost } = this._activeTab;
		const selectedAppIds = conf.selected_app_ids;
		const pageUnblocks = conf.site_specific_unblocks[pageHost] || [];
		const pageBlocks = conf.site_specific_blocks[pageHost] || [];
		const smartBlockActive = conf.enable_smart_block;

		return {
			blocked: selectedAppIds.hasOwnProperty(trackerId),
			ss_allowed: pageUnblocks.includes(+trackerId),
			ss_blocked: pageBlocks.includes(+trackerId),
			sb_blocked: smartBlockActive && smartBlock.blocked.hasOwnProperty(`${trackerId}`),
			sb_allowed: smartBlockActive && smartBlock.unblocked.hasOwnProperty(`${trackerId}`)
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
	 * Store the tracker list and categories values to reduce code duplicdation between the blocking and summary data getters,
	 * and since these values may be accessed 2+ times in a single updatePanelUI call
	 */
	_setTrackerListAndCategories() {
		const { id, url } = this._activeTab;

		this._trackerList = foundBugs.getApps(id, false, url) || [];
		this._categories = this._buildCategories();
	}
	// [/DATA SETTING]
}

// return the class as a singleton
export default new PanelData();
