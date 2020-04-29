/**
 * Cliqz Settings Import
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

import KordInjector from '../classes/ExtMessenger';
import { log } from './common';

/**
 * Build Promise timeout
 * @memberOf BackgroundUtils
 * @private
 *
 * @param  {number} timeout
 * @return {Promise}
 */
function _promiseTimeout(timeout) {
	return new Promise((resolve, reject) => {
		setTimeout(reject, timeout);
	});
}

/**
 * Build Cliqz settings from Ghostery Conf
 * @memberOf BackgroundUtils
 * @private
 *
 * @param  {Object} cliqz
 * @param  {Object} c	conf
 * @return {Promise}
 */
function _runCliqzSettingsImport(cliqz, c) {
	const conf = c;
	log('CliqzSettingsImport: Run Cliqz settings importer');
	const inject = new KordInjector();
	inject.init();
	// inject modules in remote cliqz extension with which we want to communicate
	const privacyMigration = inject.module('privacy-migration');

	// fetch settings from antitracking and adblocker
	// if we don't get a response, the promise will timeout after 5s
	return Promise.race([privacyMigration.exportSettings(), _promiseTimeout(5000)])
		.then((result) => {
			if (result === 'error') {
				// no settings available at the moment
				return Promise.reject();
			}
			log('CliqzSettingsImport:', result);
			const modules = ['antitracking', 'adblocker'];

			// active modules
			modules.forEach((mod) => {
				if (result[mod].enabled === true) {
					log(`CliqzSettingsImport: import ${mod} state: enabled`);
					cliqz.enableModule(mod);
				} else {
					log(`CliqzSettingsImport: import ${mod} state: disabled`);
					cliqz.disableModule(mod);
				}
			});

			// import site whitelists
			const existingSites = new Set(conf.site_whitelist);
			const newSites = new Set(modules.map(mod => result[mod].whitelistedSites)
				.reduce((lst, val) => lst.concat(val), [])
				.map(s => s.replace(/^(http[s]?:\/\/)?(www\.)?/, ''))
				.filter(s => !existingSites.has(s)));
			log('CliqzSettingsImport: add whitelisted sites', [...newSites]);
			const whitelist = conf.site_whitelist;
			newSites.forEach((s) => {
				whitelist.push(s);
			});
			conf.site_whitelist = whitelist;
			privacyMigration.cleanModuleData();
			return Promise.resolve();
		}).then(() => {
			inject.unload();
		});
}

/**
 * Import settings from Cliqz
 * @memberOf BackgroundUtils
 *
 * @param  {Object} cliqz
 * @param  {Object} c	conf
 */
export function importCliqzSettings(cliqz, c) {
	const conf = c;
	log('checking cliqz import', conf.cliqz_import_state);
	if (!conf.cliqz_import_state) {
		_runCliqzSettingsImport(cliqz, conf).then(() => {
			log('CliqzSettingsImport: cliqz settings import successful');
			conf.cliqz_import_state = 1;
		}, (e) => {
			log('CliqzSettingsImport: cliqz import not available at present', e);
		});
	}
}
