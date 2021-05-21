/**
 * Consumer Messaging Platform (CMP) Class
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

import conf from './Conf';
import globals from './Globals';
import { getJson, buildQueryPair } from '../utils/utils';
import { log } from '../utils/common';

const { BROWSER_INFO, CMP_BASE_URL, EXTENSION_VERSION } = globals;

/**
 * Class for handling notification and/or marketing campaigns.
 * @memberOf  BackgroundClasses
 */
class CMP {
	constructor() {
		this.CMP_DATA = [];
	}

	/**
	 * Checks the CMP (if enabled) every 30min for new campaigns.
	 * @return {Promise} - send back CMP data on resolve or false on reject
	 */
	fetchCMPData() {
		if (!conf.show_cmp) {
			return Promise.resolve(false);
		}

		const URL = CMP._buildUrl();

		return getJson(URL).then((data) => {
			if (CMP._isNewData(data)) {
				this._updateCampaigns(data);
				return this.CMP_DATA;
			}
			// getJson() returned a 204, meaning no new campaigns available
			log('No CMP data to fetch at this time');
			globals.SESSION.cmp_data = [];
			return false;
		}).catch((err) => {
			log('Error in fetchCMPData', err);
			return false;
		});
	}

	debugFetch() {
		const URL = CMP._buildUrl();

		return getJson(URL)
			.then((data) => {
				if (CMP._isNewData(data)) {
					this._updateCampaigns(data);
					return ({ ok: true, testsUpdated: true });
				}
				globals.SESSION.cmp_data = [];
				return ({ ok: true, testsUpdated: false });
			})
			.catch(() => ({ ok: false, testsUpdated: false }));
	}

	_updateCampaigns(data) {
		// set default dismiss
		data.Campaigns.forEach((dataEntry) => {
			if (dataEntry.Dismiss === 0) {
				dataEntry.Dismiss = 10;
			}

			// set last campaign (dataEntry) run timestamp to avoid running campaigns more than once
			if (!conf.last_cmp_date || conf.last_cmp_date < dataEntry.Timestamp) {
				conf.last_cmp_date = dataEntry.Timestamp;
			}
		});
		// update Conf and local CMP_DATA
		conf.cmp_version = data.Version;
		globals.SESSION.cmp_data = data.Campaigns;
		this.CMP_DATA = data.Campaigns;
	}

	static _getSubStatus() {
		let subStatus = 'free';
		if (conf.account && conf.account.subscriptionData) {
			switch (conf.account.subscriptionData.productName) {
				case 'Ghostery Plus':
					subStatus = 'plus';
					break;
				case 'Ghostery Premium':
					subStatus = 'premium';
					break;
				default:
					break;
			}
		}
		return subStatus;
	}

	static async _buildUrl() {
		await BROWSER_INFO_READY;
		return (`${CMP_BASE_URL}/check
			${buildQueryPair('os', BROWSER_INFO.os, true)}
			${buildQueryPair('hw', conf.enable_human_web ? '1' : '0')}
			${buildQueryPair('install_date', conf.install_date)}
			${buildQueryPair('ir', conf.install_random_number)}
			${buildQueryPair('gv', EXTENSION_VERSION)}
			${buildQueryPair('ua', BROWSER_INFO.name)}
			${buildQueryPair('lc', conf.last_cmp_date)}
			${buildQueryPair('v', conf.cmp_version)}
			${buildQueryPair('l', conf.language)}
			${buildQueryPair('ss', this._getSubStatus())}`
		);
	}

	static _isNewData(data) {
		return (data && (!conf.cmp_version || data.Version > conf.cmp_version));
	}
}

// return the class as a singleton
export default new CMP();
