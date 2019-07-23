/**
 * Metrics
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

import globals from './Globals';
import conf from './Conf';
import { log, prefsSet, prefsGet } from '../utils/common';
import { getActiveTab, processUrlQuery } from '../utils/utils';
import rewards from './Rewards';

// CONSTANTS
const FREQUENCIES = { // in milliseconds
	daily: 86400000,
	weekly: 604800000,
	biweekly: 1209600000,
	monthly: 2419200000
};
const CRITICAL_METRICS = ['install', 'install_complete', 'upgrade', 'active', 'engaged', 'uninstall'];
const CAMPAIGN_METRICS = ['install', 'active', 'uninstall'];
const FIRST_REWARD_METRICS = ['rewards_first_accept', 'rewards_first_reject', 'rewards_first_reject_optin', 'rewards_first_reject_optout', 'rewards_first_learn_more'];
const { METRICS_SUB_DOMAIN, EXTENSION_VERSION, BROWSER_INFO } = globals;
const IS_EDGE = (BROWSER_INFO.name === 'edge');
const MAX_DELAYED_PINGS = 100;
const BROKEN_PAGE_WATCH_THRESHOLD = 60000; // 60 seconds
/**
 * Class for handling telemetry pings.
 * @memberOf  BackgroundClasses
 */
class Metrics {
	constructor() {
		this.utm_source = '';
		this.utm_campaign = '';
		this.ping_set = new Set();
		this._brokenPageWatcher = {
			on: false,
			triggerId: '',
			triggerTime: '',
			timeoutId: null,
			url: '',
		};
	}

	/**
	 * Set UTM parameters.
	 *
	 * On JUST_INSTALLED, from ghostery.com/products install URL if present.
	 * Otherwise, tries to pull them from prefs.
	 * This method is called once on startup.
	 */
	init(JUST_INSTALLED) {
		if (JUST_INSTALLED) {
			if (!IS_EDGE) {
				return new Promise((resolve) => {
					let foundUTM = false;
					// This query fails on Edge
					chrome.tabs.query({
						url: [
							'https://www.ghostery.com/*'
						]
					}, (tabs) => {
						tabs.forEach((tab) => {
							if (foundUTM) { return; }

							const query = processUrlQuery(tab.url);
							if (!query.utm_source || !query.utm_campaign) { return; }

							this.utm_source = query.utm_source;
							this.utm_campaign = query.utm_campaign;
							foundUTM = true;
							prefsSet({
								utm_source: this.utm_source,
								utm_campaign: this.utm_campaign
							});
						});
						resolve();
					});
				});
			}
			return new Promise((resolve) => {
				chrome.tabs.query({}, (tabs) => {
					let foundUTM = false;
					tabs.forEach((tab) => {
						if (foundUTM) { return; }
						if (tab.url && tab.url.includes('https://www.ghostery.com/')) {
							const query = processUrlQuery(tab.url);
							if (!query.utm_source || !query.utm_campaign) { return; }
							this.utm_source = query.utm_source;
							this.utm_campaign = query.utm_campaign;
							foundUTM = true;
							prefsSet({
								utm_source: this.utm_source,
								utm_campaign: this.utm_campaign
							});
						}
					});
					resolve();
				});
			});
		}
		return prefsGet('utm_source', 'utm_campaign')
			.then((prefs) => {
				this.utm_source = prefs.utm_source || '';
				this.utm_campaign = prefs.utm_campaign || '';
			}).catch((error) => {
				log('Metrics init() error', error);
			});
	}

	/**
	 * Responds to individual user actions and sequences of user actions that may indicate a broken page,
	 * sending broken_page pings as needed
	 * For example, sends a broken_page ping when the user whitelists a site,
	 * then refreshes the page less than a minute later
	 * @param 	{int} 		triggerId	'what specifically triggered this broken_page ping?' identifier sent along to the metrics server
	 * @param 	{string} 	newTabUrl	for checking whether user has opened the same url in a new tab, which confirms a suspicion raised by certain triggers
	 */
	handleBrokenPageTrigger(triggerId, newTabUrl = null) {
		if (this._brokenPageWatcher.on && triggerId === globals.BROKEN_PAGE_REFRESH) {
			this.ping('broken-page');
			this._unplugBrokenPageWatcher();
			return;
		}

		if (this._brokenPageWatcher.on && triggerId === globals.BROKEN_PAGE_NEW_TAB && this._brokenPageWatcher.url === newTabUrl) {
			this.ping('broken-page');
			this._unplugBrokenPageWatcher();
			return;
		}

		if (triggerId === globals.BROKEN_PAGE_NEW_TAB) { return; }

		this._resetBrokenPageWatcher(triggerId);
	}
	/**
	 * handleBrokenPageTrigger helper
	 * starts the temporary watch for a second suspicious user action in response to a first
	 * @param 	{int} 		triggerId	'what specifically triggered this broken_page ping?' identifier sent along to the metrics server
	 * @private
	 */
	_resetBrokenPageWatcher(triggerId) {
		this._clearBrokenPageWatcherTimeout();

		getActiveTab((tab) => {
			const tabUrl = tab && tab.url ? tab.url : '';

			this._brokenPageWatcher = Object.assign({}, {
				on: true,
				triggerId,
				triggerTime: Date.now(),
				timeoutId: setTimeout(this._clearBrokenPageWatcher, BROKEN_PAGE_WATCH_THRESHOLD),
				url: tabUrl,
			});
		});
	}
	/**
	 * handleBrokenPageTrigger helper
	 * @private
	 */
	_unplugBrokenPageWatcher() {
		this._clearBrokenPageWatcherTimeout();

		this._brokenPageWatcher = Object.assign({},{
			on: false,
			triggerId: '',
			triggerTime: '',
			timeoutId: null,
			url: '',
		});
	}

	_clearBrokenPageWatcherTimeout() {
		const { timeoutId } = this._brokenPageWatcher;
		if (timeoutId) { clearTimeout(timeoutId); }
	}

	/**
	* Prepare data and send telemetry pings.
	* @param {string} type    type of the telemetry ping
	*/
	ping(type) {
		switch (type) {
			// Key Performance Metrics
			case 'install':
				this._recordInstall();
				break;
			case 'install_complete':
				this._recordInstallComplete();
				break;
			case 'upgrade':
				this._recordUpgrade();
				break;
			case 'active':
				this._recordActive();
				break;
			case 'engaged':
				this._recordEngaged();
				break;

			// Extension Usage
			case 'pause':
			case 'restrict_site':
			case 'resume':
			case 'sign_in':
			case 'trust_site':
				this._sendReq(type, ['all', 'daily']);
				break;

			// New to Ghostery 8
			case 'adblock_off':
			case 'adblock_on':
			case 'antitrack_off':
			case 'antitrack_on':
			case 'create_account_extension':
			case 'create_account_setup':
			case 'list_dash':
			case 'rewards_learn':
			case 'pause_snooze':
			case 'smartblock_off':
			case 'smartblock_on':
			case 'viewchange_from_detailed':
			case 'viewchange_from_expanded':
			case 'viewchange_from_simple':
				this._sendReq(type, ['all', 'daily']);
				break;
			case 'rewards_dash':
				this._sendReq(type, ['all', 'daily', 'monthly']);
				break;

			// Rewards Pings
			case 'engaged_offer':
				this._sendReq('engaged_offer', ['daily', 'weekly', 'monthly']);
				break;
			case 'rewards_off':
			case 'rewards_on':
				this._sendReq(type, ['all', 'daily']);
				break;
			case 'rewards_first_learn_more':
			case 'rewards_first_accept':
			case 'rewards_first_reject':
			case 'rewards_first_reject_optin':
			case 'rewards_first_reject_optout':
				this._sendReq(type, ['all']);
				break;

			// New to Ghostery 8.3
			case 'sign_in_success':
			case 'create_account_success':
			case 'tutorial_start':
			case 'tutorial_complete':
			case 'setup_start':
			case 'plus_cta_hub':
			case 'plus_cta_extension':
			case 'products_cta_android':
			case 'products_cta_ios':
			case 'products_cta_lite':
			case 'hist_plus_cta':
			case 'hist_stats_panel':
			case 'hist_reset_stats':
			case 'plus_panel_from_badge':
			case 'plus_panel_from_menu':
			case 'resubscribe':
			case 'priority_support_submit':
			case 'theme_change':
			case 'manage_subscription':
			case 'broken_page':
				this._sendReq(type, ['all']);
				break;

			// Uncaught Pings
			default:
				log(`metrics ping() error: ping name ${type} not found`);
				break;
		}
	}

	/**
	 * Set uninstall url
	 * @param  {string} 	conf key being changed
	 */
	setUninstallUrl(key) {
		if (typeof chrome.runtime.setUninstallURL === 'function') {
			// Set of conf keys used in constructing telemetry url
			const METRICS_URL_SET = new Set([
				'enable_human_web',
				'enable_offers',
				'account',
				'enable_metrics',
				'show_alert',
				'alert_expanded',
				'show_cmp'
			]);

			if (!key || METRICS_URL_SET.has(key)) {
				const metrics_url = this._buildMetricsUrl('uninstall');
				if (metrics_url.length) {
					chrome.runtime.setUninstallURL(metrics_url);
				}
			}
		}
	}

	/**
	 * Build telemetry URL
	 *
 	 * @private
 	 *
	 * @param  {string} type     	ping type
	 * @param  {string} frequency 	ping frequency
	 * @return {string}          	complete telemetry url
	 */
	_buildMetricsUrl(type, frequency) {
		const frequencyString = (type !== 'uninstall') ? `/${frequency}` : '';

		let metrics_url = `https://${METRICS_SUB_DOMAIN}.ghostery.com/${type}${frequencyString}?gr=-1` +
			// Old parameters, old names
			// Human web
			`&hw=${encodeURIComponent(conf.enable_human_web ? '1' : '0')}` +
			// Extension version
			`&v=${encodeURIComponent(EXTENSION_VERSION)}` +
			// User agent - browser
			`&ua=${encodeURIComponent(BROWSER_INFO.token)}` +
			// Operating system
			`&os=${encodeURIComponent(BROWSER_INFO.os)}` +
			// Browser language
			`&l=${encodeURIComponent(conf.language)}` +
			// Browser version
			`&bv=${encodeURIComponent(BROWSER_INFO.version)}` +

			// Old parameters, new names
			// Offers (former offers)
			`&of=${encodeURIComponent(conf.enable_offers ? '1' : '0')}` +
			// Random number, assigned at install (former install_rand)
			`&ir=${encodeURIComponent(conf.install_random_number)}` +
			// Login state (former signed_in)
			`&sn=${encodeURIComponent(conf.account ? '1' : '0')}` +
			// Date of install (former install_date)
			`&id=${encodeURIComponent(conf.install_date)}` +
			// Noncritical ping (former noncritical)
			`&nc=${encodeURIComponent(conf.enable_metrics ? '1' : '0')}` +
			// Purplebox state (former purplebox)
			`&pb=${encodeURIComponent(conf.show_alert ? (conf.alert_expanded ? '1' : '2') : '0')}` +
			// Showing campaign messages (former show_cmp)
			`&sc=${encodeURIComponent(conf.show_cmp ? '1' : '0')}` +

			// New parameters, new names
			// Extension_view - which view of the extension is the user in
			`&ev=${encodeURIComponent(conf.is_expert ? (conf.is_expanded ? '3' : '2') : '1')}` +
			// Adblocking state
			`&ab=${encodeURIComponent(conf.enable_ad_block ? '1' : '0')}` +
			// Smartblocking state
			`&sm=${encodeURIComponent(conf.enable_smart_block ? '1' : '0')}` +
			// Antitracking state
			`&at=${encodeURIComponent(conf.enable_anti_tracking ? '1' : '0')}` +
			// The deepest setup page reached by user during setup
			`&ss=${encodeURIComponent((conf.metrics.install_complete_all || type === 'install_complete') ? conf.setup_step.toString() : '-1')}` +
			// The number of times the user has gone through setup
			`&sl=${encodeURIComponent(conf.setup_number.toString())}` +
			// Type of blocking selected during setup
			`&sb=${encodeURIComponent(conf.setup_block.toString())}` +
			// Recency, days since last active daily ping
			`&rc=${encodeURIComponent(this._getRecencyActive(type, frequency).toString())}` +
			// Current number of rewards received
			`&rr=${encodeURIComponent(this._getRewardsCount().toString())}` +

			// New parameters to Ghostery 8.3
			// Subscription Type
			`&st=${encodeURIComponent(this._getSubscriptionType().toString())}` +
			// Whether the computer ever had a Paid Subscription
			`&ps=${encodeURIComponent(conf.paid_subscription ? '1' : '0')}` +
			// Active Velocity
			`&va=${encodeURIComponent(this._getVelocityActive(type).toString())}` +
			// Engaged Recency
			`&re=${encodeURIComponent(this._getRecencyEngaged(type, frequency).toString())}` +
			// Engaged Velocity
			`&ve=${encodeURIComponent(this._getVelocityEngaged(type).toString())}` +
			// Theme
			`&th=${encodeURIComponent(this._getThemeValue().toString())}`;

		if (CAMPAIGN_METRICS.includes(type)) {
			// only send campaign attribution when necessary
			metrics_url +=
				// Marketing source (Former utm_source)
				`&us=${encodeURIComponent(this.utm_source)}` +
				// Marketing campaign (Former utm_campaign)
				`&uc=${encodeURIComponent(this.utm_campaign)}`;
		} else if (FIRST_REWARD_METRICS.includes(type)) {
			// metrics specific to the first reward instance
			metrics_url +=
				// Reward ID
				`&rid=${encodeURIComponent(this._getRewardId().toString())}`;
		} else if (type === 'broken_page' && this._brokenPageWatcher.on) {
			metrics_url +=
				// What triggered the broken page ping?
				`&setup_path=${encodeURIComponent(this._brokenPageWatcher.triggerId.toString())}` +
				// How much time passed between the trigger and the page refresh / open in new tab?
				`&setup_block=${encodeURIComponent((Date.now() - this._brokenPageWatcher.triggerTime).toString())}`;
		}

		return metrics_url;
	}

	/**
	 * Send Ping Request
	 *
	 * @private
	 *
	 * @param {string} 		type 						ping type
	 * @param {array} 		[frequencies = ['all']] 	array of ping frequencies
	 */
	_sendReq(type, frequencies) {
		let options = {};
		if (typeof frequencies === 'undefined') {
			frequencies = ['all']; // eslint-disable-line no-param-reassign
		}

		if (!IS_EDGE && typeof fetch === 'function') {
			const headers = new Headers();
			headers.append('Content-Type', 'image/gif');

			options = {
				headers,
				referrerPolicy: 'no-referrer',
				credentials: 'omit',
				type: 'image'
			};
		}

		frequencies.forEach((frequency) => {
			if (this._checkPing(type, frequency)) {
				const timeNow = Number((new Date()).getTime());
				const metrics_url = this._buildMetricsUrl(type, frequency);
				// update Conf timestamps for each ping type and frequency
				const metrics = conf.metrics || {};
				metrics[`${type}_${frequency}`] = timeNow;
				conf.metrics = metrics;

				log(`sending ${type} ping with ${frequency} frequency`);

				if (!IS_EDGE && typeof fetch === 'function') {
					const request = new Request(metrics_url, options);
					fetch(request).catch((err) => {
						log(`Error sending Metrics ${type} ping`, err);
					});
				} else {
					const xhr = new XMLHttpRequest();
					xhr.open('GET', metrics_url, true);
					xhr.setRequestHeader('Content-Type', 'image/gif');
					xhr.send();
				}
			}
		});
	}

	/**
	 * Calculate days since the last daily active ping.
	 *
	 * @private
	 *
	 * @return {number} 	in days since the last daily active ping
	 */
	_getRecencyActive(type, frequency) {
		if (conf.metrics.active_daily && (type === 'active' || type === 'engaged') && frequency === 'daily') {
			return Math.floor((Number(new Date().getTime()) - conf.metrics.active_daily) / 86400000);
		}
		return -1;
	}

	/**
	 * Calculate days since the last daily engaged ping.
	 *
	 * @private
	 *
	 * @return {number} 	in days since the last daily engaged ping
	 */
	_getRecencyEngaged(type, frequency) {
		if (conf.metrics.engaged_daily && (type === 'active' || type === 'engaged') && frequency === 'daily') {
			return Math.floor((Number(new Date().getTime()) - conf.metrics.engaged_daily) / 86400000);
		}
		return -1;
	}

	/**
	 * Get the Active Velocity
	 * @private
	 * @return {number}  The Active Velocity
	 */
	_getVelocityActive(type) {
		if (type !== 'active' && type !== 'engaged') {
			return -1;
		}
		const active_daily_velocity = conf.metrics.active_daily_velocity || [];
		const today = Math.floor(Number(new Date().getTime()) / 86400000);
		return active_daily_velocity.filter(el => el > today - 7).length;
	}

	/**
	 * Get the Engaged Velocity
	 * @private
	 * @return {number}  The Engaged Velocity
	 */
	_getVelocityEngaged(type) {
		if (type !== 'active' && type !== 'engaged') {
			return -1;
		}
		const engaged_daily_velocity = conf.metrics.engaged_daily_velocity || [];
		const today = Math.floor(Number(new Date().getTime()) / 86400000);
		return engaged_daily_velocity.filter(el => el > today - 7).length;
	}

	/**
	 * Get the Subscription Type
	 * @return {string} Subscription Name
	 */
	_getSubscriptionType() {
		if (!conf.account) {
			return -1;
		}
		const subscriptions = conf.account.subscriptionData;
		if (!subscriptions) {
			return -1;
		}
		return subscriptions.productName.toUpperCase().replace(' ', '_');
	}

	/**
	 * Get the number of Rewards shown to the user.
	 *
	 * @private
	 *
	 * @return {string} 	number of rewards, grouped into ranges.
	 */
	_getRewardsCount() {
		const numShown = rewards.totalOffersSeen;
		if (numShown >= 6) {
			return '6+';
		}
		if (numShown >= 2) {
			return '2-5';
		}
		if (numShown === 1) {
			return '1';
		}
		return '0';
	}

	/**
	 * Get the current Reward Id.
	 *
	 * @private
	 *
	 * @return {string} 	the current Reward Id
	 */
	_getRewardId() {
		const currentOffer = rewards.currentOffer || { offer_id: 'no_id' };
		return currentOffer.offer_id;
	}

	/**
	 * Get the Int associated with the Current Theme.
	 * @private
	 * @return {Int} value associated with the Current Theme
	 */
	_getThemeValue() {
		const { current_theme } = conf;
		if (current_theme === 'midnight-theme') {
			return 1;
		}
		return 0;
	}

	/**
	 * Calculate remaining scheduled time for a ping
	 *
	 * @private
	 *
	 * @param {string}	type 		type of the recorded event
	 * @param {string}	frequency 	one of 'all', 'daily', 'weekly'
	 * @return {number} 				number in milliseconds over the frequency since the last ping
	 */
	_timeToExpired(type, frequency) {
		if (frequency === 'all') {
			return 0;
		}
		const result = conf.metrics[`${type}_${frequency}`];
		const last = (result === undefined) ? 0 : result;
		const now = Number((new Date()).getTime());
		const frequency_ago = now - FREQUENCIES[frequency];
		return (last === null) ? 0 : (last - frequency_ago);
	}

	/**
	 * Decide if the ping should be sent
	 *
	 * @private
	 *
	 * @param {string} type  		type of the recorded event
	 * @param {string} frequency 	one of 'all', 'daily', 'weekly'
	 * @return {boolean} 			true/false
	 */
	_checkPing(type, frequency) {
		const result = this._timeToExpired(type, frequency);
		if (result > 0) {
			return false;
		}
		if (CRITICAL_METRICS.includes(type)) {
			return true;
		}
		if (conf.enable_metrics) {
			return true;
		}
		if (conf.metrics.install_complete_all) {
			return false;
		}
		if (this.ping_set && this.ping_set.size < MAX_DELAYED_PINGS) {
			this.ping_set.add(type);
		} else {
			this.ping_set = [];
		}
		return false;
	}

	/**
	 * Record Install event
	 * @private
	 */
	_recordInstall() {
		// We don't want to record 'install' twice
		if (conf.metrics.install_all) {
			return;
		}
		this._sendReq('install');
	}

	/**
	 * Record Install Complete event
	 * @private
	 */
	_recordInstallComplete() {
		// We don't want to record 'install' twice
		if (conf.metrics.install_complete_all) {
			return;
		}
		this._sendReq('install_complete');
		this.ping_set.forEach((type) => {
			this.ping(type);
		});
		delete this.ping_set;
	}

	/**
	 * Record Upgrade event
	 * @private
	 */
	_recordUpgrade() {
		// set install_all on upgrade too
		const { metrics } = conf;
		metrics.install_all = Number((new Date()).getTime());
		conf.metrics = metrics;
		this._sendReq('upgrade');
	}

	/**
	 * Record Active event
	 * @private
	 */
	_recordActive() {
		const active_daily_velocity = conf.metrics.active_daily_velocity || [];
		const today = Math.floor(Number(new Date().getTime()) / 86400000);
		active_daily_velocity.sort();
		if (!active_daily_velocity.includes(today)) {
			active_daily_velocity.push(today);
			if (active_daily_velocity.length > 7) {
				active_daily_velocity.shift();
			}
		}
		conf.metrics.active_daily_velocity = active_daily_velocity;

		const daily = this._timeToExpired('active', 'daily');
		if (daily > 0) {
			setTimeout(() => {
				this._sendReq('active', ['daily']);
				setInterval(() => {
					this._sendReq('active', ['daily']);
				}, FREQUENCIES.daily);
			}, daily);
		} else {
			this._sendReq('active', ['daily']);
			setInterval(() => {
				this._sendReq('active', ['daily']);
			}, FREQUENCIES.daily);
		}

		const weekly = this._timeToExpired('active', 'weekly');
		if (weekly > 0) {
			setTimeout(() => {
				this._sendReq('active', ['weekly']);
				setInterval(() => {
					this._sendReq('active', ['weekly']);
				}, FREQUENCIES.weekly);
			}, weekly);
		} else {
			this._sendReq('active', ['weekly']);
			setInterval(() => {
				this._sendReq('active', ['weekly']);
			}, FREQUENCIES.weekly);
		}

		const monthly = this._timeToExpired('active', 'monthly');
		if (monthly > 0) {
			if (monthly <= FREQUENCIES.biweekly) {
				setTimeout(() => {
					this._sendReq('active', ['monthly']);
					this._repeat();
				}, monthly);
			} else {
				setTimeout(() => {
					setTimeout(() => {
						this._sendReq('active', ['monthly']);
						this._repeat();
					}, monthly - FREQUENCIES.biweekly);
				}, FREQUENCIES.biweekly);
			}
		} else {
			this._sendReq('active', ['monthly']);
			this._repeat();
		}
	}

	/**
	 * Record Engaged event
	 * @private
	 */
	_recordEngaged() {
		const engaged_daily_velocity = conf.metrics.engaged_daily_velocity || [];
		const today = Math.floor(Number(new Date().getTime()) / 86400000);
		engaged_daily_velocity.sort();
		if (!engaged_daily_velocity.includes(today)) {
			engaged_daily_velocity.push(today);
			if (engaged_daily_velocity.length > 7) {
				engaged_daily_velocity.shift();
			}
		}
		conf.metrics.engaged_daily_velocity = engaged_daily_velocity;

		this._sendReq('engaged', ['daily', 'weekly', 'monthly']);
	}

	/**
	 * Repeat sending active request every month
	 * if computer is continuously on.
	 * @private
	 */
	_repeat() {
		let flag = false;
		setInterval(() => {
			if (flag) {
				this._sendReq('active', ['monthly']);
			}
			flag = !flag;
		}, FREQUENCIES.biweekly);
	}
}

// return the class as a singleton
export default new Metrics();
