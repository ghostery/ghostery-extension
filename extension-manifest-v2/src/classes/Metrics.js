/**
 * Metrics
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

import globals from './Globals';
import conf from './Conf';
import { log, prefsSet, prefsGet } from '../utils/common';
import { processUrlQuery } from '../utils/utils';

// CONSTANTS
const FREQUENCIES = { // in milliseconds
	daily: 86400000,
	weekly: 604800000,
	biweekly: 1209600000,
	monthly: 2419200000
};
const CRITICAL_METRICS = ['install', 'install_complete', 'upgrade', 'active', 'engaged', 'uninstall'];
const { METRICS_SUB_DOMAIN, EXTENSION_VERSION, BROWSER_INFO } = globals;
const IS_EDGE = (BROWSER_INFO.name === 'edge');
const MAX_DELAYED_PINGS = 100;
/**
 * Class for handling telemetry pings.
 * @memberOf  BackgroundClasses
 */
class Metrics {
	constructor() {
		this.utm_source = '';
		this.utm_campaign = '';
		this.ping_set = new Set();
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
				return new Promise((resolve, reject) => {
					let foundUTM = false;
					// This query fails on Edge
					chrome.tabs.query({
						url: [
							'https://www.ghostery.com/lp*',
							'https://www.ghostery.com/*/lp*',
							'https://www.ghostery.com/products*',
							'https://www.ghostery.com/*/products*'
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
							})
								.then(prefs => resolve(prefs))
								.catch(err => reject(err));
						});
						resolve();
					});
				});
			}
			return new Promise((resolve, reject) => {
				chrome.tabs.query({}, (tabs) => {
					let foundUTM = false;
					tabs.forEach((tab) => {
						if (foundUTM) { return; }
						if (tab.url && tab.url.includes('https://www.ghostery.com/') &&
									(tab.url.includes('products') || tab.url.includes('lp'))) {
							const query = processUrlQuery(tab.url);
							if (!query.utm_source || !query.utm_campaign) { return; }
							this.utm_source = query.utm_source;
							this.utm_campaign = query.utm_campaign;
							foundUTM = true;
							prefsSet({
								utm_source: this.utm_source,
								utm_campaign: this.utm_campaign
							})
								.then(reject)
								.catch(reject);
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
	* Prepare data and send telemetry pings.
	* All existing pings are listed here:
	* https://docs.ghostery.com/confluence/display/CT/GBE+Usage+Analytics+Pings
	*
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
				this._sendReq('engaged', ['daily', 'weekly', 'monthly']);
				break;

			// Extension Usage
			case 'pause':
				this._sendReq('pause', ['all', 'daily', 'weekly']);
				break;
			case 'resume':
				this._sendReq('resume', ['all', 'daily', 'weekly']);
				break;
			case 'trust_site':
				this._sendReq('trust_site', ['all', 'daily', 'weekly']);
				break;
			case 'restrict_site':
				this._sendReq('restrict_site', ['all', 'daily', 'weekly']);
				break;
			case 'live_scan':
				this._sendReq('live_scan', ['all', 'daily', 'weekly']);
				break;
			case 'sign_in':
				this._sendReq('sign_in', ['all', 'daily', 'weekly']);
				break;
			// New
			case 'list_dash':
				this._sendReq('list_dash', ['all', 'daily', 'weekly', 'monthly']); // ??? Why daily, etc?
				break;
			case 'history_dash':
				this._sendReq('history_dash', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'history_learn':
				this._sendReq('history_learn', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'performance_dash':
				this._sendReq('performance_dash', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'performance_learn':
				this._sendReq('performance_learn', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'rewards_dash':
				this._sendReq('rewards_dash', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'rewards_learn':
				this._sendReq('rewards_learn', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'premium_dash':
				this._sendReq('premium_dash', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'premium_learn':
				this._sendReq('premium_learn', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'antitrack_on':
				this._sendReq('antitrack_on', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'antitrack_off':
				this._sendReq('antitrack_off', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'adblock_on':
				this._sendReq('adblock_on', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'adblock_off':
				this._sendReq('adblock_off', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'smartblock_on':
				this._sendReq('smartblock_on', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'smartblock_off':
				this._sendReq('smartblock_off', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'pause_snooze':
				this._sendReq('pause_snooze', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'viewchange_from_simple':
				this._sendReq('viewchange_from_simple', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'viewchange_from_detailed':
				this._sendReq('viewchange_from_detailed', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'viewchange_from_expanded':
				this._sendReq('viewchange_from_expanded', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'create_account_extension':
				this._sendReq('create_account_extension', ['all', 'daily', 'weekly', 'monthly']);
				break;
			case 'create_account_setup':
				this._sendReq('create_account_setup', ['all', 'daily', 'weekly', 'monthly']);
				break;
			// uncaught ping type
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
				'login_info',
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

		return `https://${METRICS_SUB_DOMAIN}.ghostery.com/${type}${frequencyString}?gr=-1` +
			// Old parameters, old names
			// Human web
			`&hw=${encodeURIComponent(IS_EDGE ? '0' : (conf.enable_human_web ? '1' : '0'))}` +
			// Extension version
			`&v=${encodeURIComponent(EXTENSION_VERSION)}` +
			// User agent - browser
			`&ua=${encodeURIComponent(BROWSER_INFO.token)}` +
			// Operating system
			`&os=${encodeURIComponent(BROWSER_INFO.os)}` +
			// Browser language
			`&l=${encodeURIComponent(conf.language)}` +
			// Old parameters, new names
			// Offers (former offers)
			`&of=${encodeURIComponent(IS_EDGE ? '0' : (conf.enable_offers ? '1' : '0'))}` +
			// Random number, assigned at install (former install_rand)
			`&ir=${encodeURIComponent(conf.install_random_number)}` +
			// Login state (former signed_in)
			`&sn=${encodeURIComponent(conf.login_info.logged_in ? '1' : '0')}` +
			// Date of install (former install_date)
			`&id=${encodeURIComponent(conf.install_date)}` +
			// Noncritical ping (former noncritical)
			`&nc=${encodeURIComponent(conf.enable_metrics ? '1' : '0')}` +
			// Purplebox state (former purplebox)
			`&pb=${encodeURIComponent(conf.show_alert ? (conf.alert_expanded ? '1' : '2') : '0')}` +
			// Showing campaign messages (former show_cmp)
			`&sc=${encodeURIComponent(conf.show_cmp ? '1' : '0')}` +
			// Marketing source (Former utm_source)
			`&us=${encodeURIComponent(this.utm_source)}` +
			// Marketing campaign (Former utm_campaign)
			`&uc=${encodeURIComponent(this.utm_campaign)}` +

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
			// User choice of default or custom path during setup
			`&sp=${encodeURIComponent(conf.setup_path.toString())}` +
			// Type of blocking selected during setup
			`&sb=${encodeURIComponent(conf.setup_block.toString())}` +
			// Recency, days since last active daily ping
			`&rc=${encodeURIComponent(this._getRecency().toString())}`;
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
	_getRecency() {
		if (conf.metrics.active_daily) {
			return Math.floor((Number(new Date().getTime()) - conf.metrics.active_daily) / 86400000);
		}
		return -1;
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
