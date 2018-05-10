/**
 * A/B Tests Class
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

/**
 * @namespace BackgroundClasses
 */
import _ from 'underscore';
import conf from './Conf';
import globals from './Globals';
import { getJson } from '../utils/utils';
import { log } from '../utils/common';

const { BROWSER_INFO, CMP_SUB_DOMAIN, EXTENSION_VERSION } = globals;

/** Helper class for handling A/B tests.
 * @memberof  BackgroundClasses
 */
class ABTest {
	constructor() {
		this.tests = {};
	}
	/**
	 * Determine if a test with specified name is present.
	 * @param {string} name 	test name
	 */
	hasTest(name) {
		return this.tests.hasOwnProperty(name);
	}
	/**
	 * Send parameters to A/B Test server and receive tests data.
	 * @return {Promise} 		dictionary with all tests to be executed
	 */
	fetch() {
		log('A/B Tests: fetching...');

		const URL = `https://${CMP_SUB_DOMAIN}.ghostery.com/abtestcheck
			?os=${encodeURIComponent(BROWSER_INFO.os)}
			&install_date=${encodeURIComponent(conf.install_date)}
			&ir=${encodeURIComponent(conf.install_random_number)}
			&gv=${encodeURIComponent(EXTENSION_VERSION)}
			&si=${conf.login_info.logged_in ? '1' : '0'}
			&ua=${encodeURIComponent(BROWSER_INFO.name)}
			&v=${encodeURIComponent(conf.cmp_version)}
			&l=${encodeURIComponent(conf.language)}`;

		return getJson(URL).then((data) => {
			if (data && Array.isArray(data)) {
				log('A/B Tests: fetched', JSON.stringify(data));
				// merge all tests into this.tests object
				// this will overwrite all previous tests
				this.tests = data.reduce(
					(tests, test) => Object.assign(tests, { [test.name]: test.data }),
					{}
				);
			} else {
				log('A/B Tests: no tests found.');
			}

			// update conf
			globals.SESSION.abtests = this.tests;
			log('A/B Tests: tests updated to', JSON.stringify(this.tests));
		}).catch((err) => {
			log('A/B Tests: error fetching.');
		});
	}
}

// Return the class as a singleton
export default new ABTest();
