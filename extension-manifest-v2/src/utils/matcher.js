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

/* eslint no-use-before-define: 0 */

import bugDb from '../classes/BugDb';
import conf from '../classes/Conf';
import { processUrl, processFpeUrl } from './utils';
import { log } from './common';

// ALL APIS IN THIS FILE ARE PERFORMANCE-CRITICAL

/**
 * Determine if web request qualifies as a bug.
 * @memberOf BackgroundUtils
 *
 * @param {string} 	src		 	url of the request
 * @param {string}	tab_url	 	url of the page
 *
 * @return {int|boolean} 		bug id or false
 */
export function isBug(src, tab_url) {
	const { db } = bugDb;
	const processedSrc = processUrl(src.toLowerCase());
	let	found = false;

	found =
		// pattern classification 2: check host+path hash
		_matchesHost(db.patterns.host_path, processedSrc.host, processedSrc.path) ||
		// class 1: check host hash
		_matchesHost(db.patterns.host, processedSrc.host) ||
		// class 3: check path hash
		_matchesPath(processedSrc.path) ||
		// class 4: check regex patterns
		_matchesRegex(processedSrc.host_with_path);

	if (typeof tab_url !== 'undefined') {
		// check firstPartyExceptions
		if (conf.ignore_first_party &&
			found !== false &&
			db.firstPartyExceptions[found] &&
			fuzzyUrlMatcher(tab_url, db.firstPartyExceptions[found])) {
			return false;
		}
	}

	return found;
}

/**
 * Determine if a url matches an entry in an array urls.
 * The matching is permissive.
 * @memberOf BackgroundUtils
 *
 * @param {string} 	url		 	url to match
 * @param {array}	urls	 	array of urls to match against
 *
 * @return {boolean} 			true if match is found, false otherwise
 */
export function fuzzyUrlMatcher(url, urls) {
	const parsed = processUrl(url.toLowerCase());
	let tab_host = parsed.host;

	const tab_path = parsed.path;

	if (tab_host.startsWith('www.')) {
		tab_host = tab_host.slice(4);
	}

	for (let i = 0; i < urls.length; i++) {
		const { host, path } = processFpeUrl(urls[i]);

		if (host === tab_host) {
			if (!path) {
				log(`[fuzzyUrlMatcher] host (${host}) match`);
				return true;
			}

			if (path.slice(-1) === '*') {
				if (tab_path.startsWith(path.slice(0, -1))) {
					log(`[fuzzyUrlMatcher] host (${host}) and path (${path}) fuzzy match`);
					return true;
				}
			} else if (path === tab_path) {
				log(`[fuzzyUrlMatcher] host (${host}) and path (${path}) match`);
				return true;
			}
		}
	}
	return false;
}

/**
 * Determine if a path part of an url matches to a path property
 * of a node in an array of json nodes with paths.
 * @private
 *
 * @param {array} 	roots		array of nodes with paths
 * @param {string}	src_path	path part of a url to match
 *
 * @return {int|boolean} 		bug id or false if the match was not found
 */
function _matchesHostPath(roots, src_path) {
	let root;
	let paths;
	let i;
	let j;

	for (i = 0; i < roots.length; i++) {
		root = roots[i];
		if (root.hasOwnProperty('$')) {
			paths = root.$;
			for (j = 0; j < paths.length; j++) {
				if (src_path.startsWith(paths[j].path)) {
					return paths[j].id;
				}
			}
		}
	}

	return false;
}

/**
 * Use host and path parts of a url to traverse database trie node
 * looking for matching parts. Reaching the leaf would yeild bug id.
 * @private
 *
 * @param {Object} 	root		trie node
 * @param {string}	src_host	host part of a url
 * @param {string}	src_path	path part of a url
 *
 * @return {int|boolean} 		bug id or false if the match was not found
 */
function _matchesHost(root, src_host, src_path) {
	const host_rev_arr = src_host.split('.').reverse();
	const nodes_with_paths = [];
	let	host_part;
	let node = root;
	let bug_id = false;

	for (let i = 0; i < host_rev_arr.length; i++) {
		host_part = host_rev_arr[i];
		// if node has domain, advance and try to update bug_id
		if (node.hasOwnProperty(host_part)) {
			// advance node
			node = node[host_part];
			bug_id = (node.hasOwnProperty('$') ? node.$ : bug_id);

			// we store all traversed nodes that contained paths in case the final
			// node does not have the matching path
			if (src_path !== undefined && node.hasOwnProperty('$')) {
				nodes_with_paths.push(node);
			}

		// else return bug_id if it was found
		} else {
			// handle path
			if (src_path !== undefined) {
				return _matchesHostPath(nodes_with_paths, src_path);
			}

			return bug_id;
		}
	}

	// handle path
	if (src_path !== undefined) {
		return _matchesHostPath(nodes_with_paths, src_path);
	}

	return bug_id;
}

// can still produce false positives (when something that
// matches a tracker is in the path somewhere, for example)
/**
 * Match a url against a list of regular expression which are mapped to bug ids.
 * @private
 *
 * @param {string} 	src			a url to find a matching entry for
 *
 * @return {int|boolean} 		bug id or false if the match was not found
 */
function _matchesRegex(src) {
	const regexes = bugDb.db.patterns.regex;

	for (const bug_id in regexes) {
		if (regexes[bug_id].test(src)) {
			return +bug_id;
		}
	}

	return false;
}

/**
 * Match a path part of a url agains the path property of database patterns section.
 * @private
 *
 * @param {string} 	src_path	path part of an url
 *
 * @return {int|boolean} 		bug id or false if the match was not found
 */
function _matchesPath(src_path) {
	const paths = bugDb.db.patterns.path;

	// NOTE: we re-add the "/" in order to match patterns that include "/"
	const srcPath = `/${src_path}`;

	for (const path in paths) {
		if (srcPath.includes(path)) {
			return paths[path];
		}
	}

	return false;
}
