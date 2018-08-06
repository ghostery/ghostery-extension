/**
 * Configuration Proxy
 *
 * This module provides Proxy wrapper for ConfData object to ensure that
 * new value assignment to any of {conf} properties results in saving the
 * change in Storage and also dispatching it to whoever listens
 *
 * It is important to note that Proxy's set trap catches assignments only to the immediate
 * properties. So if we want to change deep properties we should wrap
 * it similar to this example:
 *
 * const selected_app_ids = conf.selected_app_ids;
 * selected_app_ids[message.app_id] = 1;
 * conf.selected_app_ids = selected_app_ids;
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint no-param-reassign: 0 */

import { debounce } from 'underscore';
import confData from './ConfData';
import { pref, log } from '../utils/common';
import dispatcher from './Dispatcher';
import metrics from './Metrics';
import globals from './Globals';

const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const { IS_CLIQZ } = globals;

/**
 * Proxy Handler
 *
 * Contains <b>set</b> trap which define the behavior
 * of the proxy when a property assignment is performed
 * on the proxy target object.
 *
 * @type {Object}
 * @memberOf  BackgroundClasses
 */
const handler = {
	/**
	 * A trap for setting property values
	 * @param {Object} 	target	the target confData object
	 * @param {*} 		value 	the value of the confData property being set
	 * @param {string} 	key		the name of the confData property being set
	 * @return {boolean}        always return true, indicating success.
	 */
	set(target, key, value) {
		log('Setting update value for', key);
		// Ghostery, while running as an extension in the Cliqz browser
		// has these functionalities disabled. This is protection from
		// altering settings by syncing and/or importing.
		if (IS_CLIQZ) {
			if (key === 'enable_human_web' ||
				key === 'enable_offers' ||
				key === 'enable_anti_tracking' ||
				key === 'enable_ad_block') {
				value = false;
			}
		}
		// Edge currently does not support Human Web and Offers
		if (IS_EDGE) {
			if (key === 'enable_human_web' ||
				key === 'enable_offers') {
				value = false;
			}
		}

		// Adjust banner statuses, as they used to be objects
		// while now they are booleans. This filter covers syncing.
		if (key === 'reload_banner_status' ||
			key === 'trackers_banner_status') {
			if (value && (typeof value === 'object')) {
				value = !!value.show;
			}
		}

		target[key] = value;

		// Don't save to storage while background::init() called.
		// Rather collect properties and save them once init is over.
		if (!globals.INIT_COMPLETE) {
			globals.initProps[key] = value;
		} else {
			pref(key, value);
		}

		// notify specific key subscribers
		dispatcher.trigger(`conf.save.${key}`, value);
		// notify catch all settings subscribers
		if (target.SYNC_SET.has(key) || key === 'bugs_last_checked') {
			dispatcher.trigger('conf.changed.settings', key);
		}

		debounce(metrics.setUninstallUrl.bind(metrics), 200)(key);

		return true;
	},
};

// return the proxy as a singleton, with Conf object as the proxy target
export default new Proxy(confData, handler);
