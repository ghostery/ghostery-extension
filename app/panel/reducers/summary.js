/**
 * Summary Reducer
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

/* eslint no-use-before-define: 0 */

import {
	UPDATE_SUMMARY_DATA,
	UPDATE_CLIQZ_MODULE_DATA,
	UPDATE_ANTI_TRACKING_NUM_SHOWN,
	UPDATE_GHOSTERY_PAUSED,
	UPDATE_SITE_POLICY,
	UPDATE_TRACKER_COUNTS
} from '../constants/constants';
import { addToArray, removeFromArray } from '../utils/utils';
import { sendMessage } from '../utils/msg';

const initialState = {
	alertCounts: {
		total: 0,
	},
	pageHost: '',
	pageUrl: '',
	paused_blocking: false,
	siteNotScanned: false,
	trackerCounts: {
		allowed: 0,
		blocked: 0,
	},
	tab_id: 0,
	antiTracking: {
		totalUnsafeCount: 0,
		totalUnknownCount: 0,
	}
};
/**
 * Default export for summary view reducer.
 * @memberOf  PanelReactReducers
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_SUMMARY_DATA: {
			return Object.assign({}, state, action.data);
		}
		case UPDATE_CLIQZ_MODULE_DATA: {
			return Object.assign({}, state, { adBlock: action.data.adblock, antiTracking: action.data.antiTracking });
		}
		case UPDATE_ANTI_TRACKING_NUM_SHOWN: {
			return Object.assign({}, state, { antiTracking: action.data });
		}
		case UPDATE_GHOSTERY_PAUSED: {
			return Object.assign({}, state, { paused_blocking: action.data.ghosteryPaused, paused_blocking_timeout: action.data.time });
		}
		case UPDATE_SITE_POLICY: {
			const updated = _updateSitePolicy(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_TRACKER_COUNTS: {
			return Object.assign({}, state, {
				trackerCounts: {
					blocked: action.data.num_blocked,
					allowed: action.data.num_total - action.data.num_blocked,
					ssBlocked: action.data.num_ss_blocked,
					ssAllowed: action.data.num_ss_allowed,
					sbBlocked: action.data.num_sb_blocked,
					sbAllowed: action.data.num_sb_allowed,
				},
			});
		}
		default: return state;
	}
};

/**
 * Update site blacklist / whitelist
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action with data
 * @return {Object}        		updated parameters of white- and blacklists
 */
const _updateSitePolicy = (state, action) => {
	const {
		sitePolicy, site_blacklist, site_whitelist, pageUrl, pageHost
	} = state;
	const msg = action.data;
	let host;
	if (msg.pageHost) {
		host = msg.pageHost.replace(/^www\./, '');
	} else if (pageUrl.search(/chrome-extension|moz-extension|ms-browser-extension/) >= 0) {
		// Handles extension pages. Adds the extension ID to the white/black list
		const pageUrlTokens = pageUrl.split('/');
		host = pageUrlTokens.length > 2 ? pageUrlTokens[2] : pageHost.replace(/^www\./, '');
	} else {
		host = pageHost.replace(/^www\./, '');
	}
	let updated_site_policy;
	let updated_blacklist = site_blacklist.slice(0);
	let updated_whitelist = site_whitelist.slice(0);

	if (msg.type === 'whitelist') {
		updated_site_policy = (sitePolicy === 1 || !sitePolicy) ? 2 : false;
		if (site_blacklist.includes(host)) {
			// remove from backlist if site is whitelisted
			updated_blacklist = removeFromArray(site_blacklist, site_blacklist.indexOf(host));
		}
		if (!site_whitelist.includes(host)) {
			// add to whitelist
			updated_whitelist = addToArray(site_whitelist, host);
		} else {
			// remove from whitelist
			updated_whitelist = removeFromArray(site_whitelist, site_whitelist.indexOf(host));
		}
	} else {
		updated_site_policy = (sitePolicy === 2 || !sitePolicy) ? 1 : false;
		if (site_whitelist.includes(host)) {
			// remove from whitelisted if site is blacklisted
			updated_whitelist = removeFromArray(site_whitelist, site_whitelist.indexOf(host));
		}
		if (!site_blacklist.includes(host)) {
			// add to blacklist
			updated_blacklist = addToArray(site_blacklist, host);
		} else {
			// remove from blacklist
			updated_blacklist = removeFromArray(site_blacklist, site_blacklist.indexOf(host));
		}
	}

	// persist to background - note that sitePolicy is not included
	// console.log("HEY WOA -> we'll need to do this for anti-trakcing whitelisting, too")
	sendMessage('setPanelData', {
		site_whitelist: updated_whitelist,
		site_blacklist: updated_blacklist,
	});

	return {
		sitePolicy: updated_site_policy,
		site_whitelist: updated_whitelist,
		site_blacklist: updated_blacklist,
	};
};
