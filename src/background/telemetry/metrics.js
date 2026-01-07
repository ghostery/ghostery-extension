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

import { FLAG_MODES } from '@ghostery/config';

import getDefaultLanguage from './language.js';
import getBrowserInfo from '/utils/browser-info.js';

/**
 * Allows to run async operations one by one (FIFO, first-in first-out).
 * The execution of function will only be started once all previously
 * scheduled functions have resolved (either successfully or by an exception).
 *
 * (copied from src/seq-executor.js)
 */
class SeqExecutor {
  constructor() {
    this.pending = Promise.resolve();
  }

  async run(func) {
    let result;
    let failed = false;
    this.pending = this.pending.then(async () => {
      try {
        result = await func();
      } catch (e) {
        failed = true;
        result = e;
      }
    });
    await this.pending;
    if (failed) {
      throw result;
    }
    return result;
  }

  async waitForAll() {
    await this.pending;
  }
}

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
    this._sendReqLock = new SeqExecutor();
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
      case 'install_complete':
        this._recordInstallComplete();
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
      // Toolbar pinned
      buildQueryPair('tp', Number(conf.userSettings?.isOnToolbar ?? -1)) +
      // ZAP mode (-1 = flag disabled, 0 = default, 1 = zap, 2 = default + touched, 3 = zap + touched)
      buildQueryPair(
        'zap',
        !conf.config.hasFlag(FLAG_MODES)
          ? '-1'
          : this.storage.modeTouched
            ? conf.options.mode === 'zap'
              ? '3'
              : '2'
            : conf.options.mode === 'zap'
              ? '1'
              : '0',
      );

    if (type !== 'uninstall') {
      metrics_url +=
        // Adblocking state
        buildQueryPair('ab', conf.options.blockAds ? '1' : '0') +
        // Smartblocking state
        buildQueryPair('sm', conf.options.blockAnnoyances ? '1' : '0') +
        // Antitracking state
        buildQueryPair('at', conf.options.blockTrackers ? '1' : '0') +
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
        // Feedback state
        buildQueryPair('hw', conf.options.feedback ? '1' : '0');
    }

    if (CAMPAIGN_METRICS.includes(type)) {
      // only send campaign attribution when necessary
      metrics_url +=
        // Marketing source (Former utm_source)
        buildQueryPair('us', this.storage.utm_source) +
        // Marketing campaign (Former utm_campaign)
        buildQueryPair('uc', this.storage.utm_campaign);
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
    return this._sendReqLock.run(async () => {
      const now = Date.now();

      // Initialization:
      let storageDirty = false;
      for (const frequency of frequencies) {
        const key = `${type}_${frequency}`;

        // Protect against calling events immediately after install for all frequencies
        // They should trigger on the trailing edge of the frequency
        if (
          !this.storage[key] &&
          type !== 'engaged' &&
          type !== 'active' &&
          frequency !== 'all'
        ) {
          this.log(
            `ping: initializing metrics (type=${type}, frequency=${frequency}) [should be seen only once per type and frequency]`,
          );
          this.storage[key] = now;
          storageDirty = true;
        }

        const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;
        if (this.storage[key] > now + ONE_YEAR) {
          this.log(
            `ping: resetting metrics (type=${type}, frequency=${frequency}) [clock jump detected]`,
          );
          this.storage[key] = now;
          storageDirty = true;
        }
      }
      if (storageDirty) {
        await this.saveStorage(this.storage);
      }

      // 1. Prepare request (no side-effects on persistence or network requests yet)
      const preparedRequests = [];
      for (const frequency of frequencies) {
        const key = `${type}_${frequency}`;

        let shouldSendPing =
          frequency === 'all' ||
          now >= (this.storage[key] || 0) + FREQUENCIES[frequency];
        if (shouldSendPing) {
          this.storage[key] = now;
          this.log(`ping: ${frequency} ${type} (preparing...)`);

          preparedRequests.push({ type, frequency });
        }
      }

      if (preparedRequests.length === 0) {
        return;
      }

      // 2. Write changes to disk (otherwise, drop the signals)
      try {
        await this.saveStorage(this.storage);
      } catch (err) {
        throw new Error(
          `Error sending metrics (type=${type}. Failed to write on disk.`,
          { cause: err },
        );
      }

      // 3. Finally, send the request
      const headers = new Headers();
      headers.append('Content-Type', 'image/gif');
      const options = {
        headers,
        referrerPolicy: 'no-referrer',
        credentials: 'omit',
        type: 'image',
      };

      // Best-effort approach in sending metrics (no retries).
      // Note: even if one failed, keep sending to avoid biases.
      const results = await Promise.allSettled(
        preparedRequests.map(async ({ type, frequency }) => {
          const metrics_url = await this._buildMetricsUrl(type, frequency);

          const request = new Request(metrics_url, options);
          const response = await fetch(request);
          const ok = response.status >= 200 && response.status < 400;
          if (!ok) {
            throw new Error(
              `Error sending metrics (type=${type}, status=${response.status}`,
            );
          }
          this.log(`ping: ${frequency} ${type} (successfully sent)`);
        }),
      );
      for (const { status, reason } of results) {
        if (status === 'rejected') {
          throw reason;
        }
      }
      this.log(`ping: sending metrics of type=${type} succeeded.`);
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
   * Record Install event
   * @private
   */
  _recordInstall() {
    if (this.storage.install_all) {
      return;
    }
    this._sendReq('install').catch((err) => {
      this.log('Error sending metrics ("install" event dropped)', err);
    });
  }

  /**
   * Record Active event
   * @private
   */
  _recordActive() {
    const TEN_MINUTES = 10 * 60 * 1000;
    if (
      this.storage.install_all &&
      Date.now() - this.storage.install_all < TEN_MINUTES
    ) {
      return;
    }

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
    this.saveStorage(this.storage)
      .then(() => this._sendReq('active', ['daily', 'weekly', 'monthly']))
      .catch((err) => {
        this.log('Error sending metrics ("active" event dropped)', err);
      });
  }

  /**
   * Record Install Complete event
   * @private
   */
  _recordInstallComplete() {
    if (this.storage.install_complete_all) {
      return;
    }
    this._sendReq('install_complete').catch((err) => {
      this.log('Error sending metrics ("install_complete" event dropped)', err);
    });
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

    this.saveStorage(this.storage)
      .then(() => this._sendReq('engaged', ['daily', 'weekly', 'monthly']))
      .catch((err) => {
        this.log('Error sending metrics ("engaged" event dropped)', err);
      });
  }
}
