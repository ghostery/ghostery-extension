/**
 * BugDb Class
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

import {
	difference, every, keys, size
} from 'underscore';
import conf from './Conf';
import Updatable from './Updatable';
import { defineLazyProperty, flushChromeMemoryCache } from '../utils/utils';
import { log } from '../utils/common';
import globals from './Globals';

/**
 * Class for handling the main Ghostery trackers database
 * which keeps all trackers currently known to Ghostery in
 * a specially structured json format.
 *
 * @extends Updatable
 * @memberOf  BackgroundClasses
 */
class BugDb extends Updatable {
	/**
	 * Select new trackers in the bugs database update.
	 * @param  {Object} new_apps 	trackers in the new database
	 * @param  {Object} old_apps 	trackers in the original database
	 * @return {Object}          	list of all new trackers
	 */
	static updateNewAppIds(new_apps, old_apps) {
		log('updating newAppIds...');

		const new_app_ids = difference(
			keys(new_apps),
			keys(old_apps)
		).map(Number);

		conf.new_app_ids = new_app_ids;

		return new_app_ids;
	}

	/**
	 * Build trackers into category arrays, for use on Global Blocking UI list. This is
	 * called once on initial startup.
	 *
	 * @private
	 *
	 * @param  {Object} db      bugs database object
	 * @return {array}  		array of categories
	 */
	static _buildCategories(db) {
		const selectedApps = conf.selected_app_ids || {};
		let appId;
		let category;
		let blocked;

		const categoryArray = [];
		const categories = {};

		const appIds = Object.keys(db.apps);
		for (let i = 0; i < appIds.length; i++) {
			appId = appIds[i];
			category = db.apps[appId].cat;
			if (t(`category_${category}`) === `category_${category}`) {
				category = 'uncategorized';
			}
			blocked = selectedApps.hasOwnProperty(appId);

			// Because we have two trackers in the DB with the same name
			if ((categories[category] && categories[category].trackers[db.apps[appId].name])) {
				continue; // eslint-disable-line no-continue
			}

			if (categories.hasOwnProperty(category)) {
				categories[category].num_total++;
				if (blocked) {
					categories[category].num_blocked++;
				}
			} else {
				categories[category] = {
					id: category,
					name: t(`category_${category}`),
					description: t(`category_${category}_desc`),
					img_name: (category === 'advertising') ? 'adv' : // Because AdBlock blocks images with 'advertising' in the name.
						(category === 'social_media') ? 'smed' : category, // Because AdBlock blocks images with 'social' in the name.
					num_total: 1,
					num_blocked: (blocked) ? 1 : 0,
					trackers: []
				};
			}
			categories[category].trackers.push({
				id: appId,
				name: db.apps[appId].name,
				description: '',
				blocked,
				shouldShow: true,
				catId: category,
				trackerID: db.apps[appId].trackerID,
			});
		}

		const categoryNames = Object.keys(categories);
		categoryNames.forEach((categoryName) => {
			const cat = categories[categoryName];
			if (cat.trackers) {
				cat.trackers.sort((a, b) => {
					const a1 = a.name.toLowerCase();
					const b1 = b.name.toLowerCase();
					return (a1 > b1 ? 1 : (a1 < b1 ? -1 : 0));
				});
			}

			categoryArray.push(cat);
		});

		// Sort categories by tracker numbers
		categoryArray.sort((a, b) => {
			const a1 = a.trackers ? a.trackers.length : 0;
			const b1 = b.trackers ? b.trackers.length : 0;
			return (a1 > b1 ? -1 : (a1 < b1 ? 1 : 0));
		});

		return categoryArray;
	}

	/**
	 * Process bugs from fetched json.
	 * @param {boolean} fromMemory 			database is from the current conf property
	 * @param  {Object} bugs 				database json data
	 * @param  {boolean} skip_cache_flush 	don't flush chrome memory cache
	 * @return {boolean}					always returns true
	 */
	processList(fromMemory, bugs, skip_cache_flush) {
		// deep cloning bugs all at once is too slow
		const { patterns } = bugs;
		const regexes = patterns.regex;
		const db = {
			apps: bugs.apps,
			bugs: bugs.bugs,
			firstPartyExceptions: bugs.firstPartyExceptions,
			patterns: {
				host: patterns.host,
				host_path: patterns.host_path,
				path: patterns.path,
				// regexes are initialized below
				regex: {}
			},
			version: bugs.version,
			JUST_UPDATED_WITH_NEW_TRACKERS: false
		};

		log('initializing bugdb regexes...');

		const regexesKeys = Object.keys(regexes);
		regexesKeys.forEach((id) => {
			db.patterns.regex[id] = new RegExp(regexes[id], 'i');
		});

		log('setting bugdb noneSelected/allSelected...');

		const num_selected = size(conf.selected_app_ids);
		db.noneSelected = (num_selected === 0);

		// since allSelected is slow to eval, make it lazy
		defineLazyProperty(db, 'allSelected', () => {
			const num_selected_lazy = size(conf.selected_app_ids);
			return (!!num_selected_lazy && every(db.apps, (app, app_id) => conf.selected_app_ids.hasOwnProperty(app_id)));
		});

		log('processed bugdb...');

		if (!fromMemory) {
			// if there is an older bugs object in storage update newAppIds and apply block-by-default
			const old_bugs = conf.bugs;
			if (old_bugs && old_bugs.hasOwnProperty('version') && (old_bugs.version !== bugs.version)) {
				const new_app_ids = BugDb.updateNewAppIds(bugs.apps, old_bugs.apps);
				if (new_app_ids.length > 0) {
					log(`${new_app_ids.length} new trackers have been added`);
					const { selected_app_ids } = conf;
					const newBlockedTrackers = BugDb._scanForNewTrackersToBlock(
						bugs, old_bugs, new_app_ids, selected_app_ids
					);

					if (newBlockedTrackers.length > 0) {
						newBlockedTrackers.forEach((app_id) => {
							selected_app_ids[app_id] = 1;
						});

						// (triggers a persist)
						conf.selected_app_ids = selected_app_ids;
					}
					db.JUST_UPDATED_WITH_NEW_TRACKERS = true;
				}
			}

			conf.bugs = bugs;
		}

		db.categories = BugDb._buildCategories(db);

		this.db = db;

		if (!skip_cache_flush) {
			flushChromeMemoryCache();
		}

		// return true for _loadList() callback
		return true;
	}

	/**
	 * When the extension learns of new trackers, it has to decide whether
	 * to block them. The logic is to look at existing trackers in the same
	 * category: if most of them were blocked, then it makes sense to also
	 * block the new one (majority voting). As a tie-breaker, block it iff
	 * the whole category is blocked by default.
	 *
	 * @private
	 *
	 * @param  {Object} new_apps          trackers in the new database
	 * @param  {Object} old_apps          trackers in the original database
	 * @param  {array}  new_app_ids       all new trackers
	 * @param  {array}  selected_app_ids  all new trackers
	 * @return {array}  new trackers that should be blocked
	 */
	static _scanForNewTrackersToBlock(bugs, old_bugs, new_app_ids, selected_app_ids) {
		const majority = {};
		globals.CATEGORIES_BLOCKED_BY_DEFAULT.forEach((category) => {
			// Bias in favor of blocking if the category will be
			// blocked by default in a new installtion. This is
			// mostly relevant if new categories were introduced.
			majority[category] = 0.5;
		});
		Object.entries(old_bugs.apps).forEach(([app_id, { cat: category }]) => {
			const vote = selected_app_ids[app_id] ? 1 : -1;
			majority[category] = (majority[category] || 0) + vote;
		});

		const newTrackerShouldBeBlocked = (app_id) => {
			const { cat: category } = bugs.apps[app_id];
			return majority[category] && majority[category] > 0;
		};
		return new_app_ids.filter(newTrackerShouldBeBlocked);
	}
}

// return the class as a singleton
export default new BugDb('bugs');
