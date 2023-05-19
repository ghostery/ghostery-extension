/**
 * Bug Pattern Matcher
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

import { fromWebRequestDetails } from '@cliqz/adblocker-webextension';

import { processUrl, processTrackerUrl } from './utils';
import { log } from './common';
import bugDb from '../classes/BugDb';

// ALL APIS IN THIS FILE ARE PERFORMANCE-CRITICAL
/**
 * Determine if a url matches an entry in an array urls. The matching is
 * permissive. Used for matching FirstPartyException and CompatibilityDB urls.
 * @memberOf BackgroundUtils
 *
 * @param {string} 	url		 	url to match
 * @param {array}	urls	 	array of urls to match against
 *
 * @return {boolean} 			true if match is found, false otherwise
 */
export function fuzzyUrlMatcher(url, urls) {
	const parsed = processUrl(url.toLowerCase());
	let tab_host = parsed.hostname;

	const tab_path = parsed.pathname ? parsed.pathname.substring(1) : '';

	if (tab_host.startsWith('www.')) {
		tab_host = tab_host.slice(4);
	}

	for (let i = 0; i < urls.length; i++) {
		const { host, path } = processTrackerUrl(urls[i]);
		if (host === tab_host) {
			if (!path) {
				log(`[fuzzyUrlMatcher] host (${host}) strict match`);
				return true;
			}

			if (path.slice(-1) === '*') {
				if (tab_path.startsWith(path.slice(0, -1))) {
					log(`[fuzzyUrlMatcher] host (${host}) and path (${path}) fuzzy match`);
					return true;
				}
			} else if (path === tab_path) {
				log(`[fuzzyUrlMatcher] host (${host}) and path (${path}) strict match`);
				return true;
			}
		} else if (host.substr(0, 2) === '*.') {
			if (tab_host.endsWith(host.slice(2))) {
				if (!path) {
					log(`[fuzzyUrlMatcher] host (${host}) fuzzy match`);
					return true;
				}

				if (path.slice(-1) === '*') {
					if (tab_path.startsWith(path.slice(0, -1))) {
						log(`[fuzzyUrlMatcher] host (${host}) and path (${path}) both fuzzy match`);
						return true;
					}
				} else if (path === tab_path) {
					log(`[fuzzyUrlMatcher] host (${host}) fuzzy match and path (${path}) strict match`);
					return true;
				}
			}
		}
	}
	return false;
}

export function isBug(details) {
	const { engine } = bugDb;

	const request = fromWebRequestDetails(details);

	const matches = engine.getPatternMetadata(request, {
		getDomainMetadata: true,
	});

	if (matches.length === 0) {
		return false;
	}

	return String(matches[0].pattern.ghostery_id);
}
