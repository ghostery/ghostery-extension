/**
 * Panel Data Class
 *
 * Coordinates the assembly and transmission
 * of bug / Cliqz / settings / rewards data to the extension panel
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

import { isEqual, throttle } from 'underscore';
import button from './BrowserButton';
import cliqz from './Cliqz';
import conf from './Conf';
import foundBugs from './FoundBugs';
import bugDb from './BugDb';
import globals from './Globals';
import metrics from './Metrics';
import Policy from './Policy';
import tabInfo from './TabInfo';
import rewards from './Rewards';
import account from './Account';
import dispatcher from './Dispatcher';
import promoModals from './PromoModals';
import { getCliqzGhosteryBugs, sendCliqzModuleCounts } from '../utils/cliqzModulesData';
import { getActiveTab, flushChromeMemoryCache, processUrl } from '../utils/utils';
import { objectEntries, log } from '../utils/common';

const cliqzModuleMock = {
	isEnabled: false,
	on: () => {},
};
const offers = cliqz.modules['offers-v2'] || cliqzModuleMock;

const SYNC_SET = new Set(globals.SYNC_ARRAY);
const { IS_CLIQZ } = globals;
const policy = new Policy();

/**
 * PanelData coordinates the assembly and transmission of data to the extension panel
 *
 * Table of contents
 * [PORT MANAGEMENT] 	functions that handle initializing, storing, and tearing down the panel port connection
 * [DATA TRANSFER]		functions that send data to the extension panel
 * [DATA SETTING]		functions that set and store non-port data values
 * @memberOf  BackgroundClasses
 */

const initMountedComponentsState = {
	panel: false,
	blocking: false,
	rewards: false,
	settings: false,
	summary: false
};

class PanelData {
	constructor() {
		this._activeTab = null;
		this._categories = [];
		this._trackerList = [];
		this._panelPort = null;
		this._mountedComponents = initMountedComponentsState;
	}

	// [PORT MANAGEMENT]
	/**
	 * Invoked from background.js when the Panel component
	 * initiates a port connection to the background in its componentDidMount lifecycle event
	 * @param 	{Object}	port	the port object passed to the onConnect listener in background.js that calls this function
	 */
	initPort(port) {
		this._panelPort = port;
		this._mountedComponents.panel = true;

		getActiveTab((tab) => {
			const { url } = tab;

			this._activeTab = tab;
			this._activeTab.pageHost = url && processUrl(url).hostname || '';

			this._attachListeners();

			this._setTrackerListAndCategories();

			this._postMessage('panel', this._getPanelSummaryAndBlockingData());

			account.getUserSettings()
				.then(userSettings => this._postUserSettings(userSettings))
				.catch(() => log('Failed getting remote user settings from PanelData#initPort. User not logged in.'));

			if (this._needToFilterOffersByRemote()) {
				rewards.filterOffersByRemote().catch(err => log('Failed to filter offers by remote:', err));
			}
		});
	}

	/**
	 * Called only by initPort
	 * Attaches disconnect and message listeners to the new port
	 */
	_attachListeners() {
		const port = this._panelPort;
		const tab = this._activeTab;

		if (!port || !tab) { return; }

		port.onDisconnect.addListener(() => {
			this._activeTab = null;
			this._panelPort = null;
			this._mountedComponents = initMountedComponentsState;
		});

		port.onMessage.addListener((msg) => {
			switch (msg.name) {
				case 'BlockingComponentDidMount':
					this._mountedComponents.blocking = true;
					this._setTrackerListAndCategories();
					this._postMessage('blocking', this._getBlockingData());
					break;
				case 'BlockingComponentWillUnmount':
					this._mountedComponents.blocking = false;
					break;
				case 'RewardsComponentDidMount':
					this._mountedComponents.rewards = true;
					this._panelPort.onDisconnect.addListener(rewards.panelHubClosedListener);
					if (this._needToFilterOffersByRemote()) {
						rewards.filterOffersByRemote()
							.then(() => this._postRewardsData())
							.catch((err) => {
								log('Failed to filter offers by remote:', err);
								this._postRewardsData();
							});
					} else {
						this._postRewardsData();
					}
					break;
				case 'RewardsComponentWillUnmount':
					this._mountedComponents.rewards = false;
					this._panelPort.onDisconnect.removeListener(rewards.panelHubClosedListener);
					break;
				case 'SettingsComponentDidMount':
					this._mountedComponents.settings = true;
					this._postMessage('settings', this._getSettingsData());
					break;
				case 'SettingsComponentWillUnmount':
					this._mountedComponents.settings = false;
					break;
				case 'SummaryComponentDidMount':
					this._mountedComponents.summary = true;
					this._postCliqzModulesData();
					this.postPageLoadTime(tab.id);
					break;
				case 'SummaryComponentWillUnmount':
					this._mountedComponents.summary = false;
					break;
				default:
					break;
			}
		});
	}
	// [/PORT MANAGEMENT]

	// [DATA TRANSFER]
	/**
	 * An intent-clarifying wrapper used to call sendPageLoadTime in EventHandlers#onBeforeNavigate
	 * @param 	{number}	tab_id
	 */
	clearPageLoadTime(tab_id) {
		this.postPageLoadTime(tab_id, true);
	}


	// TODO convert Android panel and Hub to also use port so we can have a single streamlined communication channel & API
	/**
	 * Get PanelData for a specific view/tab. Needed for Android panel and Hub, which do not use a port (yet)
	 * @param  {string} view 	panel view name
	 * @param  {Object} tab 	tab
	 * @return {Object}      	view data
	 */
	get(view, tab) {
		// Hub and Android panel
		if (view === 'settings') {
			return this._getSettingsData();
		}

		// Android panel only
		const { url } = tab;
		this._activeTab = tab;
		this._activeTab.pageHost = url && processUrl(url).hostname || '';
		this._setTrackerListAndCategories();
		switch (view) {
			case 'panel':
				return this._getPanelSummaryAndBlockingData();
			case 'summary':
				return this._getSummaryData();
			case 'blocking':
				return this._getBlockingData();
			default:
				return false;
		}
	}

	/**
	 * Wrapper helper passed as callback to utils/cliqzModuleData#sendCliqzModuleCounts
	 */
	postMessageToSummary = ((message) => {
		this._postMessage('summary', message);
	});

	/**
	 * The page_performance content script, injected by EventHandlers#onNavigationCompleted,
	 * gathers window.performance data and sends it in a message to background.js
	 * The message handler in background.js calls this function so that the data
	 * gets forwarded to the extension panel if it's open
	 * @param	{number}	tab_id
	 * @param	{boolean}	clearData	should we simply blank out the page performance data, or fetch it from tabInfo?
	 */
	postPageLoadTime(tab_id, clearData) {
		if (!this._panelPort || !this._activeTab || this._activeTab.id !== tab_id) { return; }

		this._postMessage('summary', {
			performanceData: clearData ? false : tabInfo.getTabInfo(tab_id, 'pageTiming')
		});
	}

	/**
	 * Invoked in EventHandlers#onBeforeRequest when a new bug has been found
	 * Sends updated data to the panel and blocking and/or summary components
	 */
	updatePanelUI = throttle(this._updatePanelUI.bind(this), 600, { leading: true, trailing: true }); // matches donut redraw throttling

	_updatePanelUI() {
		if (!this._panelPort || !this._activeTab) { return; }

		const { blocking, summary } = this._mountedComponents;

		if (blocking || summary) {
			this._setTrackerListAndCategories();
		}

		if (blocking) {
			this._postMessage('blocking', this._getDynamicBlockingData());
		}

		if (summary) {
			this._postMessage('summary', this._getDynamicSummaryData());
			this._postCliqzModulesData();
		}

		this._postMessage('panel', this._getDynamicPanelData());
	}

	/**
	 * Gets the data that needs to be sent to the Blocking component when it's first mounted
	 * @return	{Object}	the conf, categories, scan status, and page url data the Blocking component needs to display
	 */
	_getBlockingData() {
		const {
			expand_all_trackers, selected_app_ids, show_tracker_urls,
			site_specific_blocks, site_specific_unblocks, toggle_individual_trackers,
		} = conf;

		return Object.assign({}, {
			expand_all_trackers,
			selected_app_ids,
			show_tracker_urls,
			site_specific_blocks,
			site_specific_unblocks,
			toggle_individual_trackers
		}, this._getDynamicBlockingData());
	}

	/**
	 * Helper that retrieves the current account information
	 * @return {Object|null}	the current account object or null
	 */
	_getCurrentAccount() {
		const currentAccount = conf.account;
		if (currentAccount && currentAccount.user) {
			currentAccount.user.subscriptionsPlus = account.hasScopesUnverified(['subscriptions:plus']);
		}
		return currentAccount;
	}

	/**
	 * Gets the data needed to update the Blocking view as a tab loads
	 * @return	{Object}	the scan status, page url, and categories data that may change as new trackers are discovered on the page
	 */
	_getDynamicBlockingData() {
		if (!this._activeTab) { return {}; }

		const { url: pageUrl } = this._activeTab;

		return {
			siteNotScanned: !this._trackerList || false, // TODO [] ==  false is true, and ![] == false is true, so this MAY be a bug
			pageUrl,
			categories: this._categories
		};
	}

	// TODO: Determine whether needsReload and/or smartBlock ever actually change!
	/**
	 * Gets panel data that may change when a new tracker is found
	 * @param	{number}	tabId
	 * @return	{Object}	new needsReload and smartBlock values from tabInfo
	 */
	_getDynamicPanelData(tabId) {
		const id = tabId || (this._activeTab && this._activeTab.id) || null;

		const { needsReload, smartBlock } =
			tabInfo.getTabInfo(id) ||
			{ needsReload: false, smartBlock: { blocked: {}, unblocked: {} } };

		return {
			needsReload: needsReload || { changes: {} },
			smartBlock,
			account: this._getCurrentAccount(),
		};
	}

	/**
	 * Get the summary view data that may change when a new tracker is found
	 * @return {Object}		Fresh alertCounts, categories, and trackerCounts values
	 */
	_getDynamicSummaryData() {
		if (!this._activeTab) { return {}; }

		const { id, url } = this._activeTab;

		return {
			alertCounts: foundBugs.getAppsCountByIssues(id, url) || {},
			categories: this._categories,
			trackerCounts: foundBugs.getAppsCountByBlocked(id) || {}
		};
	}

	/**
	 * Gets all the data the top-level Panel component needs for display
	 * Called one time per panel open, when Panel is first mounted
	 * @return	{Object}	all the conf and dynamic data used by the Panel component
	 */
	_getPanelData() {
		if (!this._activeTab) { return {}; }

		const { id: tab_id } = this._activeTab;
		const {
			current_theme, enable_ad_block, enable_anti_tracking, enable_smart_block,
			enable_offers, is_expanded, is_expert, language, reload_banner_status,
			trackers_banner_status,
		} = conf;

		return Object.assign({}, {
			current_theme,
			enable_ad_block,
			enable_anti_tracking,
			enable_smart_block,
			enable_offers,
			is_expanded,
			is_expert,
			is_android: globals.BROWSER_INFO.os === 'android',
			language,
			isTimeForAPlusPromo: promoModals.isTimeForAPlusPromo(),
			haveSeenInitialPlusPromo: promoModals.haveSeenInitialPlusPromo(),
			reload_banner_status,
			tab_id,
			trackers_banner_status,
			unread_offer_ids: rewards.unreadOfferIds,
		}, this._getDynamicPanelData(tab_id));
	}

	/**
	 * Called when and only when the panel is first (re-)opened on a tab
	 * @return {Object}		All data fields used by the panel, summary, and blocking (if in expert mode) views
	 */
	_getPanelSummaryAndBlockingData() {
		return {
			panel: this._getPanelData(),
			summary: this._getSummaryData(),
			blocking: conf.is_expert ? this._getBlockingData() : false
		};
	}

	/**
	 * Get rewards data for the Rewards View
	 * @return {Object} Rewards view data
	 */
	_getRewardsData() {
		const { storedOffers, unreadOfferIds } = rewards;

		return {
			enable_offers: conf.enable_offers,
			rewards: storedOffers,
			unread_offer_ids: unreadOfferIds,
		};
	}

	/**
	 * Get conf and tracker data for Settings View.
	 * Called when and only when the Settings component is mounted
	 * @return	{Object}		Settings View data
	 */
	_getSettingsData() {
		const {
			bugs_last_updated, language, new_app_ids,
			settings_last_exported, settings_last_imported
		} = conf;

		return Object.assign(
			{},
			{
				bugs_last_updated,
				categories: this._buildGlobalCategories(),
				language, // required for the setup page that does not have access to panelView data
				new_app_ids,
				offer_human_web: true,
				settings_last_exported,
				settings_last_imported,
			},
			this._getUserSettingsForSettingsView(conf),
		);
	}

	/**
	 * Get conf and tracker data for Summary View
	 * @return {Object}		Summary view data
	 */
	_getSummaryData() {
		if (!this._activeTab) { return {}; }

		const { url, pageHost } = this._activeTab;
		const { paused_blocking, paused_blocking_timeout } = globals.SESSION;
		const { site_blacklist, site_whitelist } = conf;

		return Object.assign(
			{},
			{
				paused_blocking,
				paused_blocking_timeout,
				site_blacklist,
				site_whitelist,
				pageHost,
				pageUrl: url || '',
				siteNotScanned: !this._trackerList || false,
				sitePolicy: policy.getSitePolicy(url) || false,
			},
			this._getDynamicSummaryData()
		);
	}

	/**
	 * _sendUserSettings helper
	 * Invoked if Blocking component is mounted when account.getUserSettings() resolves, max one time per panel open.
	 * @param	{Object}	userSettings	the settings retrieved by account.getUserSettings() in _initPort
	 */
	_getUserSettingsForBlockingView(userSettings) {
		const {
			expand_all_trackers, selected_app_ids, show_tracker_urls,
			site_specific_blocks, site_specific_unblocks, toggle_individual_trackers,
		} = userSettings;

		return {
			expand_all_trackers,
			selected_app_ids,
			show_tracker_urls,
			site_specific_blocks,
			site_specific_unblocks,
			toggle_individual_trackers
		};
	}

	/**
	 * _sendUserSettings helper
	 * Invoked if Panel is still open account.getUserSettings() resolves, max one time per panel open.
	 * @param	{Object}	userSettings	the settings retrieved by account.getUserSettings() in _initPort
	 */
	_getUserSettingsForPanelView(userSettings) {
		const {
			current_theme, enable_ad_block, enable_anti_tracking, enable_smart_block,
			enable_offers, is_expanded, is_expert, reload_banner_status, trackers_banner_status,
		} = userSettings;

		return {
			current_theme,
			enable_ad_block,
			enable_anti_tracking,
			enable_smart_block,
			enable_offers,
			is_expanded,
			is_expert,
			reload_banner_status,
			trackers_banner_status,
			account: this._getCurrentAccount(),
		};
	}

	/**
	 * _sendUserSettings helper
	 * Invoked if Settings component is mounted when account.getUserSettings() resolves, max one time per panel open.
	 * @param	{Object}	userSettings	the settings retrieved by account.getUserSettings() in _initPort, or the conf object provided by getSettings
	 */
	_getUserSettingsForSettingsView(userSettingsSource) {
		const {
			alert_bubble_pos, alert_bubble_timeout, block_by_default, enable_autoupdate,
			enable_click2play, enable_click2play_social, enable_human_web, enable_offers,
			enable_metrics, hide_alert_trusted, ignore_first_party, notify_library_updates,
			notify_upgrade_updates, selected_app_ids, show_alert, show_badge,
			show_cmp, show_tracker_urls, toggle_individual_trackers
		} = userSettingsSource;

		return {
			alert_bubble_pos,
			alert_bubble_timeout,
			block_by_default,
			enable_autoupdate,
			enable_click2play,
			enable_click2play_social,
			enable_human_web,
			enable_offers,
			enable_metrics,
			hide_alert_trusted,
			ignore_first_party,
			notify_library_updates,
			notify_upgrade_updates,
			selected_app_ids,
			show_alert,
			show_badge,
			show_cmp,
			show_tracker_urls,
			toggle_individual_trackers
		};
	}

	/**
	 * Checks to see whether we need to retrieve a filtered set of rewards from Cliqz
	 * @returns {boolean}	true if we do need to retrieve filtered rewards
	 */
	_needToFilterOffersByRemote() {
		const { enable_offers, is_expert } = conf;

		return (offers.isEnabled && enable_offers && is_expert);
	}

	/**
	 * Retrieves antitracking and adblock counts and sends it to the panel
	 */
	_postCliqzModulesData() {
		if (!this._panelPort || !this._activeTab) { return; }

		sendCliqzModuleCounts(
			this._activeTab.id,
			this._activeTab.pageHost,
			this.postMessageToSummary,
		);
	}

	/**
	 * A wrapper to make posting port messages cleaner
	 * @param	{string}	to		the destination component
	 * @param	{Object}	data
	 */
	_postMessage(to, data) {
		if (!this._panelPort) { return; }

		this._panelPort.postMessage({
			to,
			body: data
		});
	}

	/**
	 * Legibility wrapper
	 * @private
	 */
	_postRewardsData() {
		this._postMessage('rewards', this._getRewardsData());
	}

	/**
	 * Perform a one-time refresh of panel data with settings retrieved from the account server
	 * by the call to account.getUserSettings() in initPort
	 * @param	{Object}	userSettings	the settings retrieved from the account server
	 */
	_postUserSettings(userSettings) {
		if (!this._panelPort || !this._activeTab) { return; }

		this._postMessage('panel', this._getUserSettingsForPanelView(userSettings));

		const { blocking, settings } = this._mountedComponents;

		if (blocking) {
			this._postMessage('blocking', this._getUserSettingsForBlockingView(userSettings));
		}

		if (settings) {
			this._postMessage('settings', this._getUserSettingsForSettingsView(userSettings));
		}
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

		if (IS_CLIQZ) {
			data.enable_human_web = false;
			data.enable_offers = false;
			data.enable_ad_block = false;
			data.enable_anti_tracking = false;
		}

		// Set the conf from data
		// TODO can this now be replaced by Object.entries?
		for (const [key, value] of objectEntries(data)) {
			if (conf.hasOwnProperty(key) && !isEqual(conf[key], value)) {
				conf[key] = value;
				syncSetDataChanged = SYNC_SET.has(key) ? true : syncSetDataChanged;
			// TODO refactor - this work should probably be the direct responsibility of Globals
			// can this be achieved without introducing circular dependencies?
			} else if (key === 'paused_blocking') {
				if (typeof value === 'number') {
					globals.SESSION.paused_blocking = true;
					globals.SESSION.paused_blocking_timeout = value;

					setTimeout(() => {
						globals.SESSION.paused_blocking = false;
						this._toggleBlockingHelper();
					}, value);
				} else {
					globals.SESSION.paused_blocking = value;
					globals.SESSION.paused_blocking_timeout = 0;
				}
				this._toggleBlockingHelper();
			}
		}

		if (data.needsReload && this._activeTab) {
			tabInfo.setTabInfo(this._activeTab.id, 'needsReload', data.needsReload);
		}

		if (data.brokenPageMetricsTrackerTrustOrUnblock) {
			metrics.handleBrokenPageTrigger(globals.BROKEN_PAGE_TRACKER_TRUST_OR_UNBLOCK);
		}

		if (data.brokenPageMetricsWhitelistSite) {
			metrics.handleBrokenPageTrigger(globals.BROKEN_PAGE_WHITELIST);
		}

		if (syncSetDataChanged) {
			// Push conf changes to the server
			account.saveUserSettings().catch(err => log('PanelData saveUserSettings', err));
		}
	}

	/**
	 * Notifies interested parties when blocking is paused / unpaused
	 */
	_toggleBlockingHelper() {
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
		if (!this._activeTab) { return []; }

		const categories = {};
		const smartBlock = tabInfo.getTabInfo(this._activeTab.id, 'smartBlock');

		this._trackerList.forEach((tracker) => {
			const trackerState = this._getTrackerState(tracker, smartBlock);
			let { cat } = tracker;

			if (t(`category_${cat}`) === `category_${cat}`) {
				cat = 'uncategorized';
			}

			if (categories.hasOwnProperty(cat)) {
				categories[cat].num_total++;
				if (this._addsUpToBlocked(trackerState)) { categories[cat].num_blocked++; }
			} else {
				categories[cat] = this._buildCategory(cat, trackerState);
			}
			categories[cat].trackers.push(this._buildTracker(tracker, trackerState, smartBlock));
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
			description: t(`category_${category}_desc`),
			img_name: (category === 'advertising') ? 'adv' : // Because AdBlock blocks images with 'advertising' in the name.
				(category === 'social_media') ? 'smed' : category, // Because AdBlock blocks images with 'social' in the name.
			num_total: 1,
			num_blocked: this._addsUpToBlocked(trackerState) ? 1 : 0,
			trackers: []
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
			cat,
			cliqzAdCount,
			cliqzCookieCount,
			cliqzFingerprintCount,
			hasCompatibilityIssue,
			hasInsecureIssue,
			hasLatencyIssue,
			id,
			name,
			sources,
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
			warningSmartBlock: (smartBlock.blocked.hasOwnProperty(id) && 'blocked') || (smartBlock.unblocked.hasOwnProperty(id) && 'unblocked') || false,
			cliqzAdCount,
			cliqzCookieCount,
			cliqzFingerprintCount,
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
	_getTrackerState({ id: trackerId }, smartBlock) {
		const { pageHost } = this._activeTab;
		const {
			selected_app_ids: selectedAppIds,
			enable_smart_block: smartBlockActive
		} = conf;
		const pageUnblocks = (pageHost && conf.site_specific_unblocks[pageHost]) || [];
		const pageBlocks = (pageHost && conf.site_specific_blocks[pageHost]) || [];

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
	 * Store the tracker list and categories values to reduce code duplication between the blocking and summary data getters,
	 * and since these values may be accessed 2+ times in a single updatePanelUI call
	 */
	_setTrackerListAndCategories() {
		if (!this._activeTab) { return; }

		const { id, url } = this._activeTab;

		this._trackerList = foundBugs.getApps(id, false, url) || [];

		const ghosteryBugs = getCliqzGhosteryBugs(id);

		if (ghosteryBugs && ghosteryBugs.bugs) {
			const { bugs } = ghosteryBugs;
			const bugIds = Object.keys(bugs);
			const appsById = foundBugs.getAppsById(id);

			bugIds.forEach((bugsId) => {
				const trackerId = conf.bugs.bugs[bugsId];
				if (!trackerId) return;

				const trackerListIndex = appsById[trackerId.aid];
				if (!trackerListIndex) return;

				this._trackerList[trackerListIndex].cliqzCookieCount = bugs[bugsId].cookies;
				this._trackerList[trackerListIndex].cliqzFingerprintCount = bugs[bugsId].fingerprints;
				this._trackerList[trackerListIndex].cliqzAdCount = bugs[bugsId].ads;
			});
		}

		this._categories = this._buildCategories();
	}
	// [/DATA SETTING]
}

// return the class as a singleton
export default new PanelData();
