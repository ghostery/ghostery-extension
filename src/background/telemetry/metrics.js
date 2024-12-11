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
      res[key] = value;
    }
    return res;
  } catch {
    return {};
  }
}

// CONSTANTS
const FREQUENCIES = {
  // in milliseconds
  daily: 86400000,
  weekly: 604800000,
  monthly: 2419200000,
};

const CAMPAIGN_METRICS = ['install', 'active', 'uninstall'];

/**
 * Class for handling telemetry pings.
 * @memberOf  BackgroundClasses
 */
export default class Metrics {
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
    this.saveStorage = saveStorage;
    this.storage = storage || {};
  }

  /**
   * Check if the extension was just installed
   * @returns {boolean} true if the extension was just installed
   */
  isJustInstalled() {
    return !this.storage.install_all;
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
      case 'active':
        this._recordActive();
        break;
      case 'engaged':
        this._recordEngaged();
        break;

      // Uncaught Pings
      default:
        this.log(`metrics ping() error: ping name ${type} not found`);
        break;
    }
  }

  /**
   * Set uninstall url
   */
  async setUninstallUrl() {
    const url = await this._buildMetricsUrl('uninstall');
    chrome.runtime.setUninstallURL(url);
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
      buildQueryPair('id', this.storage.installDate) +
      // Product ID Parameter
      buildQueryPair('pi', browserInfo.token === 'gd' ? 'gd' : 'gbe') +
      //
      // -- obsolete static parameters --
      //
      // Showing campaign messages (former show_cmp)
      buildQueryPair('sc', '0') +
      // Subscription Type
      buildQueryPair('st', '-1') +
      // New parameters for Ghostery 8.5.2
      // Subscription Interval
      buildQueryPair('si', '0');

    if (type !== 'uninstall') {
      metrics_url +=
        // Random number, assigned at install (former install_rand)
        buildQueryPair('ir', this.storage.installRandom) +
        // Adblocking state
        buildQueryPair('ab', conf.blockAds ? '1' : '0') +
        // Smartblocking state
        buildQueryPair('sm', conf.blockAnnoyances ? '1' : '0') +
        // Antitracking state
        buildQueryPair('at', conf.blockTrackers ? '1' : '0') +
        //
        // -- generative parameters --
        //
        // Recency, days since last active daily ping
        // prettier-ignore
        buildQueryPair('rc', this._getRecencyActive(type, frequency).toString()) +
        // Active Velocity
        buildQueryPair('va', this._getVelocityActive(type).toString()) +
        // Engaged Recency
        // prettier-ignore
        buildQueryPair('re',this._getRecencyEngaged(type, frequency).toString()) +
        // Engaged Velocity
        buildQueryPair('ve', this._getVelocityEngaged(type).toString()) +
        //
        // -- obsolete static parameters --
        //
        // Whether the computer ever had a Paid Subscription
        buildQueryPair('ps', '0') +
        // Human web
        buildQueryPair('hw', '1') +
        // Login state (former signed_in)
        buildQueryPair('sn', '0') +
        // Noncritical ping (former noncritical)
        buildQueryPair('nc', '0') +
        // Purplebox state (former purplebox)
        buildQueryPair('pb', '0') +
        // Extension_view - which view of the extension is the user in
        buildQueryPair('ev', '1') +
        // Onboarding status
        buildQueryPair('ss', '1') +
        // Onboarding last shown at
        buildQueryPair('sl', 0) +
        // Onboarding shown counter
        buildQueryPair('sb', '1') +
        // Theme
        buildQueryPair('th', '0') +
        // AB tests enabled?
        buildQueryPair('ts', '0');
    }

    if (CAMPAIGN_METRICS.includes(type)) {
      // only send campaign attribution when necessary
      metrics_url +=
        // Marketing source (Former utm_source)
        buildQueryPair('us', this.storage.utm_source) +
        // Marketing campaign (Former utm_campaign)
        buildQueryPair('uc', this.storage.utm_campaign);
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
    const headers = new Headers();
    headers.append('Content-Type', 'image/gif');

    const options = {
      headers,
      referrerPolicy: 'no-referrer',
      credentials: 'omit',
      type: 'image',
    };

    frequencies.forEach(async (frequency) => {
      if (this._checkPing(type, frequency)) {
        const timeNow = Date.now();
        const metrics_url = await this._buildMetricsUrl(type, frequency);

        // update Conf timestamps for each ping type and frequency
        this.storage[`${type}_${frequency}`] = timeNow;
        this.saveStorage(this.storage);

        this.log(`ping: ${frequency} ${type}`);

        const request = new Request(metrics_url, options);
        fetch(request).catch((err) => {
          this.log(`Error sending Metrics ${type} ping`, err);
        });
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
   * Calculate remaining scheduled time for a ping
   *
   * @private
   *
   * @param {string}	type 		type of the recorded event
   * @param {string}	frequency 	one of 'all', 'daily', 'weekly'
   * @return {number} 			number in milliseconds over the frequency since the last ping
   */
  _timeToExpired(type, frequency) {
    if (frequency === 'all') return 0;

    const key = `${type}_${frequency}`;

    // Protect against calling events immediately after install for all frequencies
    // They should trigger on the trailing edge of the frequency
    if (!this.storage[key]) {
      this.storage[key] = Date.now();
      this.saveStorage(this.storage);
    }

    const last = this.storage[key];
    const frequency_ago = Date.now() - FREQUENCIES[frequency];

    return last ? last - frequency_ago : 0;
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
    return this._timeToExpired(type, frequency) <= 0;
  }

  /**
   * Record Install event
   * @private
   */
  _recordInstall() {
    if (this.isJustInstalled()) {
      this._sendReq('install');
    }
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
    if (daily <= 0) {
      this._sendReq('active', ['daily']);
    }

    const weekly = this._timeToExpired('active', 'weekly');
    if (weekly <= 0) {
      this._sendReq('active', ['weekly']);
    }

    const monthly = this._timeToExpired('active', 'monthly');
    if (monthly <= 0) {
      this._sendReq('active', ['monthly']);
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
