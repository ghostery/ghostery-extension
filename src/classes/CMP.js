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
import { getJson } from '../utils/utils';
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

	static _buildUrl() {
		return (`${CMP_BASE_URL}/check
			?os=${encodeURIComponent(BROWSER_INFO.os)}
			&hw=${encodeURIComponent(conf.enable_human_web ? '1' : '0')}
			&install_date=${encodeURIComponent(conf.install_date)}
			&ir=${encodeURIComponent(conf.install_random_number)}
			&gv=${encodeURIComponent(EXTENSION_VERSION)}
			&si=${encodeURIComponent(conf.account ? '1' : '0')}
			&ua=${encodeURIComponent(BROWSER_INFO.name)}
			&lc=${encodeURIComponent(conf.last_cmp_date)}
			&v=${encodeURIComponent(conf.cmp_version)}
			&l=${encodeURIComponent(conf.language)}`
		);
	}

	static _isNewData(data) {
		return (data && (!conf.cmp_version || data.Version > conf.cmp_version));
	}
}

// return the class as a singleton
export default new CMP();
