/**
 * SurrogateDb Class
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
	any, filter, isArray, map
} from 'underscore';
import conf from './Conf';
import Updatable from './Updatable';
import { log } from '../utils/common';

/**
 * Class for handling Ghostery Surrogates json database which is
 * a cross-reference of sites and trackers that would break
 * these sites, if blocked, because a site expects to get a
 * script back from the tracker request. For each such
 * site-and-tracker match this database provides a script
 * stub (surrogate) as a replacement.
 *
 * @extends Updatable
 * @memberOf  BackgroundClasses
 */
class SurrogateDb extends Updatable {
	constructor(type) {
		super(type);
		this.db = {
			pattern_ids: {},
			app_ids: {},
			site_surrogates: {}
		};
	}

	/**
	 * Overrides parent class method. Prevent calls to
	 * _loadList() and _remoteFetcher() which do not apply
	 * to this instance
	 *
	 * @override
	 *
	 */
	update() {}

	/**
	 * Process surrogates from fetched json
	 * @param {boolean} fromMemory 	is data from the current conf property?
	 * @param  {Object} data        json data
	 */
	processList(fromMemory, data) {
		log('processing surrogates...');

		data.mappings.forEach((souragate) => {
			const s = souragate;
			s.code = data.surrogates[s.sid];

			// convert single values to arrays first
			['pattern_id', 'app_id', 'sites', 'match'].forEach((prop) => {
				if (Object.prototype.hasOwnProperty.call(s, prop) && !isArray(s[prop])) {
					s[prop] = [s[prop]];
				}
			});

			// initialize regexes
			if (Object.prototype.hasOwnProperty.call(s, 'match')) {
				s.match = map(s.match, match => new RegExp(match, ''));
			}

			if (Object.prototype.hasOwnProperty.call(s, 'pattern_id') || Object.prototype.hasOwnProperty.call(s, 'app_id')) {
				// tracker-level surrogate
				if (Object.prototype.hasOwnProperty.call(s, 'pattern_id')) {
					this._buildDb(s, 'pattern_id', 'pattern_ids');
				} else if (Object.prototype.hasOwnProperty.call(s, 'app_id')) {
					this._buildDb(s, 'app_id', 'app_ids');
				}
			} else if (Object.prototype.hasOwnProperty.call(s, 'sites')) {
				// we have a "sites" property, but not pattern_id/app_id:
				// it's a site surrogate
				this._buildDb(s, 'sites', 'site_surrogates');
			}
		});

		log('processed surrogates...');
		if (!fromMemory) {
			conf.surrogates = data;
		}
	}

	/**
	 * Get surrogates for a particular tracker.
	 * @param  {string} script_src	script source
	 * @param  {number} app_id      tracker id
	 * @param  {number}	pattern_id  matching pattern id
	 * @param  {string} host_name   host name
	 * @return {Object}             filtered list of surrogates
	 */
	getForTracker(script_src, app_id, pattern_id, host_name) {
		let candidates = [];

		if (Object.prototype.hasOwnProperty.call(this.db.app_ids, app_id)) {
			candidates = candidates.concat(this.db.app_ids[app_id]);
		}

		if (Object.prototype.hasOwnProperty.call(this.db.pattern_ids, pattern_id)) {
			candidates = candidates.concat(this.db.pattern_ids[pattern_id]);
		}

		return filter(candidates, (surrogate) => {
			// note: does not support *.example.com (exact matches only)
			if (Object.prototype.hasOwnProperty.call(surrogate, 'sites')) { // array of site hosts
				if (!surrogate.sites.includes(host_name)) {
					return false;
				}
			}

			if (Object.prototype.hasOwnProperty.call(surrogate, 'match')) {
				if (!any(surrogate.match, match => script_src.match(match))) {
					return false;
				}
			}

			return true;
		});
	}

	/**
	 * Take arrays of app IDs/pattern IDs/site domains and index them by
	 * their values for easy lookup
	 *
	 * @private
	 *
	 * @param  {Object} surrogate
	 * @param  {string} property
	 * @param  {string} db_name
	 */
	_buildDb(surrogate, property, db_name) {
		surrogate[property].forEach((val) => {
			if (!Object.prototype.hasOwnProperty.call(this.db[db_name], val)) {
				this.db[db_name][val] = [];
			}
			this.db[db_name][val].push(surrogate);
		});
	}
}

// return the class as a singleton
export default new SurrogateDb('surrogates');
