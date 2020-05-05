/**
 * CompatibilityDb Class
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

import conf from './Conf';
import Updatable from './Updatable';
import { fuzzyUrlMatcher } from '../utils/matcher';
import { log } from '../utils/common';
/**
 * Class for handling Compatibility json database which contains
 * a cross-reference of sites and trackers that would break
 * these sites, if blocked.
 *
 * @extends Updatable
 * @memberOf  BackgroundClasses
 */
class CompatibilityDb extends Updatable {
	/**
	 * Process compatability db from fetched json
	 * @param {boolean} fromMemory 	is it from the current conf property?
	 * @param  {Object} comp 		database json data
	 * @return {boolean} 			success/failure
	 */
	processList(fromMemory, comp) {
		let db;

		log('processing comp...');

		try {
			db = CompatibilityDb._buildDb(comp.compatibility, comp.compatibilityVersion);
		} catch (e) {
			log('CompatibilityDb processList() error', e);
			return false;
		}

		if (!db) {
			return false;
		}

		log('processed comp...');

		this.db = db;

		if (!fromMemory) {
			conf.compatibility = comp;
		}

		// return true for _loadList() callback
		return true;
	}

	/**
	 * Determine if specified site can be broken if a particular
	 * tracker is blocked.
	 * @param  {number}  	aid     tracker id
	 * @param  {string} tab_url tab url
	 * @return {Boolean}
	 */
	hasIssue(aid, tab_url) {
		return this.db.list && Object.prototype.hasOwnProperty.call(this.db.list, aid) && fuzzyUrlMatcher(tab_url, this.db.list[aid]);
	}

	/**
	 * Take arrays of trackers and index them by
	 * tracker ids for easy lookup
	 *
	 * @private
	 *
	 * @param   {Object} 	bugs     	Compatibility database json data
	 * @param   {string} 	version 	database version
	 * @return  {Object}         		Refactored database
	 */
	static _buildDb(bugs, version) {
		const map = {};

		bugs.forEach((s) => {
			map[s.aid] = s.urls;
		});

		return {
			list: map,
			version
		};
	}
}

// return the class as a singleton
export default new CompatibilityDb('compatibility');
