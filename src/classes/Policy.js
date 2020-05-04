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
import globals from './Globals';
import { processUrl } from '../utils/utils';

/**
 * Enum for reasons returned by shouldBlock
 * TBD: See if we can do with integer values for performance.
 * @type {string}
 */
export const BLOCK_REASON_BLOCK_PAUSED = 'BLOCK_REASON_BLOCK_PAUSED';
export const BLOCK_REASON_GLOBAL_BLOCKED = 'BLOCK_REASON_GLOBAL_BLOCKED';
export const BLOCK_REASON_GLOBAL_UNBLOCKED = 'BLOCK_REASON_GLOBAL_UNBLOCKED';
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
	getSitePolicy(hostUrl, trackerUrl) {
		if (this.blacklisted(hostUrl)) {
			return globals.BLACKLISTED;
		}
		if (this.checkSiteWhitelist(hostUrl) || this.checkCliqzModuleWhitelist(hostUrl, trackerUrl)) {
			return globals.WHITELISTED;
		}
		return false;
	}

	/**
	 * Check given url against site whitelist
	 * @param  {string} url 		site url
	 * @return {string|boolean} 	corresponding whitelist entry or false, if none
	 */
	checkSiteWhitelist(url) {
		const hostUrl = processUrl(url).host;
		if (hostUrl) {
			const replacedUrl = hostUrl.replace(/^www\./, '');
			const sites = conf.site_whitelist || [];
			const num_sites = sites.length;

			// TODO: speed up
			for (let i = 0; i < num_sites; i++) {
				// TODO match from the beginning of the string to avoid false matches (somewhere in the querystring for instance)
				if (!sites[i].includes('*') && replacedUrl === sites[i]) {
					return sites[i];
				}
				if (this.matchesWildcard(replacedUrl, sites[i])) {
					return sites[i];
				}
			}
		}

		return false;
	}

	/**
	 * Check given url against anti-tracking whitelist
	 * @param  {string} url 		site url
	 * @return {string|boolean} 	corresponding whitelist entry or false, if none
	 */
	checkCliqzModuleWhitelist(hostUrl, trackerUrl) {
		let isWhitelisted = false;
		const processedHostUrl = processUrl(hostUrl).host;
		const processedTrackerUrl = processUrl(trackerUrl).host;
		const cliqzModuleWhitelist = conf.cliqz_module_whitelist;

		if (cliqzModuleWhitelist[processedTrackerUrl]) {
			cliqzModuleWhitelist[processedTrackerUrl].hosts.some((host) => {
				if (host === processedHostUrl) {
					isWhitelisted = true;
					return true;
				}
				return false;
			});
		}

		return isWhitelisted;
	}

	/**
	 * Check given url against blacklist
	 * @param  {string} url 		site url
	 * @return {string|boolean} 	corresponding blacklist entry or false, if none
	 */
	blacklisted(url) {
		const hostUrl = processUrl(url).host;
		if (hostUrl) {
			const replacedUrl = hostUrl.replace(/^www\./, '');
			const sites = conf.site_blacklist || [];
			const num_sites = sites.length;

			// TODO: speed up
			for (let i = 0; i < num_sites; i++) {
				// TODO match from the beginning of the string to avoid false matches (somewhere in the querystring for instance)
				if (!sites[i].includes('*') && replacedUrl === sites[i]) {
					return sites[i];
				}
				if (this.matchesWildcard(replacedUrl, sites[i])) {
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

		const allowedOnce = c2pDb.allowedOnce(tab_id, app_id);
		// The app_id has been globally blocked
		if (Object.prototype.hasOwnProperty.call(conf.selected_app_ids, app_id)) {
			// The app_id is on the site-specific allow list for this tab_host
			if (conf.toggle_individual_trackers && Object.prototype.hasOwnProperty.call(conf.site_specific_unblocks, tab_host) && conf.site_specific_unblocks[tab_host].includes(+app_id)) {
				// Site blacklist overrides all block settings except C2P allow once
				if (this.blacklisted(tab_url)) {
					return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_BLACKLISTED };
				}
				return { block: false, reason: BLOCK_REASON_SS_UNBLOCKED };
			}
			// Check for site white-listing
			if (this.checkSiteWhitelist(tab_url)) {
				return { block: false, reason: BLOCK_REASON_WHITELISTED };
			}
			// The app_id is globally blocked
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_GLOBAL_BLOCKED };
		}

		// The app_id has not been globally blocked
		// Check to see if the app_id is on the site-specific block list for this tab_host
		if (conf.toggle_individual_trackers && Object.prototype.hasOwnProperty.call(conf.site_specific_blocks, tab_host) && conf.site_specific_blocks[tab_host].includes(+app_id)) {
			// Site white-listing overrides blocking settings
			if (this.checkSiteWhitelist(tab_url)) {
				return { block: false, reason: BLOCK_REASON_WHITELISTED };
			}
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_SS_BLOCKED };
		}
		// Check to see if the app_id is on the site-specific allow list for this tab_host
		if (conf.toggle_individual_trackers && Object.prototype.hasOwnProperty.call(conf.site_specific_unblocks, tab_host) && conf.site_specific_unblocks[tab_host].includes(+app_id)) {
			// Site blacklist overrides all block settings except C2P allow once
			if (this.blacklisted(tab_url)) {
				return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_BLACKLISTED };
			}
			return { block: false, reason: BLOCK_REASON_SS_UNBLOCKED };
		}
		// Check for site black-listing
		if (this.blacklisted(tab_url)) {
			return { block: !allowedOnce, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_BLACKLISTED };
		}
		// The app_id is globally unblocked
		return { block: false, reason: allowedOnce ? BLOCK_REASON_C2P_ALLOWED_ONCE : BLOCK_REASON_GLOBAL_UNBLOCKED };
	}

	/**
	 * Check given url against pattern which might be a wildcard
	 * @param  {string} url		site url
	 * @param  {string} pattern	regex pattern
	 * @return {boolean}
	 */
	matchesWildcard(url, pattern) {
		if (pattern && pattern.includes('*')) {
			const wildcardPattern = pattern.replace(/\*/g, '.*');
			try {
				const wildcardRegex = new RegExp(wildcardPattern);
				if (wildcardRegex.test(url)) { return true; }
			} catch (err) {
				return false;
			}
		}
		return false;
	}
}

export default Policy;
