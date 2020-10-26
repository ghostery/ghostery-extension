/**
 * A/B Tests Class
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

/**
 * @namespace BackgroundClasses
 */
import conf from './Conf';
import globals from './Globals';
import { getJson } from '../utils/utils';
import { log } from '../utils/common';

const { BROWSER_INFO, CMP_BASE_URL, EXTENSION_VERSION } = globals;

/** Helper class for handling A/B tests.
 * @memberof  BackgroundClasses
 */
class ABTest {
	constructor() {
		this.tests = {};
		this.hasBeenFetched = false;
	}

	/**
	 * Determine if a test with specified name is present.
	 * @param {string} name 	test name
	 */
	hasTest(name) {
		return this.tests.hasOwnProperty(name);
	}

	/**
	 * Return the tests object
	 * @return {Object}
	 */
	getTests() {
		return this.tests;
	}

	/**
	 * Send parameters to A/B Test server and receive tests data.
	 * @param	{Number} irDebugOverride		optional. supports hitting AB server with custom ir from debug console
	 * @return {Promise} 						dictionary with all tests to be executed
	 */
	fetch(irDebugOverride) {
		log('A/B Tests: fetching...');

		const URL = ABTest._buildURL(irDebugOverride);

		return getJson(URL).then((data) => {
			if (data && Array.isArray(data)) {
				log('A/B Tests: fetched', JSON.stringify(data));
				this._updateTests(data);
				log('A/B Tests: tests updated to', this.getTests());
			} else {
				log('A/B Tests: no tests found.');
			}
		}).catch(() => {
			log('A/B Tests: error fetching.');
		});
	}

	silentFetch(ir) {
		const URL = ABTest._buildURL(ir);

		return getJson(URL).then((data) => {
			if (data && Array.isArray(data)) {
				this._updateTests(data);
			}
			return 'resolved';
		}).catch(() => 'rejected');
	}

	static _buildURL(ir) {
		return (`${CMP_BASE_URL}/abtestcheck
			?os=${encodeURIComponent(BROWSER_INFO.os)}
			&install_date=${encodeURIComponent(conf.install_date)}
			&ir=${encodeURIComponent((typeof ir === 'number') ? ir : conf.install_random_number)}
			&gv=${encodeURIComponent(EXTENSION_VERSION)}
			&si=${conf.account ? '1' : '0'}
			&ua=${encodeURIComponent(BROWSER_INFO.name)}
			&v=${encodeURIComponent(conf.cmp_version)}
			&l=${encodeURIComponent(conf.language)}`
		);
	}

	_updateTests(data) {
		// merge all tests into this.tests object
		// this will overwrite all previous tests
		this.tests = data.reduce(
			(tests, test) => Object.assign(tests, { [test.name]: test.data }),
			{}
		);
		// update conf
		globals.SESSION.abtests = this.tests;
		// let clients know that if a test is absent it is not because tests have not yet been fetched
		this.hasBeenFetched = true;
	}
}

// Return the class as a singleton
export default new ABTest();
