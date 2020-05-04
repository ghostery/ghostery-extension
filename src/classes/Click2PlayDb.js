/**
 * Click2PlayDb Class
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

import conf from './Conf';
import Updatable from './Updatable';
import { log } from '../utils/common';
/**
 * Class for hadling Click2Play json database of social trackers (Facebook, Tweeter, etc.)
 * Once this kind of tracker is blocked Ghostery displays special icon instead of the
 * original one. Clicking on this icon user may specify to allow blocked action
 * (say, sharing) to be executed once, or unblock the tracker altogether.
 *
 * @extends Updatable
 * @memberOf  BackgroundClasses
 */
class Click2PlayDb extends Updatable {
	constructor(type) {
		super(type);
		this.allowOnceList = {};
	}

	/**
	 * Process click2play db from fetched json
	 * @param  {boolean} fromMemory	is data from current conf property?
	 * @param  {Object} data 		json database data
	 * @return {boolean} 			success/failure
	 */
	processList(fromMemory, data) {
		let db;

		log('processing c2p...');

		try {
			db = this._buildDb(data.click2play, data.click2playVersion);
		} catch (e) {
			log('Click2PlayDb processList() error', e);
			return false;
		}

		if (!db) {
			return false;
		}

		log('processed c2p...');

		this.db = db;
		if (!fromMemory) {
			conf.click2play = data;
		}

		// return true for _loadList() callback
		return true;
	}

	// TODO memory leak when you close tabs before reset() can run?
	reset(tab_id) {
		if (!Object.prototype.hasOwnProperty.call(this.allowOnceList, tab_id)) { return; }

		const entries = Object.entries(this.allowOnceList[tab_id]);
		let keep = false;
		for (const [appID, count] of entries) {
			const newCount = count - 1;
			this.allowOnceList[tab_id][appID] = newCount;
			if (newCount > 0) {
				keep = true;
			}
		}
		if (!keep) {
			delete this.allowOnceList[tab_id];
		}
	}

	allowedOnce(tab_id, aid) {
		return (
			Object.prototype.hasOwnProperty.call(this.allowOnceList, tab_id) &&
			Object.prototype.hasOwnProperty.call(this.allowOnceList[tab_id], aid) &&
			this.allowOnceList[tab_id][aid] > 0
		);
	}

	allowOnce(app_ids, tab_id) {
		this.allowOnceList[tab_id] = {};

		app_ids.forEach((app_id) => {
			this.allowOnceList[tab_id][app_id] = 2;
		});
	}

	/**
	 * Take arrays of database entries and index them by
	 * tracker id for easy lookup.
	 *
	 * @private
	 *
	 * @param   {Object} 	entries 	database tracker entries
	 * @param   {string} 	version 	database version
	 * @return  {Object}         		reconfigured database object
	 */
	_buildDb(entries, version) {
		const apps = {};
		let	allow;

		entries.forEach((entry) => {
			if (!Object.prototype.hasOwnProperty.call(apps, entry.aid)) {
				apps[entry.aid] = [];
			}

			allow = [
				entry.aid
			];
			if (entry.alsoAllow) {
				allow = allow.concat(entry.alsoAllow);
			}

			apps[entry.aid].push({
				aid: entry.aid,
				allow,
				frameColor: (entry.frameBackground ? entry.frameBackground : ''),
				text: (entry.text ? entry.text : ''),
				button: (entry.button ? entry.button : ''),
				attach: (entry.attach ? entry.attach : false),
				ele: (entry.selector ? entry.selector : ''),
				type: (entry.type ? entry.type : '')
			});
		});

		return {
			apps,
			version
		};
	}
}

// return the class as a singleton
export default new Click2PlayDb('click2play');
