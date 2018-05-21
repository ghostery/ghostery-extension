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
import abtest from './ABTest';
import rewards from './Rewards';
import { pushUserSettings, buildUserSettings } from '../utils/accounts';
import { getActiveTab, flushChromeMemoryCache } from '../utils/utils';
import { objectEntries, log } from '../utils/common';

const SYNC_SET = new Set(globals.SYNC_ARRAY);
const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const { IS_CLIQZ } = globals;
const policy = new Policy();
/**
 * Class for handling data consumed by Ghostery panel.
 * @memberOf  BackgroundClasses
 * @todo  make it a Singelton
 */
class PanelData {
	/**
	 * Create private instance varialbes for use behind public setters
	 * @return {Object}
	 */
	constructor() {
		this._confData = new Map();
		this._trackerData = new Map();
		this._panelView = {};
		this._summaryView = {};
		this._blockingView = {};
		this._rewardsView = {};
		this._settingsView = {};
	}

	/**
	 * Initialize / update _confData after Conf has loaded. Called via
	 * initializeGhosteryModules() and Dispatcher event `conf.changed.settings`, which
	 * looks for changed to Globals.globals.SYNC_ARRAY values.
	 */
	init() {
		this._buildConfData();
	}

	/**
	 * Get PanelData for a specific view/tab
	 * @param  {string} view 	panel view name
	 * @param  {Object} tab 	tab
	 * @return {Object}      	view data
	 */
	get(view, tab) {
		log(`Get data for ${view} view`);
		if (view === 'settings') {
			return this.settingsView;
		}
		// update _trackerData with new tab info
		this._buildTrackerData(tab);
		switch (view) {
			case 'panel':
				return this.panelView;
			case 'summary':
				return this.summaryView;
			case 'blocking':
				return this.blockingView;
			case 'rewards':
				return this.rewardsView;
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
					}, value);
				} else {
					// toggle blocking
					globals.SESSION.paused_blocking = value;
					globals.SESSION.paused_blocking_timeout = 0;
				}

				// update button
				button.update();
				flushChromeMemoryCache();
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
			pushUserSettings({ conf: buildUserSettings() });
		}

		if (otherDataChanged) {
			// update local _confData.
			// if only SYNC_SET data changed _buildConfData will be called through init in dispatch
			this._buildConfData();
		}
	}

	/**
	 * For initial application load, get combined conf and tracker data for
	 * Panel View, Summary View and, if_expert, Blocking View
	 * @return {Object}		panel data shared by multiple views
	 */
	get panelView() {
		this._panelView = {
			panel: {
				decoded_user_token: this._confData.get('decoded_user_token'),
				email: this._confData.get('email'),
				enable_ad_block: this._confData.get('enable_ad_block'),
				enable_anti_tracking: this._confData.get('enable_anti_tracking'),
				enable_smart_block: this._confData.get('enable_smart_block'),
				enable_offers: this._confData.get('enable_offers'),
				is_expanded: this._confData.get('is_expanded'),
				is_expert: this._confData.get('is_expert'),
				is_android: globals.BROWSER_INFO.os === 'android',
				is_validated: this._confData.get('is_validated'),
				language: this._confData.get('language'),
				logged_in: this._confData.get('logged_in'),
				reload_banner_status: this._confData.get('reload_banner_status'),
				trackers_banner_status: this._confData.get('trackers_banner_status'),

				needsReload: this._trackerData.get('needsReload'),
				smartBlock: this._trackerData.get('smartBlock'),
				tab_id: this._trackerData.get('tab_id'),
				unread_offer_ids: rewards.unreadOfferIds,
			},
			summary: this.summaryView,
			blocking: this._confData.get('is_expert') ? this.blockingView : false,
		};
		return this._panelView;
	}

	/**
	 * Get conf and tracker data for Summary View
	 * @return {Object}		Summary view data
	 */
	get summaryView() {
		this._summaryView = {
			paused_blocking: globals.SESSION.paused_blocking,
			paused_blocking_timeout: globals.SESSION.paused_blocking_timeout,
			site_blacklist: this._confData.get('site_blacklist'),
			site_whitelist: this._confData.get('site_whitelist'),

			alertCounts: this._trackerData.get('alertCounts'),
			categories: this._trackerData.get('categories'), // duplicated in blockingView, used here just for the donut
			pageHost: this._trackerData.get('pageHost'),
			pageUrl: this._trackerData.get('pageUrl'),
			performanceData: this._trackerData.get('performanceData'),
			siteNotScanned: this._trackerData.get('siteNotScanned'), // duplicated in blockingView
			sitePolicy: this._trackerData.get('sitePolicy'),
			trackerCounts: this._trackerData.get('trackerCounts'),
		};
		return this._summaryView;
	}

	/**
	 * Get conf and tracker data for Blocking View
	 * @return {Object}		Blocking view data
	 */
	get blockingView() {
		this._blockingView = {
			expand_all_trackers: this._confData.get('expand_all_trackers'),
			selected_app_ids: this._confData.get('selected_app_ids'),
			show_tracker_urls: this._confData.get('show_tracker_urls'),
			siteNotScanned: this._trackerData.get('siteNotScanned'),
			site_specific_blocks: this._confData.get('site_specific_blocks'),
			site_specific_unblocks: this._confData.get('site_specific_unblocks'),
			toggle_individual_trackers: this._confData.get('toggle_individual_trackers'),
			pageUrl: this._trackerData.get('pageUrl'),
			categories: this._trackerData.get('categories'),
		};
		return this._blockingView;
	}

	/**
	 * Get rewards data for the Rewards View
	 * @return {Object} Rewards view data
	 */
	get rewardsView() {
		this._rewardsView = {
			enable_offers: this._confData.get('enable_offers'),
			rewards: rewards.storedOffers,
			unread_offer_ids: rewards.unreadOfferIds,
		};
		return this._rewardsView;
	}

	/**
	 * Get conf and tracker data for Settings View. Note we have overlapping properties
	 * from blockView incase the user is in Simple Mode.
	 * @return {Object}		Settings View data
	 */
	get settingsView() {
		this._settingsView = {
			alert_bubble_pos: this._confData.get('alert_bubble_pos'),
			alert_bubble_timeout: this._confData.get('alert_bubble_timeout'),
			block_by_default: this._confData.get('block_by_default'),
			bugs_last_updated: this._confData.get('bugs_last_updated'),
			categories: this._confData.get('categories'),
			enable_autoupdate: this._confData.get('enable_autoupdate'),
			enable_click2play: this._confData.get('enable_click2play'),
			enable_click2play_social: this._confData.get('enable_click2play_social'),
			enable_human_web: this._confData.get('enable_human_web'),
			enable_offers: this._confData.get('enable_offers'),
			enable_metrics: this._confData.get('enable_metrics'),
			first_name: this._confData.get('first_name'),
			last_name: this._confData.get('last_name'),
			hide_alert_trusted: this._confData.get('hide_alert_trusted'),
			ignore_first_party: this._confData.get('ignore_first_party'),
			notify_library_updates: this._confData.get('notify_library_updates'),
			notify_upgrade_updates: this._confData.get('notify_upgrade_updates'),
			offer_human_web: this._confData.get('offer_human_web'),
			selected_app_ids: this._confData.get('selected_app_ids'),
			new_app_ids: this._confData.get('new_app_ids'),
			settings_last_imported: this._confData.get('settings_last_imported'),
			settings_last_exported: this._confData.get('settings_last_exported'),
			show_alert: this._confData.get('show_alert'),
			show_badge: this._confData.get('show_badge'),
			show_cmp: this._confData.get('show_cmp'),
			show_tracker_urls: this._confData.get('show_tracker_urls'),
			toggle_individual_trackers: this._confData.get('toggle_individual_trackers'),
			language: this._confData.get('language'), // required for the setup page that does not have access to panelView data
		};
		return this._settingsView;
	}

	/**
	 * Build local _confData map. Called during init() and when Conf updates
	 * @private
	 */
	_buildConfData() {
		const { login_info } = conf;
		this._confData
			.set('alert_bubble_pos', conf.alert_bubble_pos)
			.set('alert_bubble_timeout', conf.alert_bubble_timeout)
			.set('block_by_default', conf.block_by_default)
			.set('bugs_last_updated', conf.bugs_last_updated)
			.set('categories', this._buildGlobalCategories())
			.set('decoded_user_token', login_info.decoded_user_token)
			.set('email', login_info.email)
			.set('enable_ad_block', conf.enable_ad_block)
			.set('enable_anti_tracking', conf.enable_anti_tracking)
			.set('enable_autoupdate', conf.enable_autoupdate)
			.set('enable_click2play', conf.enable_click2play)
			.set('enable_click2play_social', conf.enable_click2play_social)
			.set('enable_human_web', conf.enable_human_web)
			.set('enable_metrics', conf.enable_metrics)
			.set('enable_offers', conf.enable_offers)
			.set('enable_smart_block', conf.enable_smart_block)
			.set('first_name', (login_info.decoded_user_token && login_info.decoded_user_token.ClaimFirstName))
			.set('hide_alert_trusted', conf.hide_alert_trusted)
			.set('ignore_first_party', conf.ignore_first_party)
			.set('is_validated', login_info.is_validated)
			.set('is_expanded', conf.is_expanded)
			.set('is_expert', conf.is_expert)
			.set('language', conf.language)
			.set('last_name', (login_info.decoded_user_token && login_info.decoded_user_token.ClaimLastName))
			.set('logged_in', login_info.logged_in)
			.set('notify_library_updates', conf.notify_library_updates)
			.set('notify_upgrade_updates', conf.notify_upgrade_updates)
			.set('offer_human_web', !IS_EDGE)
			.set('paused_blocking', globals.SESSION.paused_blocking)
			.set('reload_banner_status', conf.reload_banner_status)
			.set('selected_app_ids', conf.selected_app_ids)
			.set('new_app_ids', conf.new_app_ids)
			.set('settings_last_imported', conf.settings_last_imported)
			.set('settings_last_exported', conf.settings_last_exported)
			.set('show_alert', conf.show_alert)
			.set('show_badge', conf.show_badge)
			.set('show_cmp', conf.show_cmp)
			.set('show_tracker_urls', conf.show_tracker_urls)
			.set('site_blacklist', conf.site_blacklist)
			.set('site_specific_blocks', conf.site_specific_blocks)
			.set('site_specific_unblocks', conf.site_specific_unblocks)
			.set('site_whitelist', conf.site_whitelist)
			.set('toggle_individual_trackers', conf.toggle_individual_trackers)
			.set('trackers_banner_status', conf.trackers_banner_status)
			.set('expand_all_trackers', conf.expand_all_trackers);
	}

	/**
	 * Build local _trackerData map. Called each time a view is fetched. These
	 * properties represent the initial state of the page on load. They are not updated
	 * by PanelData.set()
	 *
	 * @private
	 *
	 * @param  {Object} tab 	active tab
	 */
	_buildTrackerData(tab) {
		const tab_id = tab && tab.id;
		const tab_url = tab && tab.url;
		const pageHost = tab && tabInfo.getTabInfo(tab_id, 'host') || '';
		const trackerList = foundBugs.getApps(tab_id, false, tab_url) || [];
		this._trackerData
			.set('alertCounts', tab && foundBugs.getAppsCountByIssues(tab_id, tab_url) || {})
			.set('categories', this._buildCategories(tab_id, tab_url, pageHost, trackerList))
			.set('needsReload', tab && tabInfo.getTabInfo(tab_id, 'needsReload') || { changes: {} })
			.set('pageUrl', tab_url || '')
			.set('pageHost', pageHost)
			.set('performanceData', tab && tabInfo.getTabInfo(tab_id, 'pageTiming'))
			.set('sitePolicy', tab && policy.getSitePolicy(tab_url) || false)
			.set('siteNotScanned', tab && !foundBugs.getApps(tab_id) || false)
			.set('tab_id', tab_id)
			.set('trackerCounts', tab && foundBugs.getAppsCountByBlocked(tab_id) || {})
			.set('smartBlock', tabInfo.getTabInfo(tab_id, 'smartBlock'));
	}

	/**
	 * Build category array for all trackers in DB. Used in Settings > Global Blocking
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
		const selectedAppIds = this._confData.get('selected_app_ids');
		const language = this._confData.get('language');
		const pageUnblocks = this._confData.get('site_specific_unblocks')[pageHost] || [];
		const pageBlocks = this._confData.get('site_specific_blocks')[pageHost] || [];
		const categories = {};
		const categoryArray = [];
		const smartBlock = tabInfo.getTabInfo(tab_id, 'smartBlock');

		trackerList.forEach((tracker) => {
			let category = tracker.cat;
			const blocked = selectedAppIds.hasOwnProperty(tracker.id);
			const ss_allowed = pageUnblocks.includes(+tracker.id);
			const ss_blocked = pageBlocks.includes(+tracker.id);

			if (t(`category_${category}`) === `category_${category}`) {
				category = 'uncategorized';
			}

			if (categories.hasOwnProperty(category)) {
				categories[category].num_total++;
				if (blocked || ss_blocked) {
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
					num_blocked: (blocked || ss_blocked) ? 1 : 0,
					trackers: [],
					expanded: this._confData.get('expand_all_trackers')
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

export default PanelData;
