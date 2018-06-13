/**
 * Summary Reducer
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

/* eslint no-use-before-define: 0 */

import {
	GET_SUMMARY_DATA,
	GET_CLIQZ_MODULE_DATA,
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
		case GET_SUMMARY_DATA: {
			return Object.assign({}, state, action.data);
		}
		case GET_CLIQZ_MODULE_DATA: {
			console.log("GET_CLIQZ_MODULE_DATA CALLED", action.data);
			return Object.assign({}, state, { adBlock: action.data.adblock, antiTracking: action.data.antitracking });
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
				},
			});
		}
		default: return state;
	}
};

/**
 * Update blacklist / whitelist
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action with data
 * @return {Object}        		updated parameters of white- and blacklists
 */
const _updateSitePolicy = (state, action) => {
	const { sitePolicy } = state;
	const siteBlacklist = state.site_blacklist;
	const siteWhitelist = state.site_whitelist;
	const msg = action.data;
	const pageHost = (msg.pageHost ? msg.pageHost : state.pageHost).replace(/^www\./, '');

	let updated_site_policy;
	let updated_blacklist = siteBlacklist.slice(0);
	let updated_whitelist = siteWhitelist.slice(0);

	if (msg.type === 'whitelist') {
		updated_site_policy = (sitePolicy === 1 || !sitePolicy) ? 2 : false;
		if (siteBlacklist.includes(pageHost)) {
			// remove from backlist if site is whitelisted
			updated_blacklist = removeFromArray(siteBlacklist, siteBlacklist.indexOf(pageHost));
		}
		if (!siteWhitelist.includes(pageHost)) {
			// add to whitelist
			updated_whitelist = addToArray(siteWhitelist, pageHost);
		} else {
			// remove from whitelist
			updated_whitelist = removeFromArray(siteWhitelist, siteWhitelist.indexOf(pageHost));
		}
	} else {
		updated_site_policy = (sitePolicy === 2 || !sitePolicy) ? 1 : false;
		if (siteWhitelist.includes(pageHost)) {
			// remove from whitelisted if site is blacklisted
			updated_whitelist = removeFromArray(siteWhitelist, siteWhitelist.indexOf(pageHost));
		}
		if (!siteBlacklist.includes(pageHost)) {
			// add to blacklist
			updated_blacklist = addToArray(siteBlacklist, pageHost);
		} else {
			// remove from blacklist
			updated_blacklist = removeFromArray(siteBlacklist, siteBlacklist.indexOf(pageHost));
		}
	}

	// persist to background - note that sitePolicy is not included
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
