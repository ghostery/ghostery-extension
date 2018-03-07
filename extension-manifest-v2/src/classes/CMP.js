/**
 * Consumer Messaging Platform (CMP) Class
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

import conf from './Conf';
import globals from './Globals';
import { getJson } from '../utils/utils';
import { log } from '../utils/common';

const { BROWSER_INFO, CMP_SUB_DOMAIN, EXTENSION_VERSION } = globals;
const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
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

		const URL = `https://${CMP_SUB_DOMAIN}.ghostery.com/check
			?os=${encodeURIComponent(BROWSER_INFO.os)}
			&offers=${encodeURIComponent(conf.enable_offers ? '1' : '0')}
			&hw=${encodeURIComponent(IS_EDGE ? '2' : (conf.enable_human_web ? '1' : '0'))}
			&install_date=${encodeURIComponent(conf.install_date)}
			&ir=${encodeURIComponent(conf.install_random_number)}
			&gv=${encodeURIComponent(EXTENSION_VERSION)}
			&si=${encodeURIComponent(conf.login_info.logged_in ? '1' : '0')}
			&ua=${encodeURIComponent(BROWSER_INFO.name)}
			&lc=${encodeURIComponent(conf.last_cmp_date)}
			&v=${encodeURIComponent(conf.cmp_version)}
			&l=${encodeURIComponent(conf.language)}`;

		return getJson(URL).then((data) => {
			if (data && (!conf.cmp_version || data.Version > conf.cmp_version)) {
				// set default dismiss
				data.Campaigns.forEach((campaign) => {
					if (campaign.Dismiss === 0) {
						campaign.Dismiss = 10;
					}

					// set last campaign run timestamp to avoid running campaigns more than once
					if (!conf.last_cmp_date || conf.last_cmp_date < campaign.Timestamp) {
						conf.last_cmp_date = campaign.Timestamp;
					}
				});
				// update Conf and local CMP_DATA
				conf.cmp_version = data.Version;
				// eslint-disable-next-line no-multi-assign
				globals.SESSION.cmp_data = this.CMP_DATA = data.Campaigns;
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
}

// return the class as a singleton
export default new CMP();
