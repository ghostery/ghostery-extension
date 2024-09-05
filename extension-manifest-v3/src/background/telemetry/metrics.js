/**
 * Metrics
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017 Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import getDefaultLanguage from './language.js';
import getBrowserInfo from '/utils/browser-info.js';

/**
 * Helper for building query string key value pairs
 *
 * @since 8.5.4
 * @param  {string}  query		param to be included in string
 * @param  {string}  value		number value to be passed on through qeury string
 * @param  {boolean} queryStart	indicates whether the returned string is intended for start of a query
 * @return {string}         	complete query component
 */
export const buildQueryPair = (query, value, queryStart = false) =>
  `${queryStart ? '?' : '&'}${query}=${encodeURIComponent(value)}`;

/**
 * Process URLs and returns the query string as an object.
 * @memberOf BackgroundUtils
 * @param  {string} src 	the source url
 * @return {Object}			contains parts of parsed query as its properties
 */
export function processUrlQuery(src) {
  if (!src) {
    return {};
  }

  try {
    const res = {};
    for (const [key, value] of new URL(src).searchParams.entries()) {
      // eslint-disable-line no-restricted-syntax
      res[key] = value;
    }
    return res;
  } catch (e) {
    return {};
  }
}

// CONSTANTS
const FREQUENCIES = {
  // in milliseconds
  daily: 86400000,
  weekly: 604800000,
  biweekly: 1209600000,
  monthly: 2419200000,
};
export const FREQUENCY_TYPES = ['all', ...Object.keys(FREQUENCIES)];
export const CRITICAL_METRICS = [
  'install',
  'install_complete',
  'upgrade',
  'active',
  'engaged',
  'uninstall',
];
const CAMPAIGN_METRICS = ['install', 'active', 'uninstall'];
const MAX_DELAYED_PINGS = 100;
// Set of conf keys used in constructing telemetry url
const METRICS_URL_SET = new Set([
  'enable_human_web',
  'account',
  'enable_metrics',
  'show_alert',
  'alert_expanded',
  'show_cmp',
]);

/**
 * Class for handling telemetry pings.
 * @memberOf  BackgroundClasses
 */
class Metrics {
  constructor({
    getConf,
    log,
    EXTENSION_VERSION,
    METRICS_BASE_URL,
    saveStorage,
    storage,
  }) {
    this.EXTENSION_VERSION = EXTENSION_VERSION;
    this.METRICS_BASE_URL = METRICS_BASE_URL;
    this.getConf = getConf;
    this.log = log;

    this.utm_source = '';
    this.utm_campaign = '';
    // Store non-critical pings until install_complete
    this.ping_set = new Set();
    this.saveStorage = saveStorage;
    this.storage = storage || {};
  }

  async detectUTMs() {
    const tabs = await chrome.tabs.query({
      url: [
        'https://www.ghostery.com/*',
        'https://www.ghosterystage.com/*',
        'https://chrome.google.com/webstore/detail/ghostery-*/mlomiejdfkolichcflejclcbmpeaniij*',
        'https://microsoftedge.microsoft.com/addons/detail/ghostery-*/fclbdkbhjlgkbpfldjodgjncejkkjcme*',
        'https://addons.mozilla.org/*/firefox/addon/ghostery/*',
        'https://addons.opera.com/*/extensions/details/ghostery/*',
        'https://apps.apple.com/app/apple-store/id1436953057/*',
      ],
    });

    // find first ghostery.com tab with utm_source and utm_campaign
    for (const tab of tabs) {
      const query = processUrlQuery(tab.url);

      if (query.utm_source && query.utm_campaign) {
        this.setUTMs(query);
        break;
      }
    }

    return {
      utm_source: this.utm_source,
      utm_campaign: this.utm_campaign,
    };
  }

  setUTMs({ utm_source, utm_campaign }) {
    this.utm_source = utm_source;
    this.utm_campaign = utm_campaign;
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

      // Ghostery 8.0+
      case 'adblock_off':
      case 'adblock_on':
      case 'antitrack_off':
      case 'antitrack_on':
      case 'create_account_extension':
      case 'create_account_setup':
      case 'list_dash':
      case 'pause_snooze':
      case 'smartblock_off':
      case 'smartblock_on':
      case 'viewchange_from_detailed':
      case 'viewchange_from_expanded':
      case 'viewchange_from_simple':
        this._sendReq(type, ['all', 'daily']);
        break;

      // Ghostery 8.3+
      case 'sign_in_success':
      case 'create_account_success':
      case 'tutorial_start':
      case 'tutorial_complete':
      case 'setup_start':
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
        this._sendReq(type, ['all']);
        break;

      // Uncaught Pings
      default:
        this.log(`metrics ping() error: ping name ${type} not found`);
        break;
    }
  }

  /**
   * Set uninstall url
   * @param  {string} 	conf key being changed
   */
  async setUninstallUrl(key) {
    if (
      typeof chrome.runtime.setUninstallURL === 'function' &&
      (!key || METRICS_URL_SET.has(key))
    ) {
      const metrics_url = await this._buildMetricsUrl('uninstall');
      if (metrics_url.length) {
        chrome.runtime.setUninstallURL(metrics_url);
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
  async _buildMetricsUrl(type, frequency) {
    // Make sure that Globals._checkBrowserInfo() has resolved before we proceed,
    // so that we use the correct BROWSER_INFO values if we are in
    // the Ghostery Desktop or Ghostery Android browsers
    const browserInfo = await getBrowserInfo();
    const conf = await this.getConf();

    const frequencyString = type !== 'uninstall' ? `/${frequency}` : '';

    let metrics_url = `${this.METRICS_BASE_URL}/${type}${frequencyString}?gr=-1`;
    metrics_url +=
      // Crucial parameters
      // Always added for uninstall URL
      // Extension version
      buildQueryPair('v', this.EXTENSION_VERSION) +
      // User agent - browser
      buildQueryPair('ua', browserInfo.token) +
      // Operating system
      buildQueryPair('os', browserInfo.os) +
      // Browser language
      buildQueryPair('l', getDefaultLanguage()) +
      // Browser version
      buildQueryPair('bv', browserInfo.version) +
      // Date of install (former install_date)
      buildQueryPair('id', conf.install_date) +
      // Showing campaign messages (former show_cmp)
      buildQueryPair('sc', conf.show_cmp ? '1' : '0') +
      // Subscription Type
      buildQueryPair('st', this._getSubscriptionType(conf).toString()) +
      // New parameters for Ghostery 8.5.2
      // Subscription Interval
      buildQueryPair('si', this._getSubscriptionInterval().toString()) +
      // Product ID Parameter
      buildQueryPair('pi', browserInfo.token === 'gd' ? 'gd' : 'gbe');

    if (type !== 'uninstall') {
      metrics_url +=
        // Old parameters, old names
        // Human web
        buildQueryPair('hw', conf.enable_human_web ? '1' : '0') +
        // Old parameters, new names
        // Random number, assigned at install (former install_rand)
        buildQueryPair('ir', conf.install_random_number) +
        // Login state (former signed_in)
        buildQueryPair('sn', conf.account ? '1' : '0') +
        // Noncritical ping (former noncritical)
        buildQueryPair('nc', conf.enable_metrics ? '1' : '0') +
        // Purplebox state (former purplebox)
        buildQueryPair(
          'pb',
          conf.show_alert ? (conf.alert_expanded ? '1' : '2') : '0',
        ) +
        // New parameters, new names
        // Extension_view - which view of the extension is the user in
        buildQueryPair(
          'ev',
          conf.is_expert ? (conf.is_expanded ? '3' : '2') : '1',
        ) +
        // Adblocking state
        buildQueryPair('ab', conf.enable_ad_block ? '1' : '0') +
        // Smartblocking state
        buildQueryPair('sm', conf.enable_smart_block ? '1' : '0') +
        // Antitracking state
        buildQueryPair('at', conf.enable_anti_tracking ? '1' : '0') +
        // Onboarding status
        buildQueryPair(
          'ss',
          conf.setup_complete ? '1' : conf.setup_skip ? '-1' : '0',
        ) +
        // Onboarding last shown at
        buildQueryPair(
          'sl',
          conf.setup_timestamp &&
            new Date(conf.setup_timestamp).toISOString().split('T')[0],
        ) +
        // Onboarding shown counter
        buildQueryPair('sb', String(conf.setup_shown)) +
        // Recency, days since last active daily ping
        buildQueryPair(
          'rc',
          this._getRecencyActive(type, frequency).toString(),
        ) +
        // New parameters to Ghostery 8.3
        // Whether the computer ever had a Paid Subscription
        buildQueryPair('ps', conf.paid_subscription ? '1' : '0') +
        // Active Velocity
        buildQueryPair('va', this._getVelocityActive(type).toString()) +
        // Engaged Recency
        buildQueryPair(
          're',
          this._getRecencyEngaged(type, frequency).toString(),
        ) +
        // Engaged Velocity
        buildQueryPair('ve', this._getVelocityEngaged(type).toString()) +
        // Theme
        buildQueryPair('th', this._getThemeValue(conf).toString()) +
        // New parameter for Ghostery 8.5.3
        // AB tests enabled?
        buildQueryPair('ts', conf.enable_abtests ? '1' : '0');
    }

    if (CAMPAIGN_METRICS.includes(type) || type === 'uninstall') {
      // only send campaign attribution when necessary
      metrics_url +=
        // Marketing source (Former utm_source)
        buildQueryPair('us', this.utm_source) +
        // Marketing campaign (Former utm_campaign)
        buildQueryPair('uc', this.utm_campaign);
    }

    if (browserInfo.token === 'gd') {
      // fetch metrics from the search extension and append them
      const searchMetrics = await Metrics._getSearchExtensionMetrics();
      Object.keys(searchMetrics).forEach((k) => {
        metrics_url += buildQueryPair(k, searchMetrics[k]);
      });
    }

    return metrics_url;
  }

  /**
   * Send Ping Request
   *
   * @private
   *
   * @param {string} 		type 				ping type
   * @param {array} 		[frequencies = ['all']] 	array of ping frequencies
   */
  async _sendReq(type, frequencies = ['all']) {
    let options = {};
    const conf = await this.getConf();

    if (typeof fetch === 'function') {
      const headers = new Headers();
      headers.append('Content-Type', 'image/gif');

      options = {
        headers,
        referrerPolicy: 'no-referrer',
        credentials: 'omit',
        type: 'image',
      };
    }

    frequencies.forEach(async (frequency) => {
      if (this._checkPing(conf, type, frequency)) {
        const timeNow = Date.now();
        const metrics_url = await this._buildMetricsUrl(type, frequency);
        // update Conf timestamps for each ping type and frequency
        this.storage[`${type}_${frequency}`] = timeNow;
        this.saveStorage(this.storage);

        this.log(`sending ${type} ping with ${frequency} frequency`);

        if (typeof fetch === 'function') {
          const request = new Request(metrics_url, options);
          fetch(request).catch((err) => {
            this.log(`Error sending Metrics ${type} ping`, err);
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
   * @return {number} in days since the last daily active ping
   */
  _getRecencyActive(type, frequency) {
    if (
      this.storage.active_daily &&
      (type === 'active' || type === 'engaged') &&
      frequency === 'daily'
    ) {
      return Math.floor((Date.now() - this.storage.active_daily) / 86400000);
    }
    return -1;
  }

  /**
   * Calculate days since the last daily engaged ping.
   *
   * @private
   *
   * @return {number}	in days since the last daily engaged ping
   */
  _getRecencyEngaged(type, frequency) {
    if (
      this.storage.engaged_daily &&
      (type === 'active' || type === 'engaged') &&
      frequency === 'daily'
    ) {
      return Math.floor((Date.now() - this.storage.engaged_daily) / 86400000);
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
    const active_daily_velocity = this.storage.active_daily_velocity || [];
    const today = Math.floor(Date.now() / 86400000);
    return active_daily_velocity.filter((el) => el > today - 7).length;
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
    const engaged_daily_velocity = this.storage.engaged_daily_velocity || [];
    const today = Math.floor(Date.now() / 86400000);
    return engaged_daily_velocity.filter((el) => el > today - 7).length;
  }

  /**
   * Get the Subscription Type
   * @return {string} Subscription Name
   */
  _getSubscriptionType(conf) {
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
   * Get the Int associated with the Current Theme.
   * @private
   * @return {number} value associated with the Current Theme
   */
  _getThemeValue(conf) {
    const { current_theme } = conf;
    switch (current_theme) {
      case 'midnight-theme':
        return 1;
      case 'leaf-theme':
        return 2;
      case 'palm-theme':
        return 3;
      default:
        return 0;
    }
  }

  /**
   * Get the Int associated with the users subscription interval
   * @private
   * @return {number} String associated with the users subscription interval
   */
  _getSubscriptionInterval(conf) {
    const subscriptionInterval =
      conf &&
      conf.account &&
      conf.account.subscriptionData &&
      conf.account.subscriptionData.planInterval;

    switch (subscriptionInterval) {
      case 'month':
        return 1;
      case 'year':
        return 2;
      default:
        return 0;
    }
  }

  /**
   * Calculate remaining scheduled time for a ping
   *
   * @private
   *
   * @param {string}	type 		type of the recorded event
   * @param {string}	frequency 	one of 'all', 'daily', 'weekly'
   * @return {number} 			number in milliseconds over the frequency since the last ping
   */
  _timeToExpired(type, frequency) {
    if (frequency === 'all') {
      return 0;
    }
    const result = this.storage[`${type}_${frequency}`];
    const last = result === undefined ? 0 : result;
    const now = Date.now();
    const frequency_ago = now - FREQUENCIES[frequency];
    return last === null ? 0 : last - frequency_ago;
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
  _checkPing(conf, type, frequency) {
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
    if (this.ping_set && this.ping_set.size < MAX_DELAYED_PINGS) {
      this.ping_set.add(type);
    }
    return false;
  }

  /**
   * Record Install event
   * @private
   */
  _recordInstall() {
    // We don't want to record 'install' twice
    if (this.storage.install_all) {
      return;
    }
    this._sendReq('install');
  }

  /**
   * Record Install Complete event
   * @private
   */
  _recordInstallComplete() {
    this._sendReq('install_complete');
    this.ping_set?.forEach((type) => {
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
    this.storage.install_all = Date.now();
    this.saveStorage(this.storage);
    this._sendReq('upgrade');
  }

  /**
   * Record Active event
   * @private
   */
  _recordActive() {
    const active_daily_velocity = this.storage.active_daily_velocity || [];
    const today = Math.floor(Date.now() / 86400000);
    active_daily_velocity.sort();
    if (!active_daily_velocity.includes(today)) {
      active_daily_velocity.push(today);
      if (active_daily_velocity.length > 7) {
        active_daily_velocity.shift();
      }
    }
    this.storage.active_daily_velocity = active_daily_velocity;
    this.saveStorage(this.storage);

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
    const engaged_daily_velocity = this.storage.engaged_daily_velocity || [];
    const engaged_daily_count =
      this.storage.engaged_daily_count ||
      new Array(engaged_daily_velocity.length).fill(0);

    const today = Math.floor(Date.now() / 86400000); // Today's time

    engaged_daily_velocity.sort();
    if (!engaged_daily_velocity.includes(today)) {
      engaged_daily_velocity.push(today);
      engaged_daily_count.push(1);
      if (engaged_daily_velocity.length > 7) {
        engaged_daily_count.shift();
        engaged_daily_velocity.shift();
      }
    } else {
      engaged_daily_count[engaged_daily_velocity.indexOf(today)]++;
    }

    this.storage.engaged_daily_count = engaged_daily_count;
    this.storage.engaged_daily_velocity = engaged_daily_velocity;
    this.saveStorage(this.storage);
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

  static async _getSearchExtensionMetrics() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        'search@ghostery.com',
        'getMetrics',
        (response) => {
          resolve(response || {});
        },
      );
    });
  }
}

Metrics.CRITICAL_TYPES = CRITICAL_METRICS;
Metrics.FREQUENCY_TYPES = FREQUENCY_TYPES;

export default Metrics;
