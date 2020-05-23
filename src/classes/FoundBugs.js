/**
 * FoundBugs Class
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

import bugDb from './BugDb';
import compDb from './CompatibilityDb';
import tabInfo from './TabInfo';

const LATENCY_ISSUE_THRESHOLD = 1000;

/**
 * Class for handling detected trackers.
 * @memberOf  BackgroundClasses
 */
class FoundBugs {
	/**
	 * this._foundBugs = {
	 *		tab_id: {
	 *			bug_id: {
	 *				blocked: boolean,
	 *				hasInsecureIssue: boolean,
	 *				hasLatencyIssue: boolean,
	 *				sources: [{
	 *					src: string,
	 *					blocked: boolean,
	 *					type: string
	 *				}]
	 *			}
	 *		}
	 * }
	 * this._foundApps = {
	 *		tab_id: {
	 *			apps: [{
	 *				blocked: boolean,
	 *				cat: string,
	 *				hasCompatibilityIssue: boolean,
	 *				hasInsecureIssue: boolean,
	 *				hasLatencyIssue: boolean,
	 *				id: number,
	 *				name: string,
	 *				sources: [{
	 *					src: string,
	 *					blocked: boolean,
	 *					type: string
	 *				}]
	 *			}],
	 *			appsMetadata: {
	 *				appId: {
	 *					needsCompatibilityCheck: boolean, // so we don't have to invoke fuzzyUrlMatcher more than once per app per tab
	 *					sortingName: string, // so we don't have to lowerCase each app name each time we want to sort the apps array in getApps
	 *				}
	 *			},
	 *			appsById: {
	 *				appId: number // the index position of the appID in _foundApps[tab_id][apps] and _foundApps[tab_id][appsMetadata]
	 *			},
	 *			issueCounts : {
	 *				compatibility: number,
	 *				insecure: number,
	 *				latency: number,
	 *				blocked: number
	 *			}
	 *		}
	 * }
	 */
	constructor() {
		this._foundBugs = {};
		this._foundApps = {};
	}

	/**
	 * Update this._foundBugs and this._foundApps properties with bug data for a tab_id
	 *
	 * Note: When called with just the tab_id parameter
	 * (from tabs.onReplaced and webNavigation.onNavigation), this method
	 * is used only to initialize this._foundBugs and this._foundApps for the tab_id
	 *
	 * @param  {number} 	tab_id		tab id
	 * @param  {number} 	bug_id 		bug id
	 * @param  {string} 	src			resource url
	 * @param  {boolean} 	blocked 	blocking status of the tracker id from this tab_id
	 * @param  {string} 	type 		request resource type
	 */
	update(tab_id, bug_id, src, blocked, type) {
		if (!this._init(tab_id)) {
			return;
		}

		if (!bug_id) {
			return;
		}

		this._updateFoundBugs(tab_id, bug_id, src, blocked, type);
		this._updateFoundApps(tab_id, bug_id);
	}

	/**
	 * Get the bugs for a tab_id.
	 * @param  {number} tab_id
	 * @return {Object}
	 */
	getBugs(tab_id) {
		if (!this._init(tab_id)) {
			return {};
		}

		return this._foundBugs[tab_id];
	}

	/**
	 * If app_id is omitted, return all the trackers we have found on this tab_id
	 * If app_id is provided, return this tracker if we have found it on this tab_id, or the empty array
	 *
	 * @param  {number}		tab_id		tab id
	 * @param  {boolean}	sorted		do we want the output tracker objects array to be sorted by tracker name?
	 * @param  {string}		tab_url		tab url
	 * @param  {number}		app_id		tracker id, if we are looking for a specific one
	 * @return {array}					array of tracker object(s)
	 */
	getApps(tab_id, sorted, tab_url, app_id) {
		if (!this._init(tab_id)) {
			return [];
		}

		if (tab_url) {
			this._checkForCompatibilityIssues(tab_id, tab_url);
		}

		const { apps, appsMetadata } = this._foundApps[tab_id];
		const apps_arr = [];

		if (app_id) {
			const { appsById } = this._foundApps[tab_id];
			if (appsById.hasOwnProperty(app_id)) {
				apps_arr.push(apps[appsById[app_id]]);
			}
		} else {
			apps_arr.push(...apps);
			if (sorted) {
				apps_arr.sort((a, b) => {
					const aName = appsMetadata[a.id].sortingName;
					const bName = appsMetadata[b.id].sortingName;
					return (aName > bName ? 1 : (aName < bName ? -1 : 0));
				});
			}
		}

		return apps_arr;
	}

	/**
	 * Returns an object where the keys are the ids of the apps found on this tab
	 * and the values are their indexes in the array returned by this.getApps
	 *
	 * @param  {number}		tab_id		tab id
	 * @return {Object}					object of appId:index mappings
	 */
	getAppsById(tab_id) {
		if (!this._init(tab_id)) {
			return [];
		}

		const { appsById } = this._foundApps[tab_id];

		return appsById;
	}

	/**
	 * Get the categories from BugsDb that match bugs found
	 * on a tab_id.
	 *
	 * @param  {number}  	tab_id		tab id
	 * @param  {boolean}	sorted  	do we want the output category objects array to be sorted by category name?
	 * @return {array}					array of categories
	 */
	getCategories(tab_id, sorted) {
		if (!this._init(tab_id)) {
			return [];
		}

		const cats_arr = [];
		const cats_obj = {};
		const bugs = this.getBugs(tab_id);
		const { db } = bugDb;

		let id;
		let aid;
		let cid; // category id

		if (!bugs) {
			return bugs;
		}

		// squish all the bugs into categories first
		const ids = Object.keys(bugs);
		for (let i = 0; i < ids.length; i++) {
			id = ids[i];
			if (bugs.hasOwnProperty(id)) {
				aid = db.bugs[id].aid; // eslint-disable-line prefer-destructuring
				cid = db.apps[aid].cat;

				if (cats_obj.hasOwnProperty(cid)) {
					if (!cats_obj[cid].appIds.includes(aid)) {
						cats_obj[cid].appIds.push(aid);
						cats_obj[cid].trackers.push({
							id: aid,
							name: db.apps[aid].name,
							blocked: bugs[id].blocked
						});
						if (bugs[id].blocked) {
							cats_obj[cid].blocked++;
						} else {
							cats_obj[cid].allowed++;
						}
						cats_obj[cid].total++;
					}
				} else {
					cats_obj[cid] = {
						id: cid,
						name: cid,
						appIds: [aid],
						trackers: [{
							id: aid,
							name: db.apps[aid].name,
							blocked: bugs[id].blocked
						}],
						blocked: (bugs[id].blocked ? 1 : 0),
						allowed: (bugs[id].blocked ? 0 : 1),
						total: 1
					};
				}
			}
		}

		// convert categories hash to array
		const cids = Object.keys(cats_obj);
		for (let i = 0; i < cids.length; i++) {
			cid = cids[i];
			if (cats_obj.hasOwnProperty(cid)) {
				cats_arr.push(cats_obj[cid]);
			}
		}

		if (sorted) {
			cats_arr.sort((a, b) => {
				const a1 = a.name.toLowerCase();
				const b1 = b.name.toLowerCase();
				return (a1 > b1 ? 1 : (a1 < b1 ? -1 : 0));
			});
		}

		return cats_arr;
	}

	/**
	 * Get the total number of trackers on a tab_id.
	 * @param  {number} tab_id		tab id
	 * @return {number}				count of trackers
	 */
	getAppsCount(tab_id) {
		if (!this._init(tab_id)) {
			return 0;
		}

		return this._foundApps[tab_id].apps.length;
	}

	/**
	 * Get the number of issues for all trackers on a
	 * tab_id
	 *
	 * @param  {number} 	tab_id		tab id
	 * @param  {string} 	tab_url		tab url
	 * @return {Object}					counts for different types of issues
	 */
	getAppsCountByIssues(tab_id, tab_url) {
		if (!this._init(tab_id)) {
			return {
				compatibility: 0,
				insecure: 0,
				latency: 0,
				total: 0,
				all: 0
			};
		}

		if (tab_url) { this._checkForCompatibilityIssues(tab_id, tab_url); }

		const { compatibility, insecure, latency } = this._foundApps[tab_id].issueCounts;
		const total = compatibility + insecure + latency;
		const all = this._foundApps[tab_id].apps.length;

		return {
			compatibility,
			insecure,
			latency,
			total,
			all
		};
	}

	/**
	 * Get the numbers of blocked / allowed trackers on a tab_id.
	 *
	 * @param  {number} tab_id 	tab id
	 * @return {Object}        	counts for blocked and allowed trackers
	 */
	getAppsCountByBlocked(tab_id) {
		if (!this._init(tab_id)) {
			return {
				blocked: 0,
				allowed: 0
			};
		}

		const { blocked } = this._foundApps[tab_id].issueCounts;
		const allowed = this._foundApps[tab_id].apps.length - blocked;

		return {
			blocked,
			allowed
		};
	}

	/**
	 * Update the hasLatencyIssue property for a bug
	 * on a tab
	 *
	 * @param  {number} tab_id		tab id
	 * @param  {number} bug_id		bug id
	 * @param  {number} latency 	bug latency
	 * @return {number} 			tracker id of a slow bug or 0
	 */
	checkLatencyIssue(tab_id, bug_id, latency) {
		if (!this._init(tab_id)) {
			return 0;
		}

		if (!latency) {
			return 0;
		}

		if (latency < LATENCY_ISSUE_THRESHOLD) {
			return 0;
		}

		if (!this._foundBugs[tab_id][bug_id]) {
			return 0;
		}

		if (this._foundBugs[tab_id][bug_id].hasLatencyIssue) {
			return 0;
		}

		this._foundBugs[tab_id][bug_id].hasLatencyIssue = true;
		const { aid } = bugDb.db.bugs[bug_id];

		const { apps, appsById, issueCounts } = this._foundApps[tab_id];
		if (appsById.hasOwnProperty(aid)) {
			const app = apps[appsById[aid]];
			if (!app.hasLatencyIssue) {
				issueCounts.latency++;
			}
			app.hasLatencyIssue = true;
		}

		return aid;
	}

	/**
	 * Clear this._foundBugs and this._foundApps for a tab_id
	 * @param  {number} tab_id		tab id
	 */
	clear(tab_id) {
		delete this._foundBugs[tab_id];
		delete this._foundApps[tab_id];
	}

	/**
	 * Initialize data structures for _foundBugs[tab_id] and _foundApps[tab_id]
	 * @private
	 * @param  {number} tab_id
	 * @return {boolean}
	 */
	_init(tab_id) {
		if (!tab_id) {
			return false;
		}

		if (!this._foundBugs.hasOwnProperty(tab_id)) {
			this._foundBugs[tab_id] = {};
		}

		if (!this._foundApps.hasOwnProperty(tab_id)) {
			this._foundApps[tab_id] = {
				apps: [],
				appsMetadata: {},
				appsById: {},
				issueCounts: {
					compatibility: 0,
					insecure: 0,
					latency: 0,
					blocked: 0
				}
			};
		}

		return true;
	}

	/**
	 * Check to see if the app is on the Compatibility list
	 * @private
	 * @param  {number} tab_id
	 * @param  {string} tab_url
	 */
	_checkForCompatibilityIssues(tab_id, tab_url) {
		const { apps, appsMetadata, issueCounts } = this._foundApps[tab_id];
		apps.forEach((appEntry) => {
			const { id } = appEntry;
			if (appsMetadata[id].needsCompatibilityCheck) {
				appEntry.hasCompatibilityIssue = appEntry.blocked ? compDb.hasIssue(id, tab_url) : false;
				if (appEntry.hasCompatibilityIssue) { issueCounts.compatibility++; }
				appsMetadata[id].needsCompatibilityCheck = false;
			}
		});
	}

	/**
	 * Update _foundBugs[tab_id][bug_id] with the latest bug source data
	 * @private
	 * @param  {number} 	tab_id
	 * @param  {number} 	bug_id
	 * @param  {string} 	src     source urls for the bug
	 * @param  {boolean} 	blocked
	 * @param  {string} 	type
	 */
	_updateFoundBugs(tab_id, bug_id, src, blocked, type) {
		if (!this._foundBugs[tab_id].hasOwnProperty(bug_id)) {
			this._foundBugs[tab_id][bug_id] = {
				sources: [],
				hasLatencyIssue: false,
				hasInsecureIssue: false,
				blocked: true
			};
		}

		const bug = this._foundBugs[tab_id][bug_id];
		bug.sources.push({
			src,
			blocked,
			type: type.toLowerCase()
		});

		// Check for insecure tag loading in secure page
		if (!bug.hasInsecureIssue && !src.startsWith('https')) {
			const tab = tabInfo.getTabInfo(tab_id);
			bug.hasInsecureIssue = (tab.protocol === 'https');
		}

		// once unblocked, unblocked henceforth
		bug.blocked = bug.blocked && blocked;
	}

	/**
	 * Update _foundApps[tab_id][bug_id] with the latest bug information
	 * @private
	 * @param  {number} tab_id
	 * @param  {number} bug_id
	 */
	_updateFoundApps(tab_id, bug_id) {
		const { db } = bugDb;
		const { aid } = db.bugs[bug_id];
		const {
			hasLatencyIssue, hasInsecureIssue, blocked, sources
		} = this._foundBugs[tab_id][bug_id];
		const {
			apps, appsMetadata, appsById, issueCounts
		} = this._foundApps[tab_id];

		if (appsById.hasOwnProperty(aid)) {
			const app = apps[appsById[aid]];

			if (!app.hasLatencyIssue && hasLatencyIssue) { issueCounts.latency++; }
			if (!app.hasInsecureIssue && hasInsecureIssue) { issueCounts.insecure++; }
			if (app.blocked && !blocked) { issueCounts.blocked--; }

			app.sources = sources;
			app.hasLatencyIssue = app.hasLatencyIssue || hasLatencyIssue;
			app.hasInsecureIssue = app.hasInsecureIssue || hasInsecureIssue;
			app.blocked = app.blocked && blocked;

			appsMetadata[aid].needsCompatibilityCheck =
				appsMetadata[aid].needsCompatibilityCheck && app.blocked;
		} else {
			const { name, cat } = db.apps[aid];

			const apps_len = apps.push({
				id: aid,
				name,
				cat,
				blocked,
				sources,
				hasCompatibilityIssue: false,
				hasLatencyIssue,
				hasInsecureIssue
			});

			if (hasLatencyIssue) { issueCounts.latency++; }
			if (hasInsecureIssue) { issueCounts.insecure++; }
			if (blocked) { issueCounts.blocked++; }

			appsMetadata[aid] = {
				needsCompatibilityCheck: blocked,
				sortingName: name.toLowerCase()
			};

			appsById[aid] = apps_len - 1;
		}
	}
}

// return the class as a singleton
export default new FoundBugs();
