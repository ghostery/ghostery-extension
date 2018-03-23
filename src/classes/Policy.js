/**
 * Site Policy Class
 *
 * Handles whitelist and blacklist functionality
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

/* eslint no-param-reassign: 0 */

import c2pDb from './Click2PlayDb';
import conf from './Conf';
import { processUrl } from '../utils/utils';
import globals from './Globals';

/**
 * Enum for reasons returned by shouldBlock
 * @type {string}
 * TBD: See if we can do with integer values for performance.
 */
export const BLOCK_REASON_PAUSED = 'BLOCK_REASON_PAUSED';
export const BLOCK_REASON_ALLOW_ONCE = 'BLOCK_REASON_ALLOW_ONCE';
export const BLOCK_REASON_BLACKLISTED = 'BLOCK_REASON_BLACKLISTED';
export const BLOCK_REASON_SS_UNBLOCK = 'BLOCK_REASON_SS_UNBLOCK';
export const BLOCK_REASON_WHITELISTED = 'BLOCK_REASON_WHITELISTED';
export const BLOCK_REASON_GLOBAL_BLOCKING = 'BLOCK_REASON_GLOBAL_BLOCKING';
export const BLOCK_REASON_SS_BLOCKED = 'BLOCK_REASON_SS_BLOCKED';
/**
 * Class for handling site policy.
 * @memberOf  BackgroundClasses
 * @todo  make it a Singelton ???
 */
class Policy {
	/**
	 * Check given url against whitelist/blacklist
	 * @param  {string} url		site url
	 * @return {boolean}
	 */
	getSitePolicy(url) {
		if (this.blacklisted(url)) {
			return 1;
		}
		if (this.whitelisted(url)) {
			return 2;
		}
		return false;
	}

	/**
	 * Check given url against whitelist
	 * @param  {string} url 		site url
	 * @return {string|boolean} 	corresponding whitelist entry or false, if none
	 */
	whitelisted(url) {
		if (url) {
			url = processUrl(url).host;
			url = url.replace(/^www\./, '');
			const sites = conf.site_whitelist || [];
			const num_sites = sites.length;

			// TODO: speed up
			for (let i = 0; i < num_sites; i++) {
				// TODO match from the beginning of the string to avoid false matches (somewhere in the querystring for instance)
				if (url === sites[i]) {
					return sites[i];
				}
			}
		}

		return false;
	}

	/**
	 * Check given url against blacklist
	 * @param  {string} url 		site url
	 * @return {string|boolean} 	corresponding blacklist entry or false, if none
	 */
	blacklisted(url) {
		if (url) {
			url = processUrl(url).host;
			url = url.replace(/^www\./, '');
			const sites = conf.site_blacklist || [];
			const num_sites = sites.length;

			// TODO: speed up
			for (let i = 0; i < num_sites; i++) {
				// TODO match from the beginning of the string to avoid false matches (somewhere in the querystring for instance)
				if (url === sites[i]) {
					return sites[i];
				}
			}
		}

		return false;
	}

	/**
	 * Check the users blocking settings (selected_app_ids and site_specific_blocks/unblocks)
	 * to determine whether a tracker should be blocked
	 * @param  {number} app_id 		tracker id
	 * @param  {number} cat_id 		category id
	 * @param  {number} tab_id 		tab id
	 * @param  {string} tab_host 	tab url host
	 * @param  {string} tab_url 	tab url
	 * @return {Object} 			{block, ss_unblock}
	 */
	shouldBlock(app_id, cat_id, tab_id, tab_host, tab_url) {
		if (globals.SESSION.paused_blocking) {
			return { block: false, reason: BLOCK_REASON_PAUSED };
		}

		const allowedOnce = c2pDb.allowedOnce(tab_id, app_id);
		if (conf.selected_app_ids.hasOwnProperty(app_id)) {
			if (conf.toggle_individual_trackers && conf.site_specific_unblocks.hasOwnProperty(tab_host) && conf.site_specific_unblocks[tab_host].includes(+app_id)) {
				if (this.blacklisted(tab_url)) {
					return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_ALLOW_ONCE : BLOCK_REASON_BLACKLISTED };
				}
				return { block: false, reason: BLOCK_REASON_SS_UNBLOCK };
			}
			if (this.whitelisted(tab_url)) {
				return { block: false, reason: BLOCK_REASON_WHITELISTED };
			}
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_ALLOW_ONCE : BLOCK_REASON_GLOBAL_BLOCKING };
		}
		// We get here when app_id is not selected for blocking
		if (conf.toggle_individual_trackers && conf.site_specific_blocks.hasOwnProperty(tab_host) && conf.site_specific_blocks[tab_host].includes(+app_id)) {
			if (this.whitelisted(tab_url)) {
				return { block: false, reason: BLOCK_REASON_WHITELISTED };
			}
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_ALLOW_ONCE : BLOCK_REASON_SS_BLOCKED };
		}
		if (this.blacklisted(tab_url)) {
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_ALLOW_ONCE : BLOCK_REASON_BLACKLISTED };
		}
		return { block: false, reason: BLOCK_REASON_GLOBAL_BLOCKING };
	}
}

export default Policy;

