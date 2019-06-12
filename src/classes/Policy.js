/**
 * Site Policy Class
 *
 * Handles whitelist and blacklist functionality
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

/* eslint no-param-reassign: 0 */

import c2pDb from './Click2PlayDb';
import conf from './Conf';
import { processUrl } from '../utils/utils';
import globals from './Globals';

/**
 * Enum for reasons returned by shouldBlock
 * TBD: See if we can do with integer values for performance.
 * @type {string}
 */
export const BLOCK_REASON_BLOCK_PAUSED = 'BLOCK_REASON_BLOCK_PAUSED';
export const BLOCK_REASON_GLOBAL_BLOCKED = 'BLOCK_REASON_GLOBAL_BLOCKED';
export const BLOCK_REASON_WHITELISTED = 'BLOCK_REASON_WHITELISTED';
export const BLOCK_REASON_BLACKLISTED = 'BLOCK_REASON_BLACKLISTED';
export const BLOCK_REASON_SS_UNBLOCKED = 'BLOCK_REASON_SS_UNBLOCKED';
export const BLOCK_REASON_SS_BLOCKED = 'BLOCK_REASON_SS_BLOCKED';
export const BLOCK_REASON_C2P_ALLOWED_ONCE = 'BLOCK_REASON_C2P_ALLOWED_ONCE';
export const BLOCK_REASON_C2P_ALLOWED_THROUGH = 'BLOCK_REASON_C2P_ALLOWED_THROUGH';

/**
 * Class for handling site policy.
 * @memberof  BackgroundClasses
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
			console.log('WHITELIST CHECK (we will want to make a new function similar to this just for anti-tracking)', sites);
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
	 * @typedef {Object} BlockWithReason
	 * @property {boolean}	block	indicates if the tracker should be blocked.
	 * @property {string}	reason	indicates the reason for the block result.
	 */

	/**
	 * Check the users blocking settings (selected_app_ids and site_specific_blocks/unblocks)
	 * to determine whether a tracker should be blocked
	 * @param  {number} app_id 		tracker id
	 * @param  {number} cat_id 		category id
	 * @param  {number} tab_id 		tab id
	 * @param  {string} tab_host 	tab url host
	 * @param  {string} tab_url 	tab url
	 * @return {BlockWithReason}	block result with reason
	 */
	shouldBlock(app_id, cat_id, tab_id, tab_host, tab_url) {
		if (globals.SESSION.paused_blocking) {
			return { block: false, reason: BLOCK_REASON_BLOCK_PAUSED };
		}

		if (conf.selected_app_ids.hasOwnProperty(app_id)) {
			if (conf.toggle_individual_trackers && conf.site_specific_unblocks.hasOwnProperty(tab_host) && conf.site_specific_unblocks[tab_host].includes(+app_id)) {
				if (this.blacklisted(tab_url)) {
					const allowedOnce = c2pDb.allowedOnce(tab_id, app_id);
					return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_BLACKLISTED };
				}
				return { block: false, reason: BLOCK_REASON_SS_UNBLOCKED };
			}
			if (this.whitelisted(tab_url)) {
				return { block: false, reason: BLOCK_REASON_WHITELISTED };
			}
			const allowedOnce = c2pDb.allowedOnce(tab_id, app_id);
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_GLOBAL_BLOCKED };
		}
		// We get here when app_id is not selected for blocking
		if (conf.toggle_individual_trackers && conf.site_specific_blocks.hasOwnProperty(tab_host) && conf.site_specific_blocks[tab_host].includes(+app_id)) {
			if (this.whitelisted(tab_url)) {
				return { block: false, reason: BLOCK_REASON_WHITELISTED };
			}
			const allowedOnce = c2pDb.allowedOnce(tab_id, app_id);
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_SS_BLOCKED };
		}
		if (this.blacklisted(tab_url)) {
			const allowedOnce = c2pDb.allowedOnce(tab_id, app_id);
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_BLACKLISTED };
		}
		return { block: false, reason: BLOCK_REASON_GLOBAL_BLOCKED };
	}
}

export default Policy;
