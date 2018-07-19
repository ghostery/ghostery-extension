/**
 * Background
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

/* eslint consistent-return: 0 */
/* eslint no-use-before-define: 0 */
/* eslint no-shadow: 0 */

/**
 * @namespace Background
 */
import _ from 'underscore';
import moment from 'moment/min/moment-with-locales.min';
import cliqz from './classes/Cliqz';
// object classes
import Events from './classes/EventHandlers';
import PanelData from './classes/PanelData';
// static classes
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
import rewards from './classes/Rewards';
import account from './classes/Account';
// utilities
import { allowAllwaysC2P } from './utils/click2play';
import * as common from './utils/common';
import * as utils from './utils/utils';
import { _getJSONAPIErrorsObject } from './utils/api';
import { importCliqzSettings } from './utils/cliqzSettingImport';

// class instantiation
const events = new Events();
const panelData = new PanelData();
// function shortcuts
const { log } = common;
const { sendMessage } = utils;
const { onMessage } = chrome.runtime;
// simple consts
const {
	GHOSTERY_DOMAIN, CDN_SUB_DOMAIN, BROWSER_INFO, IS_CLIQZ, DEBUG
} = globals;
const IS_EDGE = (BROWSER_INFO.name === 'edge');
const VERSION_CHECK_URL = `https://${CDN_SUB_DOMAIN}.ghostery.com/update/version`;
const OFFERS_HANDLER_ID = 'ghostery';
const REAL_ESTATE_ID = 'ghostery';
const onBeforeRequest = events.onBeforeRequest.bind(events);
const onHeadersReceived = events.onHeadersReceived.bind(events);

// Cliqz Modules
const humanweb = cliqz.modules['human-web'];
const { adblocker, antitracking, hpn } = cliqz.modules;
const messageCenter = cliqz.modules['message-center'];
const offers = cliqz.modules['offers-v2'];
let OFFERS_ENABLE_SIGNAL;

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
		.catch((e) => {
			log(`FAILED TO ${register ? 'REGISTER' : 'UNREGISTER'} REAL ESTATE WITH OFFERS CORE`);
		});
}
/**
 * Check and fetch (if needed) a new tracker library every 12 hours
 * @memberOf Background
 */
function autoUpdateBugDb() {
	log('AUTOUPDATE CALLED');
	if (conf.enable_autoupdate) {
		const result = conf.bugs_last_checked;
		const nowTime = Number((new Date()).getTime());
		if (!result || nowTime > (Number(result) + 900000)) {
			log('AUTOUPDATE CALLED', new Date());
			checkLibraryVersion();
		}
	}
}

/**
 * Pulls down latest version.json and triggers
 * udpates of all db files.
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
 * @todo  consider never return anything explicitly from message handlers
 * as we never make callback calls asynchronously.
 */

/**
 * Handle messages sent from app/js/platform_pages.js content script.
 * @memberOf Background
 *
 * @param  {string} 	name 		message name
 * @param  {string}		tab_url 	tab url
 */
function handleGhosteryPlatformPages(name, tab_url) {
	if (name === 'platformPageLoaded') {
		account.getUser()
			.then(account.getUserSettings)
			.catch((err) => {
				log('handleGhosteryPlatformPages error', err);
			});
	}
	return false;
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
		if (utils.isCliqzOffer(message.cmp_data)) {
			reportCliqzOffer(message);
		} else if (cmp.CMP_DATA && cmp.CMP_DATA.length) {
			cmp.CMP_DATA.splice(0, 1);
		}
	} else if (name === 'cmpMessageShown') {
		if (utils.isCliqzOffer(message.cmp_data)) {
			reportCliqzOffer(message);
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
		} else if (message.action === 'once') {
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
	} else if (name === 'allow_always_page_c2p_tracker') {
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
function handleRewards(name, message, tab_id, callback) {
	if (!offers.isEnabled) {
		switch (name) {
			case 'rewardSignal':
				if (message.actionId === 'rewards_on') {
					OFFERS_ENABLE_SIGNAL = message;
					conf.enable_offers = true;
				}
				break;
			default:
				break;
		}
	} else {
		switch (name) {
			case 'rewardSignal':
				rewards.sendSignal(message);
				if (message.actionId === 'rewards_off') {
					conf.enable_offers = false;
				}
				break;
			case 'rewardSeen':
				rewards.markRewardRead(message.offerId);
				button.update();
				break;
			case 'deleteReward':
				rewards.markRewardRead(message.offerId);
				rewards.deleteReward(message.offerId);
				button.update();
				break;
			case 'rewardsPromptAccepted':
				conf.rewards_accepted = true;
				break;
			case 'ping':
				metrics.ping(message);
				break;
			case 'removeDisconnectListener':
				rewards.panelPort.onDisconnect.removeListener(rewards.panelHubClosedListener);
				break;
			default:
				break;
		}
	}
}

/**
 * Handle messages sent from dist/settings_redirect.js script
 * of the settings_redirect.html local page. Used on @EDGE and Chrome.
 * @memberOf Background
 *
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {number} 		tab_id 		tab id
 * @param  {function} 	callback 	function to call (at most once) when you have a response
 * @return {boolean}
 */
function handleSettingsRedirect(name, message, tab_id, callback) {
	if (name === 'getSettingsUrl') {
		sendMessage(tab_id, 'gotSettingsUrl', `https://extension.${GHOSTERY_DOMAIN}.com/${conf.language}/settings#general`);
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
function handlePurplebox(name, message, tab_id, callback) {
	if (name === 'updateAlertConf') {
		conf.alert_expanded = message.alert_expanded;
		conf.alert_bubble_pos = message.alert_bubble_pos;
		conf.alert_bubble_timeout = message.alert_bubble_timeout;
		// push new settings to API
		account.saveUserSettings();
	}
	return false;
}

/**
 * Reformats messages coming from context script and sends them to Cliqz.
 * @memberOf Background
 *
 * @param  {Object} 	message 	message data
 */
function reportCliqzOffer(message) {
	const { offer_id } = message.cmp_data.data.offer_info;
	const msgToOffersCore = {
		// OFFERS_HANDLER_ID is scoped to background.js
		// If we ever need it elswhere - we can make it the property of
		// globals (src/classes/Globals)
		origin: OFFERS_HANDLER_ID,
		type: 'offer-action-signal',
		data: {
			action_id: '',
			offer_id
		}
	};
	// check the type of the message
	if (message.reason === 'offerShown') {
		msgToOffersCore.data.action_id = 'offer_shown';
	} else if (message.reason === 'closeButton') {
		msgToOffersCore.data.action_id = 'offer_closed';
	} else if (message.reason === 'link') {
		msgToOffersCore.data.action_id = 'offer_ca_action';
	} else {
		// TODO: @serge how do we log here an error?
		log('[offers_log]: unknown message reason: ', message.reason);
		return;
	}
	const cliqzCore = cliqz.modules.core;
	cliqzCore.action('publishEvent', 'offers-recv-ch', msgToOffersCore);
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
		name, message, messageId, origin
	} = request;
	const { tab } = sender;
	const tab_id = tab && tab.id;
	// Edge does not have url on tab object, as of Build 14342_rc1
	const tab_url = tab && (tab.url ? tab.url : (sender.url ? sender.url : ''));

	// On Edge 39.14965.1001.0 callback is lost when multiple
	// Edge instances running. So instead we shoot message back
	// See sendMessageInPromise in app/js/utils/msg.js where we
	// listen to this message. To be removed, once Edge fixed
	if (IS_EDGE && messageId) {
		if (tab_id) {
			// eslint-disable-next-line no-param-reassign
			callback = function (result) {
				utils.sendMessage(tab_id, messageId, result);
			};
		} else {
			// eslint-disable-next-line no-param-reassign
			callback = function (result) {
				utils.sendMessageToPanel(messageId, result);
			};
		}
	}

	// HANDLE PAGE EVENTS HERE
	if (origin === 'platform_pages') {
		// Platform pages
		return handleGhosteryPlatformPages(name, tab_url);
	} else if (origin === 'purplebox') {
		// Purplebox script events
		return handlePurplebox(name, message, tab_id, callback);
	} else if (origin === 'ghostery_dot_com') {
		// Ghostery.com and apps pages
		return handleGhosteryDotCom(name, message, tab_id);
	} else if (origin === 'page_performance' && name === 'recordPageInfo') {
		tabInfo.setTabInfo(tab_id, 'pageTiming', message.performanceAPI);
		return false;
	} else if (origin === 'notifications') {
		return handleNotifications(name, message, tab_id);
	} else if (origin === 'click_to_play') {
		return handleClick2Play(name, message, tab_id, callback);
	} else if (origin === 'blocked_redirect') {
		return handleBlockedRedirect(name, message, tab_id, callback);
	} else if (origin === 'rewards' || origin === 'rewardsPanel') {
		return handleRewards(name, message, tab_id, callback);
	}

	// HANDLE UNIVERSAL EVENTS HERE (NO ORIGIN LISTED ABOVE)
	if (name === 'disableShowAlert') {
		conf.show_alert = false;
	} else if (name === 'updateDataCollection') {
		if (!IS_CLIQZ && !IS_EDGE) {
			conf.enable_human_web = message && true;
			conf.enable_offers = message && true;
		}
		conf.enable_metrics = message && true;
	} else if (name === 'updateDisplayMode') {
		conf.is_expert = message;
	} else if (name === 'updateAntiTrack') {
		conf.enable_anti_tracking = message;
	} else if (name === 'updateSmartBlock') {
		conf.enable_smart_block = message;
	} else if (name === 'updateAdBlock') {
		conf.enable_ad_block = message;
	} else if (name === 'updateBlocking') {
		switch (message) {
			case 'UPDATE_BLOCK_ALL':
				conf.selected_app_ids = {};
				for (const app_id in bugDb.db.apps) {
					if (!conf.selected_app_ids.hasOwnProperty(app_id)) {
						conf.selected_app_ids[app_id] = 1;
					}
				}
				break;
			case 'UPDATE_BLOCK_NONE':
				// TODO: can't wipe these settings for upgrade users
				conf.selected_app_ids = {};
				break;
			case 'UPDATE_BLOCK_ADS':
				conf.selected_app_ids = {};
				for (const app_id in bugDb.db.apps) {
					if (bugDb.db.apps[app_id].cat === 'advertising' &&
						!conf.selected_app_ids.hasOwnProperty(app_id)) {
						conf.selected_app_ids[app_id] = 1;
					}
				}
				break;
			default:
				break;
		}
	} else if (name === 'skipSetup') {
		// link to blog post
		chrome.tabs.update(tab_id, { url: 'https://www.ghostery.com/blog/product-releases/browse-smarter-with-ghostery-8/' });
		return false;
	} else if (name === 'closeSetup') {
		// link to blog post
		chrome.tabs.update(tab_id, { url: 'https://www.ghostery.com/blog/product-releases/browse-smarter-with-ghostery-8/' });
		return false;
	} else if (name === 'getPanelData') {
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
		return true;
	} else if (name === 'setPanelData') {
		panelData.set(message);
		callback();
		return false;
	} else if (name === 'getCliqzModuleData') {
		const modules = { adblock: {}, antitracking: {} };
		utils.getActiveTab((tab) => {
			button.update();
			if (conf.enable_ad_block) {
				// update adblock count. callback() handled below based on anti-tracking status
				modules.adblock = cliqz.modules.adblocker.background.actions.getAdBlockInfoForTab(tab.id);
			}
			if (conf.enable_anti_tracking) {
				cliqz.modules.antitracking.background.actions.aggregatedBlockingStats(tab.id).then((data) => {
					modules.antitracking = data;
					callback(modules);
				}).catch((err) => {
					callback(modules);
				});
			} else {
				callback(modules);
			}
		});
		return true;
	} else if (name === 'getTrackerDescription') {
		utils.getJson(message.url).then((result) => {
			const description = (result) ? ((result.company_in_their_own_words) ? result.company_in_their_own_words : ((result.company_description) ? result.company_description : '')) : '';
			callback(description);
		});
		return true;
	} else if (name === 'account.login') {
		const { email, password } = message;
		account.login(email, password)
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				log('LOGIN ERROR', err);
				callback({ errors: _getJSONAPIErrorsObject(err) });
				// callback({ errors: [err] });
			});
		return true;
	} else if (name === 'account.register') {
		const {
			email, confirmEmail, password, firstName, lastName
		} = message;
		account.register(email, confirmEmail, password, firstName, lastName)
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				callback({ errors: [err] });
				log('REGISTER ERROR');
			});
		return true;
	} else if (name === 'account.logout') {
		account.logout()
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				log('LOGOUT ERROR');
				callback(err);
			});
		return true;
	} else if (name === 'account.getUserSettings') {
		account.getUserSettings()
			.then((settings) => {
				callback(settings);
			})
			.catch((err) => {
				log('Error getting user settings:', err);
				callback({ errors: _getJSONAPIErrorsObject(err) });
			});
		return true;
	} else if (name === 'account.resetPassword') {
		const { email } = message;
		account.resetPassword(email)
			.then((success) => {
				callback(success);
			})
			.catch((err) => {
				callback({ errors: _getJSONAPIErrorsObject(err) });
				log('RESET PASSWORD ERROR');
			});
		return true;
	} else if (name === 'account.getUser') {
		account.getUser(message)
			.then((user) => {
				callback({ user });
			})
			.catch((err) => {
				callback({ errors: _getJSONAPIErrorsObject(err) });
				log('FETCH USER ERROR');
			});
		return true;
	} else if (name === 'account.sendValidateAccountEmail') {
		account.sendValidateAccountEmail()
			.then((success) => {
				callback(success);
			})
			.catch((err) => {
				callback({ errors: _getJSONAPIErrorsObject(err) });
				log('sendValidateAccountEmail error', err);
			});
		return true;
	} else if (name === 'update_database') {
		checkLibraryVersion().then((result) => {
			callback(result);
		});
		return true;
	} else if (name === 'getSiteData') { // used by HeaderView.js clickBrokenPage()
		getSiteData().then((result) => {
			callback(result);
		});
		return true;
	} else if (name === 'openNewTab') {
		utils.openNewTab(message);
		return false;
	} else if (name === 'reloadTab') {
		reloadTab(message);
		closeAndroidPanelTabs();
		return false;
	} else if (name === 'getSettingsForExport') {
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
	} else if (name === 'ping') {
		metrics.ping(message);
		return false;
	} else if (name === 'showBrowseWindow') {
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
						}, (result) => {
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
	} else if (name === 'setupStep' && globals.JUST_INSTALLED) {
		if (message.final) {
			metrics.ping('install_complete');
		} else if (message.setup_block !== undefined) {
			conf.setup_block = message.setup_block;
		} else if (message.setup_path !== undefined) {
			conf.setup_path = message.setup_path;
		} else if (message.setup_step !== undefined) {
			if (message.setup_step > conf.setup_step) {
				conf.setup_step = message.setup_step;
			}
		}
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
		const num_selected = _.size(appIds);
		const { db } = bugDb;
		db.noneSelected = (num_selected === 0);
		// can't simply compare num_selected and _.size(db.apps) since apps get removed sometimes
		db.allSelected = (!!num_selected && _.every(db.apps, (app, app_id) => appIds.hasOwnProperty(app_id)));
	});
	dispatcher.on('conf.save.site_whitelist', () => {
		// TODO debounce with below
		button.update();
		utils.flushChromeMemoryCache();
	});
	dispatcher.on('conf.save.account', () => {
		// update PanelData
		panelData.init();
	});
	dispatcher.on('conf.save.enable_human_web', (enableHumanWeb) => {
		if (!IS_EDGE && !IS_CLIQZ) {
			setCliqzModuleEnabled(humanweb, enableHumanWeb).then((data) => {
				setupABTest();
			});
		} else {
			setCliqzModuleEnabled(humanweb, false);
		}
	});
	dispatcher.on('conf.save.enable_offers', (enableOffers) => {
		button.update();
		if (!IS_EDGE && !IS_CLIQZ) {
			if (!enableOffers) {
				const actions = cliqz &&
				cliqz.modules['offers-v2'] &&
				cliqz.modules['offers-v2'].background &&
				cliqz.modules['offers-v2'].background.actions;
				if (actions) {
					actions.flushSignals();
				}
				OFFERS_ENABLE_SIGNAL = undefined;
				registerWithOffers(offers, enableOffers);
			}
			setCliqzModuleEnabled(offers, enableOffers);
		} else {
			setCliqzModuleEnabled(offers, false);
			registerWithOffers(offers, false);
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

	dispatcher.on('conf.changed.settings', _.debounce((key) => {
		log('Conf value changed for a watched user setting:', key);
		// Update PanelData with new Conf properties
		panelData.init();
	}, 200));
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
	} else if (abtest.hasTest('antitracking_half')) {
		return {
			qsEnabled: true,
			telemetryMode: 1,
		};
	} else if (abtest.hasTest('antitracking_collect')) {
		return {
			qsEnabled: false,
			telemetryMode: 1,
		};
	}
	return {
		qsEnabled: false,
		telemetryMode: 0,
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
					return false;
				}
				return true;
			}
		}),
		webRequestPipeline.action('addPipelineStep', 'onHeadersReceived', {
			name: 'ghostery.onHeadersReceived',
			spec: 'collect',
			before: existingSteps.onHeadersReceived,
			fn: (state) => {
				events.onHeadersReceived(state);
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
	const url = state.sourceUrl;
	return globals.SESSION.paused_blocking || events.policy.getSitePolicy(url) === 2 || state.ghosteryWhitelisted;
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
		// remove Cliqz-side whitelisting steps and replace with ghostery ones.
		const replacedSteps = ['onBeforeSendHeaders', 'onHeadersReceived'].map(stage =>
			Promise.all([
				antitracking.action('removePipelineStep', stage, 'checkIsCookieWhitelisted'),
				antitracking.action('addPipelineStep', stage, {
					name: 'checkGhosteryWhitelisted',
					spec: 'break',
					fn: (state) => {
						if (isWhitelisted(state)) {
							const step = stage === 'onHeadersReceived' ? 'set_cookie' : 'cookie';
							state.incrementStat(`${step}_allow_whitelisted`);
							return false;
						}
						return true;
					},
					before: ['cookieContext.checkCookieTrust'],
				})
			])
		).concat([
			antitracking.action('removePipelineStep', 'onBeforeRequest', 'checkSourceWhitelisted'),
			antitracking.action('addPipelineStep', 'onBeforeRequest', {
				name: 'checkGhosteryWhitelisted',
				spec: 'break',
				fn: (state) => {
					if (isWhitelisted(state)) {
						state.incrementStat('ghostery_whitelisted');
						return false;
					}
					return true;
				},
				before: ['checkShouldBlock'],
			}),
		]);
		return Promise.all(replacedSteps);
	});
});

/**
 * Set listener for 'enabled' event for Adblock module
 * which replaces Adblock isWhitelisted method with Ghostery's isWhitelisted method
 * @memberOf Background
 */
adblocker.on('enabled', () => {
	adblocker.isReady().then(() =>
		Promise.all([
			adblocker.action('removePipelineStep', 'checkWhitelist'),
			adblocker.action('addPipelineStep', {
				name: 'checkGhosteryWhitelist',
				spec: 'break',
				fn: state => !isWhitelisted(state),
				before: ['checkBlocklist']
			}),
			adblocker.action('addWhiteListCheck',
				url => isWhitelisted({ sourceUrl: url }))
		])
	);
});

/**
 * Set listener for 'enabled' event for Offers module
 * @memberOf Background
 */
offers.on('enabled', () => {
	offers.isReady().then(() => {
		log('IN OFFERS ON ENABLED', offers, messageCenter);
		if (OFFERS_ENABLE_SIGNAL) {
			rewards.sendSignal(OFFERS_ENABLE_SIGNAL);

			const actions = cliqz &&
			cliqz.modules['offers-v2'] &&
			cliqz.modules['offers-v2'].background &&
			cliqz.modules['offers-v2'].background.actions;
			if (actions) {
				actions.flushSignals();
			}

			OFFERS_ENABLE_SIGNAL = undefined;
		}
		if (DEBUG) {
			offers.action('setConfiguration', {
				config_location: 'de',
				triggersBE: 'http://offers-api-stage.clyqz.com:81',
				showConsoleLogs: true,
				offersLogsEnabled: true,
				offersDevFlag: true,
				offersTelemetryFreq: '10'
			});
		}
		registerWithOffers(offers, true)
			.then(() => {
				setCliqzModuleEnabled(messageCenter, true);
			});
	});
});

/**
 * Set listener for 'enabled' event for Offers module.
 * It registers message handler for messages with the offers.
 * This handler adds incoming message data to the array of
 * notimication messages (CMP_DATA) to be eventually displayed.
 * @memberOf Background
 */
messageCenter.on('enabled', () => {
	messageCenter.isReady().then(() => {
		log('IN MESSAGE CENTER ON ENABLED', offers, messageCenter);
		// const messageCenter = cliqz.modules['message-center'];
		return messageCenter.action('registerMessageHandler', OFFERS_HANDLER_ID, (msg) => {
			// ffers enabled at the moment when message received
			messageCenter.action('hideMessage', OFFERS_HANDLER_ID, msg);
			msg.Dismiss = 1; // to be immediately dismissed once shown
			/**
			 * We changed the message structure here so we need to map
			 * to the new way on ghostery 8 after nav-ext 1.18
			 *
			 * {
			 * 	id: offerInfoCpy.display_id,
			 *  Message: offerInfoCpy.ui_info.template_data.title,
			 *  Link: offerInfoCpy.ui_info.template_data.call_to_action.url,
			 *  LinkText: offerInfoCpy.ui_info.template_data.call_to_action.text,
			 *  type: 'offers',
			 *  origin: 'cliqz',
			 *  data: {
			 *   offer_info: {
			 *    offer_id: data.offer_data.offer_id,
			 *    offer_urls: urlsToShow
			 *   }
			 *  }
			 * }
			*/
			// first check that the message is from core and is the one we expect
			if (msg.origin === 'offers-core' &&
				msg.type === 'push-offer' &&
				msg.data.offer_data) {
				log('RECEIVED OFFER', msg);

				const unreadIdx = rewards.unreadOfferIds.indexOf(msg.data.offer_id);
				if (unreadIdx !== -1) {
					rewards.unreadOfferIds.splice(unreadIdx, 1);
				}
				rewards.storedOffers[msg.data.offer_id] = msg.data;
				rewards.unreadOfferIds.push(msg.data.offer_id);
				button.update();

				if (msg.data.offer_data.ui_info.notif_type !== 'star') {
					utils.getActiveTab((tab) => {
						let tabId = 0;
						if (tab) tabId = tab.id;
						rewards.showHotDog(tabId, msg.data);
					});
				}
			}
		});
	});
});

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
	chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {
		urls: ['http://*/*', 'https://*/*']
	}, ['blocking']);
	chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, {
		urls: ['http://*/*', 'https://*/*']
	}, ['responseHeaders']);
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
	chrome.webNavigation.onDOMContentLoaded.addListener(events.onDOMContentLoaded.bind(events));

	// Fired when a document, including the resources it refers to, is completely loaded and initialized
	chrome.webNavigation.onCompleted.addListener(events.onNavigationCompleted.bind(events));

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
	chrome.webRequest.onBeforeSendHeaders.addListener(events.onBeforeSendHeaders.bind(events), {
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
	chrome.webRequest.onErrorOccurred.addListener(events.onRequestErrorOccurred.bind(events), {
		urls: ['http://*/*', 'https://*/*']
	});

	/** * TABS ** */

	// Fired when a new tab is created by user or internally
	chrome.tabs.onCreated.addListener(events.onTabCreated.bind(events));

	// Fires when the active tab in a window changes
	chrome.tabs.onActivated.addListener(events.onTabActivated.bind(events));

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

	// Fired when panel is disconnected
	chrome.runtime.onConnect.addListener((port) => {
		if (port && port.name === 'rewardsPanelPort') {
			rewards.panelPort = port;
			rewards.panelPort.onDisconnect.addListener(rewards.panelHubClosedListener);
		}
	});
}

/**
 * Establsh current and previous application versions.
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

			// Are we upgrading from Ghostery 8 prior to 8.2?
			if ((+prevVersion[0] === 8) && (prevVersion[1] < 2)) {
				globals.JUST_UPGRADED_FROM_8_1 = true;
			}

			// Establish version history
			const { version_history } = conf;
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

		const { version_history } = conf;
		const size = version_history.length;
		if (!size || version_history[size - 1] !== globals.EXTENSION_VERSION) {
			version_history.push(globals.EXTENSION_VERSION);
		}
		conf.version_history = version_history;

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

		// open the setup page on install
		chrome.tabs.create({
			url: chrome.runtime.getURL('./app/templates/setup.html'),
			active: true
		});
	} else {
		// Record install if the user previously closed the browser before the install ping fired
		metrics.ping('install');
		metrics.ping('install_complete');
	}
	// start cliqz app
	const cliqzStartup = cliqz.start().then(() => {
		// run wrapper tasks which set up base integrations between ghostery and these modules
		Promise.all([
			initialiseWebRequestPipeline(),
		]).then(() => {
			if (!(IS_EDGE || IS_CLIQZ)) {
				if (globals.JUST_UPGRADED_FROM_7) {
					// These users had human web already, so we respect their choice
					conf.enable_human_web = !humanweb.isDisabled;
					// These users did not have adblocking and antitracking.
					// We introduce these new features initially disabled.
					conf.enable_ad_block = false;
					conf.enable_anti_tracking = false;
					// Enable Offers except on Edge or Cliqz
					conf.enable_offers = true;
				} else if (globals.JUST_UPGRADED_FROM_8_1) {
					// These users already had human web, adblocker and antitracking, so we respect their choice
					conf.enable_ad_block = !adblocker.isDisabled;
					conf.enable_anti_tracking = !antitracking.isDisabled;
					conf.enable_human_web = !humanweb.isDisabled;
					// These users did not have Offers, so we enable them on upgrade.
					conf.enable_offers = true;
				} else {
					// Otherwise we respect browser-core default settings
					conf.enable_ad_block = !adblocker.isDisabled;
					conf.enable_anti_tracking = !antitracking.isDisabled;
					conf.enable_human_web = !humanweb.isDisabled;
					conf.enable_offers = !offers.isDisabled;
				}
			}
		});
	}).catch((e) => {
		log('cliqzStartup error', e);
	});

	if (IS_EDGE) {
		setCliqzModuleEnabled(hpn, false);
		setCliqzModuleEnabled(humanweb, false);
		setCliqzModuleEnabled(offers, false);
	}

	if (IS_CLIQZ) {
		setCliqzModuleEnabled(hpn, false);
		setCliqzModuleEnabled(humanweb, false);
		setCliqzModuleEnabled(antitracking, false);
		setCliqzModuleEnabled(adblocker, false);
		setCliqzModuleEnabled(offers, false);
	}

	// Set these tasks to run every hour
	function scheduledTasks() {
		// auto-fetch from CMP
		cmp.fetchCMPData();

		if (!IS_EDGE && !IS_CLIQZ) {
			// auto-fetch human web offer
			abtest.fetch().then(() => {
				setupABTest();
			}).catch((err) => {
				log('Unable to reach abtest server');
			});
		}
	}

	// Check CMP right away.
	cmp.fetchCMPData();
	// Check CMP and ABTest every hour.
	setInterval(scheduledTasks, 3600000);

	// Update db right away.
	autoUpdateBugDb();
	// Schedule it to run every 30 min.
	setInterval(autoUpdateBugDb, 1800000);

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
		// initialize panel data
		panelData.init();
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
		account.getUser()
			.then(account.getUserSettings)
			.catch((err) => {
				log('Error in account.getUser()', err);
			});
		return metrics.init(globals.JUST_INSTALLED).then(() => initializeGhosteryModules().then(() => {
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
