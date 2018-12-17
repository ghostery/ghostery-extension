/**
 * BugDb Class
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

/* eslint no-param-reassign: 0 */
/* eslint no-shadow: 0 */

import _ from 'underscore';
import conf from './Conf';
import Updatable from './Updatable';
import { defineLazyProperty, flushChromeMemoryCache } from '../utils/utils';
import { log } from '../utils/common';

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
	updateNewAppIds(new_apps, old_apps) {
		log('updating newAppIds...');

		const new_app_ids = _.difference(
			_.keys(new_apps),
			_.keys(old_apps)
		).map(Number);

		conf.new_app_ids = new_app_ids;

		return new_app_ids;
	}
	/**
	 * Apply block to all new trackers
	 * @param  {Object} new_app_ids list of new trackers
	 */
	applyBlockByDefault(new_app_ids) {
		if (conf.block_by_default) {
			log('applying block-by-default...');
			const { selected_app_ids } = conf;
			_.each(new_app_ids, (app_id) => {
				selected_app_ids[app_id] = 1;
			});
			conf.selected_app_ids = selected_app_ids;
		}
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
			categories: bugs.categories,
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

		// translate categories
		db.categories.forEach((category) => {
			const { name, description } = category;
			category.name = t(name);
			category.description = t(description);
		});

		log('initializing bugdb regexes...');

		for (const id in regexes) {
			if (regexes.hasOwnProperty(id)) {
				db.patterns.regex[id] = new RegExp(regexes[id], 'i');
			}
		}

		log('setting bugdb noneSelected/allSelected...');

		const num_selected = _.size(conf.selected_app_ids);
		db.noneSelected = (num_selected === 0);

		// since allSelected is slow to eval, make it lazy
		defineLazyProperty(db, 'allSelected', () => {
			const num_selected = _.size(conf.selected_app_ids);
			return (!!num_selected && _.every(db.apps, (app, app_id) => conf.selected_app_ids.hasOwnProperty(app_id)));
		});

		log('processed bugdb...');

		if (!fromMemory) {
			const old_bugs = conf.bugs;
			let	new_app_ids;
			// if there is an older bugs object in storage,
			// update newAppIds and apply block-by-default
			if (old_bugs) {
				if (old_bugs.hasOwnProperty('version') && bugs.version > old_bugs.version) {
					new_app_ids = this.updateNewAppIds(bugs.apps, old_bugs.apps);

					if (new_app_ids.length) {
						this.applyBlockByDefault(new_app_ids);
						db.JUST_UPDATED_WITH_NEW_TRACKERS = true;
					}

				// pre-trie/legacy db
				} else if (old_bugs.hasOwnProperty('bugsVersion') && bugs.version !== old_bugs.bugsVersion) {
					const old_apps = _.reduce(old_bugs.bugs, (memo, bug) => {
						memo[bug.aid] = true;
						return memo;
					}, {});

					new_app_ids = this.updateNewAppIds(bugs.apps, old_apps);

					if (new_app_ids.length) {
						this.applyBlockByDefault(new_app_ids);

						// don't claim new trackers when db got downgraded by version
						if (bugs.version > old_bugs.bugsVersion) {
							db.JUST_UPDATED_WITH_NEW_TRACKERS = true;
						}
					}
				}
			}

			conf.bugs = bugs;
		}

		this.db = db;

		if (!skip_cache_flush) {
			flushChromeMemoryCache();
		}

		// return true for _loadList() callback
		return true;
	}
}

// return the class as a singleton
export default new BugDb('bugs');
