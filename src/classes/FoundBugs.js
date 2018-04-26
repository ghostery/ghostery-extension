/**
 * FoundBugs Class
 *
 * this._foundBugs = {
 * 		tab_id: {
 * 			bug_id: {
 * 				blocked: boolean,
 * 				hasInsecureIssue: boolean,
 * 				hasLatencyIssue: boolean,
 * 			 	sources: [{
 * 					src: string,
 * 					blocked: boolean,
 * 					type: string
 * 				}]
 * 			}
 * 		}
 * }
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

/* eslint no-continue: 0 */
/* eslint no-param-reassign: 0 */

import bugDb from './BugDb';
import compDb from './CompatibilityDb';
import globals from './Globals';
import tabInfo from './TabInfo';

const { BROWSER_INFO } = globals;
const LATENCY_ISSUE_THRESHOLD = (BROWSER_INFO.name === 'firefox') ? 2000 : 1000; // Temporary: bump up the latency threshold for Firefox only
/**
 * Class for handling detected trackers.
 * @memberOf  BackgroundClasses
 */
class FoundBugs {
	constructor() {
		this._foundBugs = {};
	}

	/**
	 * Update this._foundBugs property with bug data for a tab_id
	 *
	 * Note: When called with just the tab_id parameter
	 * (from tabs.onReplaced and webNavigation.onNavigation), this method
	 * is used only to initialize this._foundBugs for the tab_id
	 *
	 * @param  {number} 	tab_id      tab id
	 * @param  {number} 	bug_id      bug id
	 * @param  {string} src			resource url
	 * @param  {boolean} 	blocked 	blocking status of the tracker id from this tab_id
	 * @param  {string} type 		request resource type
	 */
	update(tab_id, bug_id, src, blocked, type) {
		if (!this._foundBugs.hasOwnProperty(tab_id)) {
			this._foundBugs[tab_id] = {};
		}

		if (!bug_id) {
			return;
		}

		if (!this._foundBugs[tab_id].hasOwnProperty(bug_id)) {
			this._foundBugs[tab_id][bug_id] = {
				sources: [],
				hasLatencyIssue: false,
				hasInsecureIssue: false
			};
		}
		this._foundBugs[tab_id][bug_id].sources.push({
			src,
			blocked,
			type: type.toLowerCase()
		});

		// TODO speed this up?
		// Check for insecure tag loading in secure page
		if (!this._foundBugs[tab_id][bug_id].hasInsecureIssue) {
			const tab = tabInfo.getTabInfo(tab_id);
			this._foundBugs[tab_id][bug_id].hasInsecureIssue = (tab.protocol === 'https' && !src.startsWith('https'));
		}

		// once unblocked, unblocked henceforth
		if (this._foundBugs[tab_id][bug_id].blocked !== false) {
			this._foundBugs[tab_id][bug_id].blocked = blocked;
		}
	}

	/**
	 * Get the bugs for a tab_id.
	 * @param  {number} tab_id
	 * @return {Object}
	 */
	getBugs(tab_id) {
		return this._foundBugs.hasOwnProperty(tab_id) && this._foundBugs[tab_id];
	}

	/**
	 * Get the trackers from BugsDb that match bugs found
	 * on a tab_id.
	 *
	 * @param  {number}  		tab_id		tab id
	 * @param  {boolean}	[sorted]  	do we want the output tracker objects array to be sorted by tracker name?
	 * @param  {string} 	[tab_url] 	tab url
	 * @param  {number}		[app_id] 	tracker id
	 * @return {array}  				array of tracker objects
	 */
	getApps(tab_id, sorted, tab_url, app_id) {
		const apps_arr = [];
		const apps_obj = {};
		const bugs = this.getBugs(tab_id);
		const { db } = bugDb;

		let id;
		let aid;
		let latencyIssue = false;
		let insecureIssue = false;

		if (!bugs) {
			return bugs;
		}

		// squish all the bugs into apps first
		for (id in bugs) {
			if (!bugs.hasOwnProperty(id)) {
				continue;
			}

			aid = db.bugs[id].aid; // eslint-disable-line prefer-destructuring
			if (app_id !== undefined && aid !== app_id) {
				continue;
			}
			latencyIssue = bugs[id].hasLatencyIssue;
			insecureIssue = bugs[id].hasInsecureIssue;
			if (apps_obj.hasOwnProperty(aid)) {
				// combine bug sources
				apps_obj[aid].sources = apps_obj[aid].sources.concat(bugs[id].sources);

				if (latencyIssue) {
					apps_obj[aid].hasLatencyIssue = latencyIssue;
				}

				if (insecureIssue) {
					apps_obj[aid].hasInsecureIssue = insecureIssue;
				}

				// once unblocked, unblocked henceforth
				if (apps_obj[aid].blocked !== false) {
					apps_obj[aid].blocked = bugs[id].blocked;
				}
			} else {
				apps_obj[aid] = {
					id: aid,
					name: db.apps[aid].name,
					cat: db.apps[aid].cat,
					blocked: bugs[id].blocked,
					sources: bugs[id].sources,
					hasCompatibilityIssue: (tab_url && bugs[id].blocked ? compDb.hasIssue(aid, tab_url) : false),
					hasLatencyIssue: latencyIssue,
					hasInsecureIssue: insecureIssue
				};
			}
		}

		// convert apps hash to array
		for (id in apps_obj) {
			if (apps_obj.hasOwnProperty(id)) {
				apps_arr.push(apps_obj[id]);
			}
		}

		if (sorted && app_id === undefined) {
			apps_arr.sort((a, b) => {
				a = a.name.toLowerCase();
				b = b.name.toLowerCase();
				return (a > b ? 1 : (a < b ? -1 : 0));
			});
		}

		return apps_arr;
	}

	/**
	 * Get the categories from BugsDb that match bugs found
	 * on a tab_id.
	 *
	 * @param  {number}  	tab_id		tab id
	 * @param  {boolean}	[sorted]  	do we want the output category objects array to be sorted by category name?
	 * @return {array}        		array of categories
	 */
	getCategories(tab_id, sorted) {
		const cats_arr = [];
		const cats_obj = {};
		const bugs = this.getBugs(tab_id);
		const { db } = bugDb;

		let id;
		let aid;
		let cid;

		if (!bugs) {
			return bugs;
		}

		// squish all the bugs into categories first
		for (id in bugs) {
			if (!bugs.hasOwnProperty(id)) {
				continue;
			}
			aid = db.bugs[id].aid; // eslint-disable-line prefer-destructuring
			cid = db.apps[aid].cat;

			if (cats_obj.hasOwnProperty(cid)) {
				if (cats_obj[cid].appIds.includes(aid)) {
					continue;
				}

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

		// convert categories hash to array
		for (cid in cats_obj) {
			if (cats_obj.hasOwnProperty(cid)) {
				cats_arr.push(cats_obj[cid]);
			}
		}

		if (sorted) {
			cats_arr.sort((a, b) => {
				a = a.name.toLowerCase();
				b = b.name.toLowerCase();
				return (a > b ? 1 : (a < b ? -1 : 0));
			});
		}

		return cats_arr;
	}

	/**
	 * Get the total number of trackers on a tab_id.
	 * @param  {number} tab_id		tab id
	 * @return {number}			count of trackers
	 */
	getAppsCount(tab_id) {
		const apps = this.getApps(tab_id);
		if (apps) {
			return apps.length;
		}
		return 0;
	}

	/**
	 * Get the number of issues for all trackers on a
	 * tab_id
	 *
	 * @param  {number} 	tab_id		tab id
	 * @param  {string} tab_url		tab url
	 * @return {Object}				counts for different types of issues
	 */
	getAppsCountByIssues(tab_id, tab_url) {
		const apps = this.getApps(tab_id, false, tab_url);
		let compatibility = 0;
		let insecure = 0;
		let latency = 0;
		let total = 0;
		let all = 0;

		if (apps) {
			apps.forEach((app) => {
				if (app.hasCompatibilityIssue || app.hasInsecureIssue || app.hasLatencyIssue) {
					total++;
				}
				if (app.hasCompatibilityIssue) {
					compatibility++;
				}
				if (app.hasInsecureIssue) {
					insecure++;
				}
				if (app.hasLatencyIssue) {
					latency++;
				}
				all++;
			});
		}

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
		const apps = this.getApps(tab_id);
		let blocked = 0;
		let allowed = 0;

		if (apps) {
			apps.forEach((app) => {
				if (app.blocked) {
					blocked++;
				} else {
					allowed++;
				}
			});
		}

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
	 * @param  {number} latency    bug latency
	 * @return {number} 			tracker id of a slow bug or 0
	 */
	checkLatencyIssue(tab_id, bug_id, latency) {
		if (!latency) {
			return 0;
		}

		if (latency < LATENCY_ISSUE_THRESHOLD) {
			return 0;
		}

		if (!this._foundBugs.hasOwnProperty(tab_id) || !this._foundBugs[tab_id][bug_id]) {
			return 0;
		}

		if (this._foundBugs[tab_id][bug_id].hasLatencyIssue) {
			return 0;
		}

		this._foundBugs[tab_id][bug_id].hasLatencyIssue = true;
		return bugDb.db.bugs[bug_id].aid;
	}

	/**
	 * Clear this._foundBugs for a tab_id
	 * @param  {number} tab_id		tab id
	 */
	clear(tab_id) {
		delete this._foundBugs[tab_id];
	}
}

// return the class as a singleton
export default new FoundBugs();
