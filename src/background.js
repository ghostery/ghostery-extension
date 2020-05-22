/**
 * Background
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

/* eslint consistent-return: 0 */
/* eslint no-use-before-define: 0 */
/* eslint no-shadow: 0 */

/**
 * @namespace Background
 */
import { debounce, every, size } from 'underscore';
import moment from 'moment/min/moment-with-locales.min';
import cliqz from './classes/Cliqz';
// object class
import Events from './classes/EventHandlers';
import Policy from './classes/Policy';
// static classes
import panelData from './classes/PanelData';
import bugDb from './classes/BugDb';
import button from './classes/BrowserButton';
import c2pDb from './classes/Click2PlayDb';
import cmp from './classes/CMP';
import abtest from './classes/ABTest';
import compDb from './classes/CompatibilityDb';
import confData from './classes/ConfData';
import conf from './classes/Conf';
import dispatcher from './classes/Dispatcher';
import foundBugs from './classes/FoundBugs';
import globals from './classes/Globals';
import surrogatedb from './classes/SurrogateDb';
import tabInfo from './classes/TabInfo';
import metrics from './classes/Metrics';
import Rewards from './classes/Rewards';
import account from './classes/Account';
import GhosteryModule from './classes/Module';
import promoModals from './classes/PromoModals';

// utilities
import { allowAllwaysC2P } from './utils/click2play';
import * as common from './utils/common';
import * as utils from './utils/utils';
import { _getJSONAPIErrorsObject } from './utils/api';
import importCliqzSettings from './utils/cliqzSettingImport';
import { sendCliqzModuleCounts } from './utils/cliqzModulesData';

// For debug purposes, provide Access to the internals of `browser-core`
// module from Developer Tools Console.
window.CLIQZ = cliqz;

// class instantiation
const events = new Events();
// function shortcuts
const { log } = common;
const { sendMessage } = utils;
const { onMessage } = chrome.runtime;
// simple consts
const {
	CDN_BASE_URL, BROWSER_INFO, IS_CLIQZ, DEBUG
} = globals;
const IS_EDGE = (BROWSER_INFO.name === 'edge');
const IS_FIREFOX = (BROWSER_INFO.name === 'firefox');
const VERSION_CHECK_URL = `${CDN_BASE_URL}/update/version`;
const REAL_ESTATE_ID = 'ghostery';
const onBeforeRequest = events.onBeforeRequest.bind(events);
const { onHeadersReceived } = Events;

// Cliqz Modules
const moduleMock = {
	isEnabled: false,
	on: () => {},
};
const humanweb = cliqz.modules['human-web'];
const { adblocker, antitracking, hpnv2 } = cliqz.modules;
const offers = cliqz.modules['offers-v2'] || moduleMock;
const insights = cliqz.modules.insights || moduleMock;
// add ghostery module to expose ghostery state to cliqz
cliqz.modules.ghostery = new GhosteryModule();

/**
 * Enable or disable specified module.
 * @memberOf Background
 * @param {Object} module  Cliqz module
 * @param {boolean} enabled true - enable, false - disable
 * @return {Promise}
 */
function setCliqzModuleEnabled(module, enabled) {
	if (enabled) {
		log('SET CLIQZ MODULE ENABLED', module);
		return cliqz.enableModule(module.name);
	}
	log('SET CLIQZ MODULE DISABLED', module);
	cliqz.disableModule(module.name);
	return Promise.resolve();
}

/**
 * Check and fetch a new tracker library every hour as needed
 * @memberOf Background
 */
function autoUpdateBugDb() {
	if (conf.enable_autoupdate) {
		const result = conf.bugs_last_checked;
		const nowTime = Number((new Date()).getTime());
		// offset by 15min so that we don't double fetch
		if (!result || nowTime > (Number(result) + 900000)) {
			log('autoUpdateBugDb called', new Date());
			checkLibraryVersion();
		}
	}
}

/**
 * Set Default Blocking: all apps in Advertising, Adult Advertising, and Site Analytics
 */
function setGhosteryDefaultBlocking() {
	const categoriesBlock = ['advertising', 'pornvertising', 'site_analytics'];
	log('Blocking all trackers in categories:', ...categoriesBlock);
	const selected_app_ids = {};
	const app_ids = Object.keys(bugDb.db.apps);
	for (let i = 0; i < app_ids.length; i++) {
		const app_id = app_ids[i];
		if (bugDb.db.apps.hasOwnProperty(app_id)) {
			const category = bugDb.db.apps[app_id].cat;
			if (categoriesBlock.indexOf(category) >= 0 &&
			!selected_app_ids.hasOwnProperty(app_id)) {
				selected_app_ids[app_id] = 1;
			}
		}
	}
	panelData.set({ selected_app_ids });
}

/**
 * Pulls down latest version.json and triggers
 * updates of all db files.
 * @memberOf Background
 *
 * @return {Promise} 	database updated data
 */
function checkLibraryVersion() {
	return new Promise(((resolve, reject) => {
		const failed = { success: false, updated: false };
		utils.getJson(VERSION_CHECK_URL).then((data) => {
			log('Database version retrieval succeeded', data);

			c2pDb.update(data.click2playVersion);
			compDb.update(data.compatibilityVersion);
			bugDb.update(data.bugsVersion, (result) => {
				log('CHECK LIBRARY VERSION CALLED', result);
				if (result.success) {
					const nowTime = Number(new Date().getTime());
					conf.bugs_last_checked = nowTime;
					if (result.updated) {
						log('BUGS LAST UPDATED UPDATED', new Date());
						conf.bugs_last_updated = nowTime;
					}
				}
				resolve(result);
			});
		}).catch((err) => {
			log('Error in checkLibraryVersion', err);
			reject(failed);
		});
	}));
}

/**
 * Reload an open tab.
 * @memberOf Background
 *
 * @param  {Object} data 	tab data
 */
function reloadTab(data) {
	if (data && data.tab_id) {
		utils.getTab(data.tab_id, (tab) => {
			if (tab && tab.url) {
				chrome.tabs.update(tab.id, { url: tab.url });
			}
		}, () => {
			utils.getActiveTab((tab) => {
				if (tab && tab.url) {
					chrome.tabs.update(tab.id, { url: tab.url });
				}
			});
		});
	} else {
		utils.getActiveTab((tab) => {
			if (tab && tab.url) {
				chrome.tabs.update(tab.id, { url: tab.url });
			}
		});
	}
}

/**
 * Closes all active instances of panel that are currently open on
 * Firefox for Android.
 * @memberOf Background
 */
function closeAndroidPanelTabs() {
	if (BROWSER_INFO.os !== 'android') { return; }
	chrome.tabs.query({
		active: true,
		url: chrome.extension.getURL('app/templates/panel_android.html*')
	}, (tabs) => {
		chrome.tabs.remove(tabs.map(t => t.id));
	});
}

/**
 * Get site data for active tab.
 * @memberOf Background
 *
 * @return {Promise} 	json data
 */
function getSiteData() {
	return new Promise(((resolve, reject) => {
		utils.getActiveTab((tab) => {
			const tab_id = tab ? tab.id : 0;
			const tab_url = tab ? tab.url : '';

			if (!tab) {
				reject(new Error('Tab not found. Cannot gather page data'));
				return;
			}

			resolve({
				url: tab_url,
				extensionVersion: globals.EXTENSION_VERSION,
				browserDisplayName: BROWSER_INFO.displayName,
				browserVersion: BROWSER_INFO.version,
				categories: foundBugs.getCategories(tab_id),
				os: BROWSER_INFO.os,
				language: conf.language,
				dbVersion: bugDb.db.version
			});
		});
	}));
}

/**
 * Register/unregister real estate with Offers core module.
 * @memberOf Background
 * @param  {Object} offersModule offers module
 * @param  {Boolean} register    true - register, false - unregister
 */
function registerWithOffers(offersModule, register) {
	if (!offersModule.isEnabled) {
		return Promise.resolve();
	}

	log('REGISTER WITH OFFERS CALLED', register);
	return offersModule.action(register ? 'registerRealEstate' : 'unregisterRealEstate', { realEstateID: REAL_ESTATE_ID })
		.catch(() => {
			log(`FAILED TO ${register ? 'REGISTER' : 'UNREGISTER'} REAL ESTATE WITH OFFERS CORE`);
		});
}

/**
 * @todo  consider never return anything explicitly from message handlers
 * as we never make callback calls asynchronously.
 */

/**
 * Handle messages sent from app/js/account_pages.js content script.
 * @memberOf Background
 *
 * @param  {string} 	name 		message name
 * @param  {string}		tab_url 	tab url
 */
function handleAccountPages(name, callback) {
	switch (name) {
		case 'accountPage.login':
		case 'accountPage.register':
		case 'accountPageLoaded': // legacy
			if (conf.account === null) {
				account._getUserIDFromCookie()
					.then((userID) => {
						account._setAccountInfo(userID);
					})
					.then(account.getUser)
					.then(account.getUserSettings)
					.then(account.getUserSubscriptionData)
					.then(() => callback())
					.catch((err) => {
						callback(err);
						log('handleAccountPages error', err);
					});
			}
			return true;
		case 'accountPage.getUser':
			account.getUser()
				.then(data => callback(data))
				.catch(err => callback(err));
			return true;
		case 'accountPage.getUserSubscriptionData':
			account.getUserSubscriptionData()
				.then(data => callback(data))
				.catch(err => callback(err));
			return true;
		case 'accountPage.logout':
		case 'account.logout': // legacy
			account.logout()
				.then(data => callback(data))
				.catch(err => callback(err));
			return true;

		default:
			return false;
	}
}

/**
 * Handle messages sent from dist/ghostery_dot_com.js content script.
 * @memberOf Background
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {number} 		tab_id 		tab id
 */
function handleGhosteryDotCom(name, message, tab_id) {
	if (name === 'appsPageLoaded') {
		if (tab_id) {
			sendMessage(tab_id, 'appsPageData', {
				blocked: conf.selected_app_ids[message.id] === 1
			});
		} else {
			utils.getActiveTab((tab) => {
				if (tab) {
					sendMessage(tab.id, 'appsPageData', {
						blocked: conf.selected_app_ids[message.id] === 1
					});
				}
			});
		}
	} else if (name === 'panelSelectedAppsUpdate') {
		// This lets the user block trackers from https://apps.ghostery.com
		const { selected_app_ids } = conf;
		if (message.app_selected) {
			selected_app_ids[message.app_id] = 1;
		} else {
			delete selected_app_ids[message.app_id];
		}

		conf.selected_app_ids = selected_app_ids;
	}
	return false;
}

/**
 * Handle messages sent from app/js/notifications.js content script.
 *
 * Includes CMP messages, upgrade and update messages, and import/export window.
 * @memberOf Background
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {number} 		tab_id 		tab id
 * @param  {function} 	callback 	function to call (at most once) when you have a response
 * @return {boolean}
 */
function handleNotifications(name, message, tab_id, callback) {
	if (name === 'dismissCMPMessage') {
		if (cmp.CMP_DATA && cmp.CMP_DATA.length) {
			cmp.CMP_DATA.splice(0, 1);
		}
	} else if (name === 'openTab') {
		utils.openNewTab(message);
		if (callback) {
			callback();
			return true;
		}
	} else if (name === 'importFile') {
		// File is read in content script
		try {
			const backup = JSON.parse(message);

			if (backup.hash !== common.hashCode(JSON.stringify(backup.settings))) {
				throw new Error('Invalid hash');
			}

			const data = (backup.settings || {}).conf || {};
			data.alert_bubble_timeout = (data.alert_bubble_timeout > 30) ? 30 : data.alert_bubble_timeout;
			data.settings_last_imported = Number((new Date()).getTime());
			panelData.set(data);
			utils.getActiveTab((tab) => {
				const tabId = tab ? tab.id : tab_id;
				sendMessage(
					tabId,
					'onFileImported',
					{
						type: 'message',
						text: `${t('settings_import_success')} ${moment(data.settings_last_imported).format('LLL')}`
					}
				);
			});
		} catch (err) {
			utils.getActiveTab((tab) => {
				const tabId = tab ? tab.id : tab_id;
				sendMessage(
					tabId,
					'onFileImported',
					{
						type: 'error',
						text: t('settings_import_file_error')
					}
				);
			});
		}
	}
	return false;
}

/**
 * Handle messages sent from dist/click_to_play.js content script.
 * Includes handling of clicks on overlay icons.
 * @memberOf Background
 *
 * @param  {string} 	name  		message name
 * @param  {Object} 	message 	message data
 * @param  {number} 		tab_id 		tab id
 * @param  {function} 	callback 	function to call (at most once) when you have a response
 */
function handleClick2Play(name, message, tab_id, callback) {
	if (name === 'processC2P') {
		// Note: if the site is restricted, the 'allow always' button will not be shown
		if (message.action === 'always') {
			const tab_host = tabInfo.getTabInfo(tab_id, 'host');
			message.app_ids.forEach((aid) => {
				allowAllwaysC2P(aid, tab_host);
			});
			callback();
			return true;
		}
		if (message.action === 'once') {
			c2pDb.allowOnce(message.app_ids, tab_id);
			callback();
			return true;
		}
	}
}

/**
 * Handle messages sent from dist/blocked_redirect.js content script.
 * Used for C2P page redirect blocking.
 * @memberOf Background
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {number} 	tab_id 		tab id
 * @param  {function} 	callback 	function to call (at most once) when you have a response
 */
function handleBlockedRedirect(name, message, tab_id, callback) {
	if (name === 'getBlockedRedirectData') {
		callback(globals.BLOCKED_REDIRECT_DATA);
		return true;
	}
	if (name === 'allow_always_page_c2p_tracker') {
		// Allow always - unblock this tracker
		// Note: if the site is restricted, the 'allow always' button will not be shown
		const tab_host = tabInfo.getTabInfo(tab_id, 'host');
		allowAllwaysC2P(message.app_id, tab_host);
		chrome.tabs.update(tab_id, { url: message.url });
	} else if (name === 'allow_once_page_c2p_tracker') {
		// Allow once - temporarily allow redirects
		globals.LET_REDIRECTS_THROUGH = true;
		chrome.tabs.update(tab_id, { url: message.url });
	}

	return false;
}

/**
 * Handle messages sent from dist/rewards.js content script.
 * @memberOf Background
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {number} 	tab_id 		tab id
 * @param  {function} 	callback 	function to call (at most once) when you have a response
 */
function handleRewards(name, message, callback) {
	switch (name) {
		case 'rewardSignal': // e.g. hub_open | hub_closed
			Rewards.sendSignal(message);
			break;
		case 'ping':
			metrics.ping(message);
			break;
		case 'setPanelData':
			if (message.hasOwnProperty('enable_offers')) {
				Rewards.sendSignal(message.signal);
				panelData.set({ enable_offers: message.enable_offers });
			}
			return callback();
		default:
			break;
	}
}

/**
 * Handle messages sent from The Ghostery Hub: app/hub.
 * @param  {string}   name     message name
 * @param  {object}   message  message data
 * @param  {function} callback function to call when you have a response
 */
function handleGhosteryHub(name, message, callback) {
	switch (name) {
		case 'SET_PREMIUM_PROMO_MODAL_SEEN':
			promoModals.recordPremiumPromoSighting();
			break;
		case 'SEND_PING': {
			const { type } = message;
			metrics.ping(type);
			callback();
			break;
		}
		case 'GET_HOME_PROPS': {
			const {
				setup_complete,
				tutorial_complete,
				enable_metrics,
			} = conf;
			callback({
				setup_complete,
				tutorial_complete,
				enable_metrics,
			});
			break;
		}
		case 'GET_SETUP_SHOW_WARNING_OVERRIDE': {
			const { setup_show_warning_override } = conf;
			callback({ setup_show_warning_override });
			break;
		}
		case 'SET_SETUP_STEP': {
			let { setup_step } = message;
			if (setup_step === 7) {
				panelData.set({ setup_step });
			} else if (setup_step > conf.setup_step) {
				panelData.set({ setup_step });
				if (setup_step === 8) {
					const { setup_number } = conf;
					panelData.set({ setup_number: setup_number ? 2 : 1 });
					metrics.ping('setup_start');
				}
			} else {
				({ setup_step } = setup_step);
			}
			callback({ setup_step });
			break;
		}
		case 'SET_BLOCKING_POLICY': {
			const { blockingPolicy } = message;
			switch (blockingPolicy) {
				case 'BLOCKING_POLICY_RECOMMENDED': {
					panelData.set({ setup_block: 5 });
					setGhosteryDefaultBlocking();
					break;
				}
				case 'BLOCKING_POLICY_NOTHING': {
					panelData.set({ setup_block: 1 });
					const selected_app_ids = {};
					panelData.set({ selected_app_ids });
					break;
				}
				case 'BLOCKING_POLICY_EVERYTHING': {
					panelData.set({ setup_block: 3 });
					const selected_app_ids = {};
					const app_ids = Object.keys(bugDb.db.apps);
					for (let i = 0; i < app_ids.length; i++) {
						const app_id = app_ids[i];
						if (!selected_app_ids.hasOwnProperty(app_id)) {
							selected_app_ids[app_id] = 1;
						}
					}
					panelData.set({ selected_app_ids });
					break;
				}
				case 'BLOCKING_POLICY_CUSTOM': {
					panelData.set({ setup_block: 4 });
					// Blocking app_ids is handled by Global Blocking blocking.js
					break;
				}
				default: break;
			}
			callback({ blockingPolicy });
			break;
		}
		case 'SET_GHOSTERY_REWARDS': {
			const { enable_ghostery_rewards = true } = message;
			Rewards.sendSignal({
				actionId: `rewards_${enable_ghostery_rewards ? 'on' : 'off'}`,
				origin: 'ghostery-setup-flow',
				type: 'action-signal',
			});
			panelData.set({ enable_offers: enable_ghostery_rewards });
			callback({ enable_ghostery_rewards });
			break;
		}
		case 'SET_TUTORIAL_COMPLETE': {
			panelData.set(message);
			metrics.ping('tutorial_complete');
			callback(message);
			break;
		}
		case 'SET_METRICS':
		case 'SET_SETUP_SHOW_WARNING_OVERRIDE':
		case 'SET_ANTI_TRACKING':
		case 'SET_AD_BLOCK':
		case 'SET_SMART_BLOCK':
		case 'SET_HUMAN_WEB':
		case 'SET_SETUP_COMPLETE': {
			panelData.set(message);
			callback(message);
			break;
		}
		default: break;
	}
}

/**
 * Handle messages sent from dist/purplebox.js content script.
 * @memberOf Background
 *
 * @param  {string} 	name 			message name
 * @param  {Object} 	message 		message data
 * @param  {number} 		tab_id 			tab id
 * @param  {function} 	callback 		function to call (at most once) when you have a response
 */
function handlePurplebox(name, message) {
	if (name === 'updateAlertConf') {
		conf.alert_expanded = message.alert_expanded;
		conf.alert_bubble_pos = message.alert_bubble_pos;
		conf.alert_bubble_timeout = message.alert_bubble_timeout;
		// push new settings to API
		account.saveUserSettings().catch(err => log('Background handlePurplebox', err));
	}
	return false;
}

/**
 * Aggregated handler for <b>runtime.onMessage</b>
 *
 * All callbacks are used synchronously.
 * Some of messages come from Cliqz content script
 * bundle, we should filter those out.
 * @memberOf Background
 *
 * @param  {Object}   request 	the message sent by the calling script
 * @param  {Object}   sender 	an object containing information about the script context that sent a message or request
 * @param  {function} callback 	function to call (at most once) when you have a response
 * @return {boolean}            denotes async (true) or sync (false)
 */
function onMessageHandler(request, sender, callback) {
	if (request.source === 'cliqz-content-script') {
		return;
	}
	const {
		name, message, origin
	} = request;
	const { tab } = sender;
	const tab_id = tab && tab.id;

	// HANDLE PAGE EVENTS HERE
	if (origin === 'account_pages') {
		// Account pages
		return handleAccountPages(name, callback);
	}
	if (origin === 'purplebox') {
		// Purplebox script events
		return handlePurplebox(name, message, tab_id, callback);
	}
	if (origin === 'ghostery_dot_com') {
		// Ghostery.com and apps pages
		return handleGhosteryDotCom(name, message, tab_id);
	}
	if (origin === 'page_performance' && name === 'recordPageInfo') {
		tabInfo.setTabInfo(tab_id, 'pageTiming', message.performanceAPI);
		panelData.postPageLoadTime(tab_id);
		return false;
	}
	if (origin === 'notifications') {
		return handleNotifications(name, message, tab_id);
	}
	if (origin === 'click_to_play') {
		return handleClick2Play(name, message, tab_id, callback);
	}
	if (origin === 'blocked_redirect') {
		return handleBlockedRedirect(name, message, tab_id, callback);
	}
	if (origin === 'rewards' || origin === 'rewardsPanel') {
		return handleRewards(name, message, callback);
	}
	if (origin === 'ghostery-hub') {
		return handleGhosteryHub(name, message, callback);
	}

	// HANDLE UNIVERSAL EVENTS HERE (NO ORIGIN LISTED ABOVE)
	// The 'getPanelData' message is never sent by the panel, which uses ports only since 8.3.2
	// The message is still sent by panel-android and by the setup hub as of 8.4.0
	if (name === 'getPanelData') {
		if (!message.tabId) {
			utils.getActiveTab((tab) => {
				const data = panelData.get(message.view, tab);
				callback(data);
			});
		} else {
			chrome.tabs.get(+message.tabId, (tab) => {
				const data = panelData.get(message.view, tab);
				callback(data);
			});
		}
		account.getUserSettings().catch(err => log('Failed getting user settings from getPanelData:', err));
		return true;
	}
	if (name === 'getStats') {
		insights.action('getStatsTimeline', message.from, message.to, true, true).then((data) => {
			callback(data);
		});
		return true;
	}
	if (name === 'getAllStats') {
		insights.action('getAllDays').then((data) => {
			insights.action('getStatsTimeline', moment(data[0]), moment(), true, true).then((data) => {
				callback(data);
			});
		});
		return true;
	}
	if (name === 'resetStats') {
		metrics.ping('hist_reset_stats');
		insights.action('clearData');
		return false;
	}
	if (name === 'setPanelData') {
		panelData.set(message);
		callback();
		return false;
	}
	if (name === 'account.getTheme') {
		if (conf.current_theme !== 'default') {
			account.getTheme(conf.current_theme).then(() => {
				callback(conf.account.themeData[conf.current_theme]);
			});
			return true;
		}
		callback();
		return false;
	}
	if (name === 'getCliqzModuleData') { // panel-android only
		utils.getActiveTab((tab) => {
			sendCliqzModuleCounts(tab.id, tab.pageHost, callback);
		});
		return true;
	}
	if (name === 'getTrackerDescription') {
		utils.getJson(message.url).then((result) => {
			const description = (result) ? ((result.company_in_their_own_words) ? result.company_in_their_own_words : ((result.company_description) ? result.company_description : '')) : '';
			callback(description);
		});
		return true;
	}
	if (name === 'account.login') {
		metrics.ping('sign_in');
		const { email, password } = message;
		account.login(email, password)
			.then((response) => {
				if (!response.hasOwnProperty('errors')) {
					metrics.ping('sign_in_success');
				}
				callback(response);
			})
			.catch((err) => {
				log('LOGIN ERROR', err);
				callback({ errors: _getJSONAPIErrorsObject(err) });
			});
		return true;
	}
	if (name === 'account.register') {
		const {
			email, confirmEmail, password, firstName, lastName
		} = message;
		account.register(email, confirmEmail, password, firstName, lastName)
			.then((response) => {
				if (!response.hasOwnProperty('errors')) {
					metrics.ping('create_account_success');
				}
				callback(response);
			})
			.catch((err) => {
				callback({ errors: [err] });
				log('REGISTER ERROR', err);
			});
		return true;
	}
	if (name === 'account.logout') {
		account.logout()
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				log('LOGOUT ERROR', err);
				callback(err);
			});
		return true;
	}
	if (name === 'account.getUserSettings') {
		account.getUserSettings()
			.then((settings) => {
				callback(settings);
			})
			.catch((err) => {
				log('Error getting user settings:', err);
				callback({ errors: _getJSONAPIErrorsObject(err) });
			});
		return true;
	}
	if (name === 'account.getUserSubscriptionData') {
		account.getUserSubscriptionData()
			.then((customer) => {
				// TODO temporary fix to handle multiple subscriptions
				let sub = customer.subscriptions;
				if (!Array.isArray(sub)) {
					sub = [sub];
				}
				const subscriptionData = sub.reduce((acc, curr) => {
					let a = acc;
					if (curr.productName.includes('Plus')) {
						a = curr;
					}
					return a;
				}, {});
				callback({ subscriptionData });
			})
			.catch((err) => {
				log('Error getting user subscription data:', err);
				callback({ errors: _getJSONAPIErrorsObject(err) });
			});
		return true;
	}
	if (name === 'account.openSubscriptionPage') {
		utils.openNewTab({ url: `${globals.ACCOUNT_BASE_URL}/subscription`, become_active: true });
		return false;
	}
	if (name === 'account.openCheckoutPage') {
		let url = `${globals.CHECKOUT_BASE_URL}/plus`;
		const { utm } = message || null;
		if (utm) {
			url += `?utm_source=${utm.utm_source}&utm_campaign=${utm.utm_campaign}`;
		}
		utils.openNewTab({ url, become_active: true });
		return false;
	}
	if (name === 'account.openSupportPage') {
		metrics.ping('priority_support_submit');
		const subscriber = account.hasScopesUnverified(['subscriptions:plus']);
		const tabUrl = subscriber ? `${globals.ACCOUNT_BASE_URL}/support` : 'https://www.ghostery.com/support/';
		utils.openNewTab({ url: tabUrl, become_active: true });
		return false;
	}
	if (name === 'account.resetPassword') {
		const { email } = message;
		account.resetPassword(email)
			.then((success) => {
				callback(success);
			})
			.catch((err) => {
				callback({ errors: _getJSONAPIErrorsObject(err) });
				log('RESET PASSWORD ERROR', err);
			});
		return true;
	}
	if (name === 'account.getUser') {
		account.getUser(message)
			.then((foundUser) => {
				const user = { user: { ...foundUser } };
				if (foundUser) {
					user.user.subscriptionsPlus = account.hasScopesUnverified(['subscriptions:plus']);
				}
				callback(user);
			})
			.catch((err) => {
				callback({ errors: _getJSONAPIErrorsObject(err) });
				log('FETCH USER ERROR', err);
			});
		return true;
	}
	if (name === 'account.sendValidateAccountEmail') {
		account.sendValidateAccountEmail()
			.then((success) => {
				callback(success);
			})
			.catch((err) => {
				callback({ errors: _getJSONAPIErrorsObject(err) });
				log('sendValidateAccountEmail error', err);
			});
		return true;
	}
	if (name === 'update_database') {
		checkLibraryVersion().then((result) => {
			callback(result);
		});
		return true;
	}
	if (name === 'getSiteData') { // used by HeaderView.js clickBrokenPage()
		getSiteData().then((result) => {
			callback(result);
		});
		return true;
	}
	if (name === 'openNewTab') {
		utils.openNewTab(message);
		return false;
	}
	if (name === 'reloadTab') {
		reloadTab(message);
		closeAndroidPanelTabs();
		return false;
	}
	if (name === 'getSettingsForExport') {
		utils.getActiveTab((tab) => {
			if (tab && tab.id && tab.url.startsWith('http')) {
				const settings = account.buildUserSettings();
				// Blacklisted and whitelisted sites are removed from sync array,
				// but we want to allow export and import these properties manually
				settings.site_blacklist = conf.site_blacklist;
				settings.site_whitelist = conf.site_whitelist;

				try {
					const hash = common.hashCode(JSON.stringify({ conf: settings }));
					const backup = JSON.stringify({ hash, settings: { conf: settings } });
					utils.injectNotifications(tab.id, true).then(() => {
						sendMessage(tab.id, 'exportFile', backup);
					});
					callback(true);
				} catch (e) {
					callback(false);
				}
			} else {
				callback(false);
			}
		});
		return true;
	}
	if (name === 'ping') {
		metrics.ping(message);
		return false;
	}
	if (name === 'showBrowseWindow') {
		utils.getActiveTab((tab) => {
			if (tab && tab.id && tab.url.startsWith('http')) {
				utils.injectNotifications(tab.id, true).then((result) => {
					if (result) {
						sendMessage(tab.id, 'showBrowseWindow', {
							translations: {
								browse_button_label: t('browse_button_label'), // Browse...
								select_file_for_import: t('select_file_for_import'), // Select .ghost file for import
								file_was_not_selected: t('file_was_not_selected') // File was not selected
							}
						}, () => {
							if (chrome.runtime.lastError) {
								callback(t('refresh_and_try_again'));
							} else {
								callback(true);
							}
						});
					}
				});
			} else {
				callback(t('not_http_page'));
			}
		});
		return true;
	}
	if (name === 'promoModals.sawPremiumPromo') {
		promoModals.recordPremiumPromoSighting();
		return false;
	}
	if (name === 'promoModals.sawInsightsPromo') {
		promoModals.recordInsightsPromoSighting();
		return false;
	}
	if (name === 'promoModals.sawPlusPromo') {
		promoModals.recordPlusPromoSighting();
		return false;
	}
	if (name === 'promoModals.turnOffPromos') {
		promoModals.turnOffPromos();
		return false;
	}
}

/**
 * Initialize Dispatcher Events.
 * All Conf properties trigger a dispatcher pub event
 * whenever the value is set/updated.
 * @memberOf Background
 */
function initializeDispatcher() {
	dispatcher.on('conf.save.selected_app_ids', (appIds) => {
		const num_selected = size(appIds);
		const { db } = bugDb;
		db.noneSelected = (num_selected === 0);
		// can't simply compare num_selected and size(db.apps) since apps get removed sometimes
		db.allSelected = (!!num_selected && every(db.apps, (app, app_id) => appIds.hasOwnProperty(app_id)));
	});
	dispatcher.on('conf.save.site_whitelist', () => {
		// TODO debounce with below
		button.update();
		utils.flushChromeMemoryCache();
		cliqz.modules.core.action('refreshAppState');
	});
	dispatcher.on('conf.save.enable_human_web', (enableHumanWeb) => {
		if (!IS_CLIQZ) {
			setCliqzModuleEnabled(humanweb, enableHumanWeb).then(() => {
				setupABTest();
			});
		} else {
			setCliqzModuleEnabled(humanweb, false);
		}
	});
	dispatcher.on('conf.save.enable_offers', (enableOffersIn) => {
		button.update();
		const firstStep = Promise.resolve();
		let enableOffers = enableOffersIn;
		if (IS_CLIQZ) {
			enableOffers = false;
		} else if (!enableOffers && cliqz.modules['offers-v2'].isEnabled) {
			cliqz.modules['offers-v2'].action('flushSignals');
		}

		const toggleModule = () => setCliqzModuleEnabled(offers, enableOffers);
		const toggleConnection = () => registerWithOffers(offers, enableOffers);
		if (enableOffers) {
			firstStep.then(toggleModule).then(toggleConnection);
		} else {
			firstStep.then(toggleConnection).then(toggleModule);
		}
	});
	dispatcher.on('conf.save.enable_anti_tracking', (enableAntitracking) => {
		if (!IS_CLIQZ) {
			setCliqzModuleEnabled(antitracking, enableAntitracking);
		} else {
			setCliqzModuleEnabled(antitracking, false);
		}
	});
	dispatcher.on('conf.save.enable_ad_block', (enableAdBlock) => {
		if (!IS_CLIQZ) {
			setCliqzModuleEnabled(adblocker, enableAdBlock);
		} else {
			setCliqzModuleEnabled(adblocker, false);
		}
	});
	dispatcher.on('conf.save.cliqz_adb_mode', (val) => {
		if (!IS_CLIQZ) {
			cliqz.prefs.set('cliqz-adb-mode', val);
		}
	});
	dispatcher.on('conf.changed.settings', debounce((key) => {
		log('Conf value changed for a watched user setting:', key);
	}, 200));
	dispatcher.on('globals.save.paused_blocking', () => {
		// if user has paused Ghostery, suspect broken page
		if (globals.SESSION.paused_blocking) { metrics.handleBrokenPageTrigger(globals.BROKEN_PAGE_PAUSE); }
		// update content script state when blocking is paused/unpaused
		cliqz.modules.core.action('refreshAppState');
	});
}

/**
 * Determine Antitracking configuration parameters based
 * on the results returned from the abtest endpoint.
 * @memberOf Background
 *
 * @return {Object} 	Antitracking configuration parameters
 */
function getAntitrackingTestConfig() {
	if (abtest.hasTest('antitracking_full')) {
		return {
			qsEnabled: true,
			telemetryMode: 2,
		};
	}
	if (abtest.hasTest('antitracking_half')) {
		return {
			qsEnabled: true,
			telemetryMode: 1,
		};
	}
	if (abtest.hasTest('antitracking_collect')) {
		return {
			qsEnabled: false,
			telemetryMode: 1,
		};
	}
	return {
		qsEnabled: true,
		telemetryMode: 1,
	};
}

/**
 * Adjust antitracking parameters based on the current state
 * of ABTest and availability of Human Web.
 */
function setupABTest() {
	const antitrackingConfig = getAntitrackingTestConfig();
	if (antitrackingConfig && conf.enable_anti_tracking) {
		if (!conf.enable_human_web) {
			// force disable anti-tracking telemetry on humanweb opt-out
			antitrackingConfig.telemetryMode = 0;
		}
		Object.keys(antitrackingConfig).forEach((opt) => {
			const val = antitrackingConfig[opt];
			log('antitracking', 'set config option', opt, val);
			antitracking.action('setConfigOption', opt, val);
		});
	}
	if (abtest.hasTest('antitracking_whitelist2')) {
		cliqz.prefs.set('attrackBloomFilter', false);
	}
	// overlay search AB test
	// if (abtest.hasTest('overlay_search')) {
	// 	cliqz.enableModule('search');
	// 	cliqz.enableModule('overlay');
	// } else {
	// 	cliqz.disableModule('search');
	// 	cliqz.disableModule('overlay');
	// }
}

/**
 * WebRequest pipeline initialisation: find which Cliqz modules are enabled,
 * add their handlers, then put Ghostery event handlers before them all.
 * If Cliqz modules are subsequently enabled, their event handlers will always
 * be added after Ghostery's.
 * @memberOf Background
 *
 * @return {Promise}  		a single Promise that resolves when both webRequestPipeline
 *                        	actions resolve. It rejects when webRequestPipeline is disabled
 *                        	or one of the webRequestPipeline actions rejects.
 */
function initialiseWebRequestPipeline() {
	const webRequestPipeline = cliqz.modules['webrequest-pipeline'];
	if (webRequestPipeline.isDisabled) {
		// no pipeline... this shouldn't happen
		return Promise.reject(new Error('cannot initialise webrequest pipeline: module disabled'));
	}
	// remove ghostery listeners from standard webrequest events
	chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
	chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived);

	// look for steps from other modules which we need to be before
	const existingSteps = { onBeforeRequest: [], onHeadersReceived: [] };
	if (antitracking.isEnabled) {
		existingSteps.onBeforeRequest.push('antitracking.onBeforeRequest');
		existingSteps.onHeadersReceived.push('antitracking.onHeadersReceived');
	}
	if (adblocker.isEnabled) {
		existingSteps.onBeforeRequest.push('adblocker');
	}
	return Promise.all([
		webRequestPipeline.action('addPipelineStep', 'onBeforeRequest', {
			name: 'ghostery.onBeforeRequest',
			spec: 'blocking',
			before: existingSteps.onBeforeRequest,
			fn: (state, response) => {
				const result = events.onBeforeRequest(state);
				if (result && (result.cancel === true || result.redirectUrl)) {
					Object.assign(response, result);
				}
				return true;
			}
		}),
		webRequestPipeline.action('addPipelineStep', 'onHeadersReceived', {
			name: 'ghostery.onHeadersReceived',
			spec: 'collect',
			before: existingSteps.onHeadersReceived,
			fn: (state) => {
				Events.onHeadersReceived(state);
				return true;
			}
		})
	]);
}
/**
 * Determine if a page url is whitelisted by Ghostery by selection
 * or because Ghostery is paused. Whitelisting a site means that
 * web requests triggered by this page should not be blocked or altered.
 * @memberOf Background
 *
 * @return {boolean}
 */
function isWhitelisted(state) {
	// state.ghosteryWhitelisted is sometimes undefined so force to bool
	return Boolean(globals.SESSION.paused_blocking || Policy.getSitePolicy(state.tabUrl, state.url) === 2 || state.ghosteryWhitelisted);
}
/**
 * Set listener for 'enabled' event for Antitracking module which replaces
 * Antitracking isWhitelisted method with Ghostery's isWhitelisted method.
 * The reason: if site is whitelisted by Ghostery, it should be whitelisted by
 * any Cliqz module which may block/alter tracker requests.
 * @memberOf Background
 */
antitracking.on('enabled', () => {
	antitracking.isReady().then(() => {
		antitracking.action('setWhiteListCheck', isWhitelisted);
	});
});

/**
 * Set listener for 'enabled' event for Adblock module
 * which replaces Adblock isWhitelisted method with Ghostery's isWhitelisted method
 * @memberOf Background
 */
adblocker.on('enabled', () => {
	adblocker.isReady().then(() => {
		adblocker.action('addWhiteListCheck', isWhitelisted);
	});
});

/**
 * Set listener for 'enabled' event for Offers module
 * @memberOf Background
 */
offers.on('enabled', () => {
	offers.isReady().then(() => {
		if (DEBUG) {
			offers.action('setConfiguration', {
				config_location: 'de',
				triggersBE: 'https://offers-api-staging-myo.myoffrz.ninja',
				showConsoleLogs: true,
				offersLogsEnabled: true,
				offersDevFlag: true,
				offersTelemetryFreq: '10'
			});
		}
		registerWithOffers(offers, true);
	});
});

/**
 * Add page listeners for insights stats.
 * @memberOf Background
 */
insights.on('enabled', () => {
	events.addPageListener((tab_id, info, apps, bugs) => {
		cliqz.modules.insights.action('pushGhosteryPageStats', tab_id, info, apps, bugs);
	});
});
insights.on('disabled', () => {
	events.clearPageListeners();
});

/**
 * Pulls and aggregates data to be passed to Ghostery Tab extension.
 * @memberOf Background
 */
function getDataForGhosteryTab(callback) {
	const passedData = {};
	insights.action('getAllDays').then((data) => {
		insights.action('getStatsTimeline', moment(data[0]), moment(), true, true).then((data) => {
			const cumulativeData = {
				adsBlocked: 0, cookiesBlocked: 0, dataSaved: 0, fingerprintsRemoved: 0, loadTime: 0, pages: 0, timeSaved: 0, trackerRequestsBlocked: 0, trackersBlocked: 0, trackersDetected: 0
			};
			data.forEach((entry) => {
				Object.keys(cumulativeData).forEach((key) => {
					cumulativeData[key] += entry[key];
				});
			});
			passedData.cumulativeData = cumulativeData;
		}).then(() => {
			passedData.blockTrackersEnabled = !globals.SESSION.paused_blocking;
			passedData.adBlockEnabled = globals.SESSION.paused_blocking ? false : conf.enable_ad_block;
			passedData.antiTrackingEnabled = globals.SESSION.paused_blocking ? false : conf.enable_anti_tracking;
			callback(passedData);
		});
	});
}

/**
 * Initialize Ghostery panel.
 * @memberOf Background
 */
function initializePopup() {
	if (BROWSER_INFO.os === 'android') {
		chrome.browserAction.onClicked.addListener((tab) => {
			chrome.tabs.create({
				url: chrome.extension.getURL(`app/templates/panel_android.html?tabId=${tab.id}`),
				active: true,
			});
		});
	} else {
		chrome.browserAction.setPopup({
			popup: 'app/templates/panel.html',
		});
	}
}

/**
 * Add listeners to the events which are watched by Ghostery,
 * in case Antitracking and Adblocking are both disabled,
 * and webRequestPipeline is not running.
 * @memberOf Background
 */
function addCommonGhosteryAndAntitrackingListeners() {
	let urlFilters = ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'];
	if (IS_EDGE || IS_FIREFOX) {
		// Prevent Firefox from asking users to re-validate permissions on upgrade
		// TODO: Allow websocket filters on Edge via Cliqz pipeline
		urlFilters = urlFilters.reduce((accumulator, currentValue) => {
			if (!currentValue.match(/^wss?:\/\//)) {
				accumulator.push(currentValue);
			}
			return accumulator;
		}, []);
	}
	chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls: urlFilters }, ['blocking']);
	chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, { urls: urlFilters }, ['responseHeaders']);
}

/**
 * Set all event listeners for the application.
 * @memberOf Background
 */
function initializeEventListeners() {
	/** * WEB NAVIGATION ** */

	// Fired when a navigation is about to occur
	chrome.webNavigation.onBeforeNavigate.addListener(events.onBeforeNavigate.bind(events));

	// Fired when a navigation is committed
	chrome.webNavigation.onCommitted.addListener(events.onCommitted.bind(events));

	// Fired when the page's DOM is fully constructed, but the referenced resources may not finish loading
	chrome.webNavigation.onDOMContentLoaded.addListener(Events.onDOMContentLoaded.bind(events));

	// Fired when a document, including the resources it refers to, is completely loaded and initialized
	chrome.webNavigation.onCompleted.addListener(Events.onNavigationCompleted.bind(events));

	// Fired when a new window, or a new tab in an existing window, is created to host a navigation.
	// chrome.webNavigation.onCreatedNavigationTarget

	// Fired when the contents of the tab is replaced by a different (usually previously pre-rendered) tab.
	// chrome.webNavigation.onTabReplaced

	// Fired when the reference fragment of a frame was updated. All future events for that frame will use the updated URL.
	// chrome.webNavigation.onReferenceFragmentUpdated

	// Fired when the frame's history was updated to a new URL. All future events for that frame will use the updated URL.
	// if (chrome.webNavigation.onHistoryStateUpdated) {
	// 	chrome.webNavigation.onHistoryStateUpdated
	// }

	// Fires when navigation fails on any of its steps
	chrome.webNavigation.onErrorOccurred.addListener(events.onNavigationErrorOccurred.bind(events));

	/** * WEB REQUEST ** */

	// Fires when a request is about to occur
	// chrome.webRequest.onBeforeRequest

	// Fires when a request is about to send headers
	chrome.webRequest.onBeforeSendHeaders.addListener(Events.onBeforeSendHeaders.bind(events), {
		urls: [
			'https://l.ghostery.com/*',
			'https://d.ghostery.com/*',
			'https://cmp-cdn.ghostery.com/*',
			'https://cdn.ghostery.com/*',
			'https://apps.ghostery.com/*',
			'https://gcache.ghostery.com/*'
		]
	}, ['requestHeaders', 'blocking']);

	// Fires each time that an HTTP(S) response header is received
	// chrome.webRequest.onHeadersReceived

	// Add onBeforeRequest and onHeadersReceived listeners which are shared by Ghostery and Antitracking
	addCommonGhosteryAndAntitrackingListeners();

	// Fires when a redirect is about to be executed
	chrome.webRequest.onBeforeRedirect.addListener(events.onBeforeRedirect.bind(events), {
		urls: ['http://*/*', 'https://*/*']
	});

	// Fires when a request has been processed successfully
	chrome.webRequest.onCompleted.addListener(events.onRequestCompleted.bind(events), {
		urls: ['http://*/*', 'https://*/*']
	});

	// Fires when a request could not be processed successfully
	chrome.webRequest.onErrorOccurred.addListener(Events.onRequestErrorOccurred.bind(events), {
		urls: ['http://*/*', 'https://*/*']
	});

	/** * TABS ** */

	// Fired when a new tab is created by user or internally
	chrome.tabs.onCreated.addListener(Events.onTabCreated.bind(events));

	// Fires when the active tab in a window changes
	chrome.tabs.onActivated.addListener(Events.onTabActivated.bind(events));

	// Fired when a tab is replaced with another tab due to prerendering
	chrome.tabs.onReplaced.addListener(events.onTabReplaced.bind(events));

	// Fired when a tab is closed
	chrome.tabs.onRemoved.addListener(events.onTabRemoved.bind(events));

	// Remove beforeunload handler and Chrome will skip chrome.tabs.onRemoved
	// when browser is closed with 'X' button.
	window.addEventListener('beforeunload', () => {});

	/** * MESSAGES ** */

	// Fired when a message is sent from either an extension process (by runtime.sendMessage) or a content script (by tabs.sendMessage).
	onMessage.addListener(onMessageHandler);

	// This port transmits data to panel extension components in response to user navigation between panel components
	// and to changes in the background data as the page loads, making the extension UI dynamic
	chrome.runtime.onConnect.addListener((port) => {
		if (port.name === 'dynamicUIPanelPort') {
			panelData.initPort(port);
		}
	});

	// Fired when another extension sends a message, accepts message if it's from Ghostery Tab
	// NOTE: not supported on Firefox < v54
	if (typeof chrome.runtime.onMessageExternal === 'object') {
		chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
			const recognized = [
				globals.GHOSTERY_TAB_CHROME_PRODUCTION_ID,
				globals.GHOSTERY_TAB_CHROME_PRERELEASE_ID,
				globals.GHOSTERY_TAB_CHROME_TEST_ID,
				globals.GHOSTERY_TAB_FIREFOX_PRODUCTION_ID,
				globals.GHOSTERY_TAB_FIREFOX_TEST_ID
			].indexOf(sender.id) !== -1;

			if (recognized && request.name === 'getStatsAndSettings') {
				getDataForGhosteryTab(data => sendResponse({ historicalDataAndSettings: data }));
				return true;
			}
			return false;
		});
	}
}

/**
 * Establish current and previous application versions.
 * @memberOf Background
 */
function initializeVersioning() {
	log('INITIALIZE VERSIONING. CURRENT VERSION IS:', globals.EXTENSION_VERSION);
	const PREVIOUS_EXTENSION_VERSION = conf.previous_version;

	// New installs
	if (!PREVIOUS_EXTENSION_VERSION) {
		log('NEW INSTALL');
		conf.previous_version = globals.EXTENSION_VERSION;

		const version_history = [];
		version_history.push(globals.EXTENSION_VERSION);
		conf.version_history = version_history;

		// if we get nothing back, then this is a fresh install
		globals.JUST_INSTALLED = true;
	} else {
		// We get here when the previous version exists, so let's check if it's an upgrade.
		log('PREVIOUS VERSION EXISTS', PREVIOUS_EXTENSION_VERSION);
		globals.JUST_INSTALLED = false;
		globals.JUST_UPGRADED = (PREVIOUS_EXTENSION_VERSION !== globals.EXTENSION_VERSION);

		if (globals.JUST_UPGRADED) {
			log('THIS IS AN UPGRADE');
			conf.previous_version = globals.EXTENSION_VERSION;
			const { version_history } = conf;
			const versions = [...version_history].sort(utils.semverCompare);
			const prevVersion = PREVIOUS_EXTENSION_VERSION.split('.');
			const currentVersion = globals.EXTENSION_VERSION.split('.');

			// Is it a hot fix?
			if ((prevVersion[0] === currentVersion[0]) &&
				(prevVersion[1] === currentVersion[1])) {
				log('THIS IS A HOT FIX UPGRADE');
				globals.HOTFIX = true;
			}
			// Are we upgrading from Ghostery 7?
			if (prevVersion[0] < 8) {
				globals.JUST_UPGRADED_FROM_7 = true;
				conf.is_expert = true;
				conf.enable_smart_block = false;
			}

			// Check if the earliest version is < 8.4.2
			if (versions.length && utils.semverCompare(versions[0], '8.4.2') === -1) {
				globals.REQUIRE_LEGACY_OPT_IN = true;
			}

			// Establish version history
			version_history.push(globals.EXTENSION_VERSION);
			conf.version_history = version_history;
		} else {
			log('SAME VERSION OR NOT THE FIRST RUN');
		}
	}
}

/**
 * Ghostery Module Initializer.
 * Init all Ghostery and Cliqz modules.
 * @memberOf Background
 *
 * @return {Promise}
 */
function initializeGhosteryModules() {
	if (globals.JUST_UPGRADED) {
		log('JUST UPGRADED');
		metrics.ping('upgrade');
		// We don't want install_complete pings for upgrade
		conf.metrics.install_complete_all = Number(new Date().getTime());
	} else if (globals.JUST_INSTALLED) {
		log('JUST INSTALLED');
		const date = new Date();
		const year = date.getFullYear().toString();
		const month = (`0${date.getMonth() + 1}`).slice(-2).toString();
		const day = (`0${date.getDate()}`).slice(-2).toString();
		const dateString = `${year}-${month}-${day}`;
		const randomNumber = (Math.floor(Math.random() * 100) + 1);

		conf.install_random_number = randomNumber;
		conf.install_date = dateString;

		metrics.setUninstallUrl();

		metrics.ping('install');

		// Set 5 min timeout
		setTimeout(() => {
			metrics.ping('install_complete');
		}, 300000);

		// open the Ghostery Hub on install with justInstalled query parameter set to true
		chrome.tabs.create({
			url: chrome.runtime.getURL('./app/templates/hub.html?justInstalled=true'),
			active: true
		});
	} else {
		// Record install if the user previously closed the browser before the install ping fired
		metrics.ping('install');
		metrics.ping('install_complete');
	}
	// start cliqz app
	const cliqzStartup = cliqz.start().then(() => {
		// enable historical stats
		setCliqzModuleEnabled(insights, true);
		// run wrapper tasks which set up base integrations between ghostery and these modules
		Promise.all([
			initialiseWebRequestPipeline(),
		]).then(() => {
			if (!IS_CLIQZ) {
				conf.enable_ad_block = !adblocker.isDisabled;
				conf.enable_anti_tracking = !antitracking.isDisabled;
				conf.enable_human_web = !humanweb.isDisabled;
				conf.enable_offers = !offers.isDisabled;

				if (IS_FIREFOX) {
					if (globals.JUST_INSTALLED) {
						conf.enable_human_web = false;
						conf.enable_offers = false;
					} else if (globals.REQUIRE_LEGACY_OPT_IN && !conf.cliqz_legacy_opt_in) {
						conf.enable_human_web = false;
						conf.enable_offers = cliqz.prefs.get('myoffrz.opted_in') || false;
						conf.cliqz_legacy_opt_in = true;
					}
				}

				const myoffrzShouldMigrate = conf.rewards_opted_in !== undefined && cliqz.prefs.get('myoffrz.opted_in', undefined) === undefined;
				if (myoffrzShouldMigrate) {
					cliqz.prefs.set('myoffrz.opted_in', conf.rewards_opted_in);
					conf.rewards_opted_in = undefined;
				}

				cliqz.events.subscribe('myoffrz:turnoff', () => {
					panelData.set({ enable_offers: false });
					Rewards.sendSignal({
						actionId: 'rewards_off',
						type: 'action-signal',
					});
				});
			}
		});
	}).catch((e) => {
		log('cliqzStartup error', e);
	});

	if (IS_CLIQZ) {
		setCliqzModuleEnabled(hpnv2, false);
		setCliqzModuleEnabled(humanweb, false);
		setCliqzModuleEnabled(antitracking, false);
		setCliqzModuleEnabled(adblocker, false);
		setCliqzModuleEnabled(offers, false);
	}

	// Disable purplebox for Firefox Android users
	if (BROWSER_INFO.os === 'android' && IS_FIREFOX) {
		conf.show_alert = false;
	}

	// Set these tasks to run every hour
	function scheduledTasks() {
		// auto-fetch from CMP
		cmp.fetchCMPData();

		if (!IS_CLIQZ) {
			// auto-fetch human web offer
			abtest.fetch().then(() => {
				setupABTest();
			}).catch(() => {
				log('Unable to reach abtest server');
			});
		}
	}

	// Check CMP and ABTest every hour.
	setInterval(scheduledTasks, 3600000);

	// Update db right away.
	autoUpdateBugDb();
	// Schedule it to run every hour.
	setInterval(autoUpdateBugDb, 3600000);

	// listen for changes to specific conf properties
	initializeDispatcher();

	// Setup the ghostery button
	utils.getActiveTab((tab) => {
		let tabId = 0;
		if (tab) {
			tabId = tab.id;
		}
		button.update(tabId);
	});

	// record active ping
	metrics.ping('active');
	// initialize all tracker and surrogate DBs in parallel with Promise.all
	return Promise.all([
		bugDb.init(globals.JUST_UPGRADED),
		c2pDb.init(globals.JUST_UPGRADED),
		compDb.init(globals.JUST_UPGRADED),
		surrogatedb.init(globals.JUST_UPGRADED),
		cliqzStartup,
	]).then(() => {
		// run scheduledTasks on init
		scheduledTasks();
	});
}

/**
 * Application Initializer
 * Called whenever the browser starts or the extension is
 * installed/updated.
 * @memberOf Background
 */
function init() {
	return confData.init().then(() => {
		initializePopup();
		initializeEventListeners();
		initializeVersioning();
		return metrics.init(globals.JUST_INSTALLED).then(() => initializeGhosteryModules().then(() => {
			account.migrate()
				.then(() => {
					if (conf.account !== null) {
						return account.getUser()
							.then(account.getUserSettings)
							.then(() => {
								if (conf.current_theme !== 'default') {
									return account.getTheme(conf.current_theme);
								}
							});
					}
					if (globals.JUST_INSTALLED) {
						setGhosteryDefaultBlocking();
					}
				})
				.catch(err => log(err));
			// persist Conf properties to storage only after init has completed
			common.prefsSet(globals.initProps);
			globals.INIT_COMPLETE = true;
			if (IS_CLIQZ) {
				importCliqzSettings(cliqz, conf);
			}
		}));
	}).catch((err) => {
		log('Error in init()', err);
		return Promise.reject(err);
	});
}

// Initialize the application.
init();
