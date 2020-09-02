/**
 * Summary Action creators
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { sendMessage } from '../../panel/utils/msg';
import { addToArray, removeFromArray } from '../../panel/utils/utils';

function getPageHostFromSummary(summary) {
	return summary.pageHost.toLowerCase().replace(/^(http[s]?:\/\/)?(www\.)?/, '');
}

export function updateSitePolicy({ actionData, state }) {
	const { type, pageHost } = actionData;
	const { summary } = state;
	const { site_blacklist, site_whitelist } = summary;

	const host = pageHost.replace(/^www\./, '');

	let updated_blacklist = site_blacklist.slice(0);
	let updated_whitelist = site_whitelist.slice(0);

	if (type === 'whitelist') {
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

	// Send Message to Background
	sendMessage('setPanelData', {
		site_whitelist: updated_whitelist,
		site_blacklist: updated_blacklist,
	});

	// Update State for PanelAndroid UI
	return {
		summary: {
			site_whitelist: updated_whitelist,
			site_blacklist: updated_blacklist,
		},
	};
}

export function handleTrustButtonClick({ state }) {
	const { summary } = state;
	// This pageHost has to be cleaned.
	const pageHost = getPageHostFromSummary(summary);

	const siteBlacklist = summary.site_blacklist || [];
	const siteWhitelist = summary.site_whitelist || [];

	const currentState = siteWhitelist.indexOf(pageHost) !== -1;

	let updatedBlacklist = siteBlacklist.slice(0);
	let updatedWhitelist = siteWhitelist.slice(0);

	if (currentState) {
		updatedWhitelist = removeFromArray(siteWhitelist, siteWhitelist.indexOf(pageHost));
	} else {
		if (siteBlacklist.includes(pageHost)) {
			// remove from blacklist if site is trusted
			updatedBlacklist = removeFromArray(siteBlacklist, siteBlacklist.indexOf(pageHost));
		}
		if (!siteWhitelist.includes(pageHost)) {
			// add to whitelist
			updatedWhitelist = addToArray(siteWhitelist, pageHost);
		}
	}

	sendMessage('setPanelData', {
		site_whitelist: updatedWhitelist,
		site_blacklist: updatedBlacklist,
		paused_blocking: false,
	});

	return {
		summary: {
			site_whitelist: updatedWhitelist,
			site_blacklist: updatedBlacklist,
			paused_blocking: false,
			sitePolicy: !currentState ? 2 : false,
		}
	};
}

export function handleRestrictButtonClick({ state }) {
	const { summary } = state;
	const pageHost = getPageHostFromSummary(summary);

	const siteBlacklist = summary.site_blacklist || [];
	const siteWhitelist = summary.site_whitelist || [];

	const currentState = siteBlacklist.indexOf(pageHost) !== -1;

	let updatedBlacklist = siteBlacklist.slice(0);
	let updatedWhitelist = siteWhitelist.slice(0);

	if (currentState) {
		updatedBlacklist = removeFromArray(siteBlacklist, siteBlacklist.indexOf(pageHost));
	} else {
		if (siteWhitelist.includes(pageHost)) {
			// remove from whitelist if site is restricted
			updatedWhitelist = removeFromArray(siteWhitelist, siteWhitelist.indexOf(pageHost));
		}
		if (!siteBlacklist.includes(pageHost)) {
			// add to blacklist
			updatedBlacklist = addToArray(siteBlacklist, pageHost);
		}
	}

	sendMessage('setPanelData', {
		site_whitelist: updatedWhitelist,
		site_blacklist: updatedBlacklist,
		paused_blocking: false,
	});

	return {
		summary: {
			site_whitelist: updatedWhitelist,
			site_blacklist: updatedBlacklist,
			paused_blocking: false,
			sitePolicy: !currentState ? 1 : false,
		}
	};
}

export function handlePauseButtonClick({ actionData }) {
	const { paused_blocking, time } = actionData;

	sendMessage('setPanelData', {
		paused_blocking: time || paused_blocking,
	});

	return {
		summary: {
			paused_blocking,
			paused_blocking_timeout: time,
		},
	};
}

export function cliqzFeatureToggle({ actionData }) {
	const { currentState, type } = actionData;
	const key = type;

	sendMessage('setPanelData', {
		[key]: !currentState,
	});

	return {
		panel: {
			[key]: !currentState,
		}
	};
}

export function resetTrustRestrictPause(state) {
	const { summary } = state;
	const pageHost = getPageHostFromSummary(summary);

	const siteWhitelist = summary.site_whitelist || [];
	const siteBlacklist = summary.site_blacklist || [];

	const isTrusted = siteWhitelist.indexOf(pageHost) !== -1;
	const isRestricted = siteBlacklist.indexOf(pageHost) !== -1;
	const isPaused = summary.paused_blocking;

	if (isPaused) {
		return handlePauseButtonClick({ state });
	}

	if (isTrusted) {
		return handleTrustButtonClick({ state });
	}
	if (isRestricted) {
		return handleRestrictButtonClick({ state });
	}

	return {};
}
