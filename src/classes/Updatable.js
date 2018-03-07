/**
 * Updatable Superclass
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

import _ from 'underscore';
import globals from './Globals';
import conf from './Conf';
import { getJson, fetchLocalJSONResource } from '../utils/utils';
import { log } from '../utils/common';

const { CDN_SUB_DOMAIN } = globals;
/**
 * Base class for BugDb, Click2PlayDb, CompatibilityDb and SurrogateDb.
 * It provides update functionality, which all of these subclasses
 * need. Hence - the name.
 * @memberOf  BackgroundClasses
 */
class Updatable {
	constructor(type) {
		this.type = type;
		this.db = {};
		this.just_upgraded = false;
	}

	/**
	 * Initializer for all subclasses. Note that this call expects
	 * processList to be implemented by a subclass.
	 * @param  {boolean} just_upgraded 	was the extension just upgraded?
	 * @return {Promise} 				database object, reformatted by `processList` call.
	 */
	init(just_upgraded) {
		this.just_upgraded = just_upgraded;
		return this._localFetcher().then(result => this.processList(result.fromMemory, result.data, true)).catch((error) => {
			log('Updatable init() error', error);
		});
	}

	/**
	 * Update method. Triggers _loadList()
	 * @param  {string} version  	latest db version nunmber from remote
	 * @param  {function} callback 	right now only used by BugDB
	 */
	update(version, callback) {
		const opts = {
			remote: true,
			version,
			callback
		};

		if (_.isFunction(version)) {
			opts.callback = version;
			delete opts.version;
		}

		this._loadList(opts);
	}

	/**
	 * Fetches DB json from disk.
	 *
	 * @private
	 *
	 * @return {Promise} 	json data
	 */
	_localFetcher() {
		return new Promise((resolve, reject) => {
			const memory = conf[this.type];
			const version_property = (this.type === 'bugs' || this.type === 'surrogates' ? 'version' : (`${this.type}Version`));

			// nothing in storage, or it's so old it doesn't have a version
			if (!memory || !memory.hasOwnProperty(version_property)) {
				// return what's on disk
				log(`fetching ${this.type} from disk`);

				fetchLocalJSONResource(`databases/${this.type}.json`).then((data) => {
					log(`got data for ${this.type} from disk`, data);
					resolve({
						fromMemory: false,
						data
					});
				}).catch((error) => {
					log(`Error fetching databases/${this.type}.json`, error);
					reject(error);
				});
			} else if (this.just_upgraded) {
				// on upgrades, see if json shipped w/ the extension is more recent
				fetchLocalJSONResource(`databases/${this.type}.json`).then((disk) => {
					if (disk[version_property] > memory[version_property]) {
						log(`fetching updated${this.type} from disk`);
						resolve({
							fromMemory: false,
							data: disk
						});
					} else {
						resolve({
							fromMemory: true,
							data: memory
						});
					}
				}).catch((error) => {
					log(`Error fetching updated databases/${this.type}.json`, error);
					reject(error);
				});
			} else {
				// otherwise return from memory
				log(`fetching ${this.type} from memory`);
				resolve({
					fromMemory: true,
					data: memory
				});
			}
		});
	}

	/**
	 * Fetches DB json from CDN
	 *
	 * @private
	 *
	 * @param {function} 	callback
	 * @return {Promise} 	json data
	 */
	_remoteFetcher(callback) {
		log(`fetching ${this.type} from remote`);
		const UPDATE_URL = `https://${CDN_SUB_DOMAIN}.ghostery.com/update/${
			this.type === 'bugs' ? 'v3/bugs' : this.type}`;

		getJson(UPDATE_URL).then((list) => {
			callback(true, list);
		}).catch((error) => {
			log('Updatable _remoteFetcher() error', error);
			callback(false);
		});
	}

	/**
	 * Checks for whether we should fetch a new list from remote
	 *
	 * @private
	 *
	 * @param  {Object} options 	contains callback function
	 */
	_loadList(options = {}) {
		log('LOCAL VERSION, SERVER VERSION', this.db.version, options.version);

		// is the local version already up-to-date?
		if (this.db.version && options.version && (options.version <= this.db.version)) {
			if (options.callback) {
				options.callback({
					success: true,
					updated: false
				});
			}
			conf[`${this.type}_last_updated`] = (new Date()).getTime();

			return;
		}

		// Fetch new bugs list from remote.  Bind the callback param from _remoteFetcher() to this anonymous function
		this._remoteFetcher(_.bind(function (result, list) {
			// if the fetch worked and we have a list returned
			if (result && list) {
				const data = this.processList(false, list);
				if (data) {
					// note: only when fetching from ghostery.com
					conf[`${this.type}_last_updated`] = (new Date()).getTime();
					if (options.callback) {
						options.callback({ success: true, updated: true });
					}
				} else {
					log('Updatable _loadList() error calling processList()');
					if (options.callback) {
						options.callback({ success: false, updated: false });
					}
				}
			} else if (options.callback) {
				// fetch failed
				options.callback({ success: false, updated: false });
			}
		}, this));
	}
}

export default Updatable;
