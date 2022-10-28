/**
 * Background
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

/**
 * @namespace Background
 */
import { debounce, every, size } from 'underscore';
import moment from 'moment/min/moment-with-locales.min';
import { tryWTMReportOnMessageHandler, isDisableWTMReportMessage } from '@whotracksme/webextension-packages/packages/trackers-preview/src/background/index';
import { getBrowserInfo } from '@ghostery/libs';

import common, {
	syncTrustedSites, setAdblockerState, setAntitrackingState, setWhotracksmeState, addMigration
} from './classes/Common';
import ghosteryDebugger from './classes/Debugger';
// object classes
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
import metrics from './classes/MetricsWrapper';
import account from './classes/Account';
import SearchMessager from './classes/SearchMessager';
import ErrorReporter from './classes/ErrorReporter';
// utilities
import { allowAllwaysC2P } from './utils/click2play';
import {
	log, alwaysLog, hashCode, prefsSet, prefsGet, getISODate
} from './utils/common';
import * as utils from './utils/utils';
import { injectNotifications } from './utils/inject';
import freeSpaceIfNearQuota from './utils/freeSpaceIfNearQuota';
import { _getJSONAPIErrorsObject } from './utils/api';
import { sendCommonModuleCounts } from './utils/commonModulesData';

import './modules/autoconsent';

// For debug purposes, provide Access to the internals of `ghostery-common`
// module from Developer Tools Console.
window.COMMON = common;

// For debug purposes, provide access to Ghostery's internal data.
window.ghostery = ghosteryDebugger;

// class instantiation
const events = new Events();
// function shortcuts
const { sendMessage } = utils;
const { onMessage } = chrome.runtime;
// simple consts
const {
	CDN_BASE_URL, BROWSER_INFO,
} = globals;
const IS_EDGE = getBrowserInfo.isEdge();
const IS_FIREFOX = getBrowserInfo.isFirefox();
const IS_ANDROID = getBrowserInfo.isAndroid();
const VERSION_CHECK_URL = `${CDN_BASE_URL}/update/v4.1/versions.json`;
const ONE_DAY_MSEC = 86400000;
const ONE_HOUR_MSEC = 3600000;
const onBeforeRequest = events.onBeforeRequest.bind(events);
const { onHeadersReceived } = Events;

/**
 * Pulls down latest version.json and triggers
 * updates of all db files. FKA checkLibraryVersion.
 * @memberOf Background
 *
 * @return {Promise} 	database updated data
 */
function updateDBs() {
	return new Promise(((resolve, reject) => {
		const failed = { success: false, updated: false };
		utils.getJson(`${VERSION_CHECK_URL}?d=${getISODate()}`).then((data) => {
			log('Database version retrieval succeeded', data);

			c2pDb.update(data.click2play);
			compDb.update(data.compatibility);
			bugDb.update(data.bugs, (result) => {
				log('CHECK LIBRARY VERSION CALLED', result);
				if (result.success) {
					const nowTime = Date.now();
					conf.bugs_last_checked = nowTime;
					if (result.updated) {
						log('BUGS LAST UPDATED UPDATED', new Date());
						conf.bugs_last_updated = nowTime;
					}
				}
				resolve({
					...result,
					confData: {
						bugs_last_checked: conf.bugs_last_checked,
						bugs_last_updated: conf.bugs_last_updated
					}
				});
			});
		}).catch((err) => {
			log('Error in updateDBs', err);
			reject(failed);
		});
	}));
}

function tryOpenOnboarding() {
	if (globals.JUST_UPGRADED) {
		conf.setup_complete = true;
	}

	if (conf.setup_complete || conf.setup_skip) {
		return;
	}

	const now = Date.now();
	if (!conf.setup_timestamp || ((now - conf.setup_timestamp) > ONE_DAY_MSEC)) {
		conf.setup_timestamp = now;
		chrome.tabs.create({
			url: chrome.runtime.getURL('./app/templates/onboarding.html'),
			active: true
		});
	}
}

/**
 * Call updateDBs if auto updating is enabled and enough time has passed since the last check.
 * Debug log that the function was called and when. Called at browser startup and at regular intervals thereafter.
 *
 * @memberOf Background
 *
 * @param {Boolean} isAutoUpdateEnabled		Whether bug db auto updating is enabled.
 * @param {Number} bugsLastCheckedMsec		The Unix msec timestamp to check against to make sure it is not too soon to call updateDBs again.
 */
function autoUpdateDBs(isAutoUpdateEnabled, bugsLastCheckedMsec) {
	const date = new Date();

	log('autoUpdateDBs called', date);

	if (!isAutoUpdateEnabled) return;

	if (
		!bugsLastCheckedMsec // the value is 0, signifying that we have never checked yet
		|| date.getTime() > (Number(bugsLastCheckedMsec) + ONE_HOUR_MSEC) // guard against double fetching
	) {
		updateDBs();
	}
}

function setGhosteryDefaultBlocking() {
	const categoriesBlock = globals.CATEGORIES_BLOCKED_BY_DEFAULT;
	log('Blocking all trackers in categories:', ...categoriesBlock);
	const selected_app_ids = {};
	const app_ids = Object.keys(bugDb.db.apps);
	app_ids.forEach((app_id) => {
		const category = bugDb.db.apps[app_id].cat;
		if (categoriesBlock.includes(category) &&
		!selected_app_ids.hasOwnProperty(app_id)) {
			selected_app_ids[app_id] = 1;
		}
	});
	panelData.set({ selected_app_ids });
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
	if (!IS_ANDROID) { return; }
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
 * Handle messages sent from app/js/checkout_pages.js content script.
 * @memberOf Background
 *
 * @param  {string} 	name 		message name
 */
function handleCheckoutPages(name) {
	switch (name) {
		case 'checkoutPage.buyInsights':
		case 'checkoutPage.buyPlus':
		case 'checkoutPage.buyPremium':
			account.getUser()
				.then(account.getUserSubscriptionData)
				.catch((err) => {
					log('handleCheckoutPages error', err);
				});
			return true;
		case 'checkoutPage.login':
			account.getUser()
				.then(account.getUserSettings)
				// account.getUserSettings will reject if user email is not validated
				.catch(err => log('handleCheckoutPages error', err))
				.then(account.getUserSubscriptionData)
				// The user may not be a subscriber
				.catch(err => log('handleCheckoutPages error', err));
			return true;
		case 'checkoutPage.register':
			account.getUser();
			return true;
		default:
			return false;
	}
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

			if (backup.hash !== hashCode(JSON.stringify(backup.settings))) {
				throw new Error('Invalid hash');
			}

			const data = (backup.settings || {}).conf || {};
			data.alert_bubble_timeout = (data.alert_bubble_timeout > 30) ? 30 : data.alert_bubble_timeout;
			data.settings_last_imported = Date.now();
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
	return false;
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
 * Some of messages come from Common content script
 * bundle, we should filter those out.
 * @memberOf Background
 *
 * @param  {Object}   request 	the message sent by the calling script
 * @param  {Object}   sender 	an object containing information about the script context that sent a message or request
 * @param  {function} callback 	function to call (at most once) when you have a response
 * @return {boolean}            denotes async (true) or sync (false)
 */
function onMessageHandler(request, sender, callback) {
	const {
		name, message, origin
	} = request;
	const { tab } = sender;
	const tab_id = tab && tab.id;

	if (conf.enable_wtm_serp_report) {
		if (tryWTMReportOnMessageHandler(request, sender, callback)) {
			return false;
		}
		if (isDisableWTMReportMessage(request)) {
			conf.enable_wtm_serp_report = false;
			return false;
		}
	}

	// HANDLE PAGE EVENTS HERE
	if (origin === 'account_pages') {
		// Account pages
		return handleAccountPages(name, callback);
	}
	if (origin === 'onboarding') {
		if (name === 'setup_complete') {
			conf.setup_complete = true;
			globals.ONBOARDED_FEATURES.forEach((confName) => {
				conf[confName] = true;
			});
		}
		if (name === 'setup_skip') {
			conf.setup_skip = true;
		}
		return false;
	}
	if (origin === 'checkout_pages') {
		// Checkout pages
		return handleCheckoutPages(name, callback);
	}
	if (origin === 'purplebox') {
		// Purplebox script events
		return handlePurplebox(name, message, tab_id, callback);
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
	if (origin === 'autoconsent') {
		if (name === 'enable') {
			conf.enable_autoconsent = true;
			if (message.url) {
				conf.autoconsent_whitelist = conf.autoconsent_whitelist.concat(message.url);
				conf.autoconsent_interactions += 1;
			} else {
				conf.autoconsent_whitelist = false;
				conf.autoconsent_blacklist = false;
				conf.autoconsent_interactions = 0;
			}

			account.saveUserSettings().catch(err => log('Background autoconsent', err));

			return false;
		}
		if (name === 'disable') {
			if (message.url) {
				conf.autoconsent_blacklist = conf.autoconsent_blacklist.concat(message.url);
				conf.autoconsent_interactions += 1;
			} else {
				conf.enable_autoconsent = false;
				conf.autoconsent_whitelist = [];
				conf.autoconsent_blacklist = [];
				conf.autoconsent_interactions = 0;
			}

			account.saveUserSettings().catch(err => log('Background autoconsent', err));

			return false;
		}
	}

	// HANDLE UNIVERSAL EVENTS HERE (NO ORIGIN LISTED ABOVE)
	if (name === 'getTabInfo') {
		utils.getActiveTab(callback);
		return true;
	}
	if (name === 'getPanelData') { // Used by panel-android
		if (!message.tabId) {
			utils.getActiveTab((activeTab) => {
				const data = panelData.get(message.view, activeTab);
				callback(data);
			});
		} else {
			chrome.tabs.get(+message.tabId, (messageTab) => {
				const data = panelData.get(message.view, messageTab);
				callback(data);
			});
		}
		account.getUserSettings().catch(err => log('Failed getting user settings from getPanelData:', err));
		return true;
	}
	if (name === 'getStats') {
		common.modules.insights.action('getStatsTimeline', message.from, message.to, true, true).then((data) => {
			callback(data);
		});
		return true;
	}
	if (name === 'getAllStats') {
		common.modules.insights.action('getAllDays').then((dataDays) => {
			common.modules.insights.action('getStatsTimeline', moment(dataDays[0]), moment(), true, true).then((dataTimeline) => {
				callback(dataTimeline);
			});
		});
		return true;
	}
	if (name === 'resetStats') {
		metrics.ping('hist_reset_stats');
		common.modules.insights.action('clearData');
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
	if (name === 'getCommonModuleData') { // panel-android only
		if (!message.tabId) {
			utils.getActiveTab((activeTab) => {
				const pageHost = (activeTab.url && utils.processUrl(activeTab.url).hostname) || '';
				sendCommonModuleCounts(activeTab.id, pageHost, callback);
			});
		} else {
			chrome.tabs.get(+message.tabId, (messageTab) => {
				const pageHost = (messageTab.url && utils.processUrl(messageTab.url).hostname) || '';
				sendCommonModuleCounts(messageTab.id, pageHost, callback);
			});
		}
		return true;
	}
	if (name === 'getTrackerInfo') {
		utils.getJson(message.url).then((result) => {
			callback(result);
		}).catch(() => {
			callback(false);
		});
		return true;
	}
	if (name === 'account.login') {
		metrics.ping('sign_in');
		const { email, password } = message;
		account.login(email, password)
			.then((response) => {
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
			.then((subscriptions) => {
				// Return highest tier subscription from array
				const premiumSubscription = subscriptions.find(subscription => subscription.productName.includes('Ghostery Premium'));
				if (premiumSubscription) {
					callback({ subscriptionData: premiumSubscription });
					return;
				}

				const plusSubscription = subscriptions.find(subscription => subscription.productName.includes('Ghostery Plus'));
				if (plusSubscription) {
					callback({ subscriptionData: plusSubscription });
					return;
				}

				callback({});
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
		let url = `${globals.GHOSTERY_BASE_URL}/become-a-contributor`;
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
					user.user.plusAccess = account.hasScopesUnverified(['subscriptions:plus'])
											|| account.hasScopesUnverified(['subscriptions:premium']);
					user.user.premiumAccess = account.hasScopesUnverified(['subscriptions:premium']);
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
		updateDBs().then(async (result) => {
			if (common.modules.adblocker.isEnabled) {
				await common.modules.adblocker.background.adblocker.update();
			} else {
				// Note: Adblocking is disabled in the UI. We cannot force an update when
				// the module is not loaded. Once the user enables adblocking, the adblocker
				// will automatically fetch the latest lists, so it will "lazily" update.
				log('Cannot force adblocker list update since the adblocker is disable (it will check updates once reenabled).');
			}
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
	if (name === 'getAndroidSettingsForExport') {
		const settings = account.buildUserSettings();
		settings.site_blacklist = conf.site_blacklist;
		settings.site_whitelist = conf.site_whitelist;

		const hash = hashCode(JSON.stringify({ conf: settings }));
		const backup = JSON.stringify({ hash, settings: { conf: settings } });
		const msg = { type: 'Ghostery-Backup', content: backup };
		callback(msg);
		return true;
	}
	if (name === 'getSettingsForExport') {
		utils.getActiveTab((activeTab) => {
			if (activeTab && activeTab.id && activeTab.url.startsWith('http')) {
				const settings = account.buildUserSettings();
				// Blacklisted and whitelisted sites are removed from sync array,
				// but we want to allow export and import these properties manually
				settings.site_blacklist = conf.site_blacklist;
				settings.site_whitelist = conf.site_whitelist;

				try {
					const hash = hashCode(JSON.stringify({ conf: settings }));
					const backup = JSON.stringify({ hash, settings: { conf: settings } });
					const msg = { type: 'Ghostery-Backup', content: backup };
					injectNotifications(activeTab.id, true).then(() => {
						sendMessage(activeTab.id, 'exportFile', msg);
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
		utils.getActiveTab((activeTab) => {
			if (activeTab && activeTab.id && activeTab.url.startsWith('http')) {
				injectNotifications(activeTab.id, true).then((result) => {
					if (result) {
						sendMessage(activeTab.id, 'showBrowseWindow', {
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
	if (name === 'openAccountAndroid') {
		if (confData.account) {
			utils.openNewTab({ url: `${globals.ACCOUNT_BASE_URL}/`, become_active: true });
		} else {
			utils.openNewTab({ url: `${globals.SIGNON_BASE_URL}/`, become_active: true });
		}
		return false;
	}
	return false;
}

/**
 * Configure A/B tests based on data fetched from the A/B server
 * @memberOf Background
 */
function setupABTests() {
}

/**
 * @since 8.5.3
 *
 * Update config options for the Common antitracking module to match the current human web setting.
 * Log out the updates. Returns without doing anything if antitracking is disabled.
 *
 * @param {Boolean} isAntitrackingEnabled		Whether antitracking is currently enabled.
 */
function setCommonAntitrackingConfig(isAntitrackingEnabled) {
	if (!isAntitrackingEnabled) return;

	const antitrackingConfig = {
		qsEnabled: true,
		telemetryMode: conf.enable_human_web ? 1 : 0,
	};

	Object.entries(antitrackingConfig).forEach(([opt, val]) => {
		log('antitracking', 'set config option', opt, val);
		common.modules.antitracking.action('setConfigOption', opt, val);
	});
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
		syncTrustedSites();
		common.modules.core.action('refreshAppState');
	});
	dispatcher.on('conf.save.site_blacklist', () => {
		button.update();
	});
	dispatcher.on('conf.save.enable_human_web', (enableHumanWeb) => {
		setWhotracksmeState(enableHumanWeb).then(() => {
			setCommonAntitrackingConfig(conf.enable_anti_tracking);
		});
	});
	dispatcher.on('conf.save.enable_autoupdate', (enableAutoUpdate) => {
		if (!common.modules.antitracking.isDisabled) {
			common.modules.antitracking.action('setConfigOption', 'networkFetchEnabled', enableAutoUpdate);
		}
		if (!common.modules.adblocker.isDisabled) {
			common.modules.adblocker.action('setNetworkFetchEnabled', enableAutoUpdate);
		}
	});
	dispatcher.on('conf.save.enable_anti_tracking', (enableAntitracking) => {
		setAntitrackingState(enableAntitracking).then(() => {
			// enable_human_web could have been toggled while antitracking was off,
			// so we want to make sure to update the antitracking telemetry option
			setCommonAntitrackingConfig(conf.enable_anti_tracking);
		});
	});
	dispatcher.on('conf.save.enable_ad_block', (enableAdBlock) => {
		setAdblockerState(enableAdBlock);
	});
	dispatcher.on('conf.changed.settings', debounce((key) => {
		log('Conf value changed for a watched user setting:', key);
		metrics.setUninstallUrl(key);
	}, 200));
	dispatcher.on('globals.save.paused_blocking', () => {
		// update content script state when blocking is paused/unpaused
		common.modules.core.action('refreshAppState');
	});
}

/**
 * WebRequest pipeline initialization: find which Common modules are enabled,
 * add their handlers, then put Ghostery event handlers before them all.
 * If Common modules are subsequently enabled, their event handlers will always
 * be added after Ghostery's.
 * @memberOf Background
 *
 * @return {Promise}  		a single Promise that resolves when both webRequestPipeline
 *                        	actions resolve. It rejects when webRequestPipeline is disabled
 *                        	or one of the webRequestPipeline actions rejects.
 */
function initialiseWebRequestPipeline() {
	const webRequestPipeline = common.modules['webrequest-pipeline'];
	if (webRequestPipeline.isDisabled) {
		// no pipeline... this shouldn't happen
		return Promise.reject(new Error('cannot initialise webrequest pipeline: module disabled'));
	}
	// remove ghostery listeners from standard webrequest events
	chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
	chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived);

	// look for steps from other modules which we need to be before
	const existingSteps = { onBeforeRequest: [], onHeadersReceived: [] };
	if (common.modules.antitracking.isEnabled) {
		existingSteps.onBeforeRequest.push('common.modules.antitracking.onBeforeRequest');
		existingSteps.onHeadersReceived.push('common.modules.antitracking.onHeadersReceived');
	}
	if (common.modules.adblocker.isEnabled) {
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
 * any Common module which may block/alter tracker requests.
 * @memberOf Background
 */
common.modules.antitracking.on('enabled', () => {
	common.modules.antitracking.isReady().then(() => {
		common.modules.antitracking.action('setWhiteListCheck', isWhitelisted);
	});
});

/**
 * Set listener for 'enabled' event for Adblock module
 * which replaces Adblock isWhitelisted method with Ghostery's isWhitelisted method
 * @memberOf Background
 */
common.modules.adblocker.on('enabled', () => {
	common.modules.adblocker.isReady().then(() => {
		common.modules.adblocker.action('addWhiteListCheck', isWhitelisted);
	});
});

/**
 * Add page listeners for insights stats.
 * @memberOf Background
 */
common.modules.insights.on('enabled', () => {
	events.addPageListener((tab_id, info, apps, bugs) => {
		common.modules.insights.action('pushGhosteryPageStats', tab_id, info, apps, bugs);
	});
});
common.modules.insights.on('disabled', () => {
	events.clearPageListeners();
});

/**
 * Pulls and aggregates data to be passed to Ghostery Tab extension.
 * @memberOf Background
 */
function getDataForGhosteryTab(callback) {
	const passedData = {};
	common.modules.insights.action('getAllDays').then((dataDays) => {
		common.modules.insights.action('getStatsTimeline', moment(dataDays[0]), moment(), true, true).then((dataTimeline) => {
			const cumulativeData = {
				adsBlocked: 0, cookiesBlocked: 0, dataSaved: 0, fingerprintsRemoved: 0, loadTime: 0, pages: 0, timeSaved: 0, trackerRequestsBlocked: 0, trackersBlocked: 0, trackersDetected: 0
			};
			dataTimeline.forEach((entry) => {
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
	if (IS_ANDROID) {
		chrome.browserAction.setPopup({
			popup: 'app/templates/panel_android.html',
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
		// TODO: Allow websocket filters on Edge via Common pipeline
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
			'https://d.ghostery.com/*',
			'https://cmp-cdn.ghostery.com/*',
			'https://cdn.ghostery.com/*',
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
				globals.GHOSTERY_TAB_FIREFOX_TEST_ID,
				globals.DAWN_NEWTAB_PRODUCTION_ID,
			].indexOf(sender.id) !== -1;

			if (recognized && request.name === 'getStatsAndSettings') {
				getDataForGhosteryTab(data => sendResponse({ historicalDataAndSettings: data }));
				return true;
			}

			if (recognized && request.name === 'getDashboardStats') {
				common.modules.insights.action('getDashboardStats', ...(request.args || [])).then(sendResponse);
				return true;
			}

			if (recognized && request.name === 'getUser') {
				account.getUser()
					.then(sendResponse)
					.catch(() => sendResponse(null));
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

		const version_history = [globals.EXTENSION_VERSION];
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

			// Establish version history
			const { version_history } = conf;
			version_history.push(globals.EXTENSION_VERSION);
			conf.version_history = version_history;

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

			if (utils.semverCompare(PREVIOUS_EXTENSION_VERSION, '8.9.0') < 0) {
				conf.enable_autoconsent = true;
			}

			if (utils.semverCompare(PREVIOUS_EXTENSION_VERSION, '8.9.4') < 0) {
				addMigration((app) => {
					alwaysLog('ONE-TIME MIGRATION: removing "developer" flag if present');
					app.prefs.clear('developer');
				});
			}
		} else {
			log('SAME VERSION OR NOT THE FIRST RUN');
		}
	}
}

/**
 * Ghostery Module Initializer.
 * Init all Ghostery and Common modules.
 * @memberOf Background
 *
 * @return {Promise}
 */
function initializeGhosteryModules() {
	if (globals.JUST_UPGRADED) {
		log('JUST UPGRADED');
		metrics.ping('upgrade');
		// We don't want install_complete pings for upgrade
		conf.metrics.install_complete_all = Date.now();
	} else if (globals.JUST_INSTALLED) {
		log('JUST INSTALLED');
		const dateString = getISODate();
		const randomNumber = (Math.floor(Math.random() * 100) + 1);

		conf.install_random_number = randomNumber;
		conf.install_date = dateString;

		// Set default search partners for Ghostery Desktop Browser. These can be removed
		// by the user under Trusted Site settings.
		if (BROWSER_INFO.name === 'ghostery_desktop') {
			conf.site_whitelist.push('bing.com', 'search.yahoo.com', 'startpage.com');
		}

		metrics.setUninstallUrl();

		metrics.ping('install');

		// Set 5 min timeout
		setTimeout(() => {
			metrics.ping('install_complete');
		}, 300000);
	} else {
		// Record install if the user previously closed the browser before the install ping fired
		metrics.ping('install');
		metrics.ping('install_complete');
	}
	// start common app
	const commonStartup = async () => {
		await common.start();
		// run wrapper tasks which set up base integrations between ghostery and these modules
		await initialiseWebRequestPipeline();

		if (!common.modules.antitracking.isDisabled) {
			common.modules.antitracking.action('setConfigOption', 'networkFetchEnabled', !!conf.enable_autoupdate);
		}

		if (!common.modules.adblocker.isDisabled) {
			common.modules.adblocker.action('setNetworkFetchEnabled', !!conf.enable_autoupdate);
		}
	};

	// Disable purplebox for Android users
	if (IS_ANDROID) {
		conf.show_alert = false;
	}

	// Set these tasks to run every hour
	function scheduledTasks() {
		return new Promise((resolve) => {
			// auto-fetch from CMP
			if (conf.show_cmp) {
				cmp.fetchCMPData();
			}

			if (conf.enable_abtests) {
				abtest.fetch()
					.then(() => {
						setupABTests();
					})
					.catch(() => {
						log('Unable to reach abtest server');
					})
					.finally(() => resolve());
			} else {
				resolve();
			}
		});
	}

	// Check CMP and ABTest every day.
	setInterval(scheduledTasks, ONE_DAY_MSEC);

	// Update db right away.
	autoUpdateDBs(conf.enable_autoupdate, conf.bugs_last_checked);

	// Schedule it to run every day.
	setInterval(
		() => autoUpdateDBs(conf.enable_autoupdate, conf.bugs_last_checked),
		ONE_DAY_MSEC
	);

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
		commonStartup(),
	])
		.then(() => scheduledTasks())
		.then(() => tryOpenOnboarding());
}

/**
 * Initialize Search Message Handler on Ghostery Browser.
 * @memberOf Background
 */
async function initializeSearchMessageHandler() {
	await globals.BROWSER_INFO_READY; // ensure browser info is set
	if (BROWSER_INFO.name === 'ghostery_desktop') {
		const sm = new SearchMessager();
		sm.init();
	}
}

/**
 * Old profiles may have leftovers created by code that no longer exists.
 */
function purgeObsoleteData() {
	// Note: Afters some releases, it should be safe to remove this code again
	// (e.g. if you see the code in 2024, it should be safe to remove it).
	const obsoleteKeys = [
		'storedOffers',
		'hpn:localTemporalUniq',
		'resource-loader:cliqz:hpn:routeTable.json',
		'resource-loader:cliqz:hpn:sourcemap.json',
		'hpn:userKey',
		'resource-loader:cliqz:hpn:proxylist.json',
		'cta_status',
		'dbName',
		'abtests',
		'db_last_updated',
		'evidon_bugs_last_checked',
		'plus_promo_modal_last_seen',
		'premium_promo_modal_last_seen',
		'ghostrank',
		'enable_offers',
		'fromSettings',
		'ghostrank_dismissed',
		'totalOffersSeen',
		'unreadOfferIds',

		// former locally cached images:
		'ghosty_blocked_data',
		'ghosty_blocked_big_data',
		'ghostery_vkontakte_data',
		'ghostery_twitter_data',
		'ghostery_tumblr_data',
		'ghostery_stumble_data',
		'ghostery_plus_data',
		'ghostery_pinterest_data',
		'ghostery_linkedin_data',
		'ghostery_hubspot_data',
		'ghostery_facebook_data',
		'allow_unblock_data',
	];

	log('Purging obsolete keys');
	return new Promise((resolve, reject) => {
		chrome.storage.local.remove(obsoleteKeys, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
				return;
			}
			resolve();
		});
	}).catch((err) => {
		alwaysLog('Unable to clean up old keys.', err);
	});
}

async function initializeAccount() {
	let lastStep = 'start';
	const timeout = setTimeout(() => {
		const error = new Error(`account init timeout after step: ${lastStep}`);
		ErrorReporter.captureException(error);
		alwaysLog(error);
	}, 5000);

	try {
		await account.migrate();
		lastStep = 'migrate';

		if (!conf.account) {
			ghosteryDebugger.addAccountEvent('app started', 'not signed in');
			if (globals.JUST_INSTALLED) {
				setGhosteryDefaultBlocking();
			}
			return;
		}

		ghosteryDebugger.addAccountEvent('app started', 'signed in', conf.account);

		await account.getUser();
		lastStep = 'getUser';

		await account.getUserSettings();
		lastStep = 'getUserSettings';

		if (conf.current_theme !== 'default') {
			await account.getTheme(conf.current_theme);
			lastStep = 'getTheme';
		}

		alwaysLog('successfully signed in');
	} catch (e) {
		ErrorReporter.captureException(e);
		alwaysLog(e);
	} finally {
		clearTimeout(timeout);
	}
}

async function recordUTMs() {
	try {
		if (globals.JUST_INSTALLED) {
			const utms = await metrics.detectUTMs();
			await prefsSet(utms);
			return;
		}
		const utms = await prefsGet('utm_source', 'utm_campaign');
		metrics.setUTMs(utms);
	} catch (error) {
		alwaysLog('Metrics init() error', error);
	}
}

/**
 * Application Initializer
 * Called whenever the browser starts or the extension is
 * installed/updated.
 * @memberOf Background
 */
async function init() {
	try {
		await confData.init();

		metrics.init();

		initializePopup();

		initializeEventListeners();

		initializeVersioning();

		if (globals.JUST_UPGRADED) {
			await purgeObsoleteData();
			await freeSpaceIfNearQuota({ force: true }); // TODO: consider dropping "force" once all users upgraded
		}

		await initializeSearchMessageHandler();

		await recordUTMs();

		await initializeGhosteryModules();

		initializeAccount();

		// persist Conf properties to storage only after init has completed
		await prefsSet(globals.initProps);

		globals.INIT_COMPLETE = true;
	} catch (err) {
		ErrorReporter.captureException(err);
		alwaysLog('Error in init()', err);

		throw err;
	}
}

init();
