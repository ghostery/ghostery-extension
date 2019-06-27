/**
 * Transifex
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

/* eslint import/no-extraneous-dependencies: 0 */
/* eslint no-console: 0 */

console.time('transifex');

const fs = require('fs-extra');
const jsonfile = require('jsonfile');

// Constants
const LOCALES_FOLDER = './_locales';
const GATHER_FILE_PATHS_EXCEPTIONS = ['.DS_Store'];
const LANG_FILES_COUNT = 14;
const DEFAULT_LOCALE_PATH = '../_locales/en/messages.json';

/**
 * Gathers the paths of the locale files
 * @const  string  LOCALES_FOLDER                The folder we search for locales
 * @const  array   GATHER_FILE_PATHS_EXCEPTIONS  Files in the LOCALE_FOLDER that we should skip
 * @const  int     LANG_FILES_COUNT              The number of locales we should find in LOCALES_FOLDER
 * @return Promise                               Resolves with the paths to all locale files if no errors,
 *                                               Rejects otherwise
 */
function gatherFilePaths() {
	return new Promise((resolve, reject) => {
		const paths = [];
		fs.readdir(LOCALES_FOLDER, (err, files) => {
			let langFilesCounted = 0;
			files.forEach((locale) => {
				// Validate that the locale is named correctly, eg: en_GB
				if (!/^[a-z]{2}(_[A-Z]{2})?$/.test(locale)) {
					if (GATHER_FILE_PATHS_EXCEPTIONS.indexOf(locale) === -1) {
						console.log('Error: "%s" is not a valid locale', locale);
					}
					return;
				}
				langFilesCounted += 1;
				paths.push(`${LOCALES_FOLDER}/${locale}/messages.json`);
			});
			if (langFilesCounted === LANG_FILES_COUNT) {
				console.log('Correctly found %d of %d locale files.',
					LANG_FILES_COUNT, langFilesCounted);
				resolve(paths);
			} else {
				console.log('Error: there should be %d locale files, only scanned %d.',
					LANG_FILES_COUNT, langFilesCounted);
				reject();
			}
		});
	});
}

/**
 * Validates whether all the locale files are valid JSON
 * @param  array   paths  An array of strings denoting the paths to all the locale files
 * @return Promise        Resolves with the paths passed as a param if all files are valid JSON
 *                        Rejects otherwise
 */
function validateJson(paths) {
	return new Promise((resolve, reject) => {
		let hasError = false;
		paths.forEach((path) => {
			try {
				jsonfile.readFileSync(`.${path}`);
			} catch (err) {
				hasError = true;
				console.log('Error: file "%s" is not valid JSON.', path);
			}
		});
		if (hasError) {
			reject();
		} else {
			console.log('All locale files are valid JSON.');
			resolve(paths);
		}
	});
}

/**
 * Checks for missing placeholders in all the locale files. Copy them over from English file
 * @param array   paths                      An array of strings denoting the paths to all the locale files
 * @const  string  DEFAULT_LOCALE_PATH        The location of the default locale JSON file
 * @return Promise                            Always call resolve (no error handling)
 */
function fixMissingPlaceholders(paths) {
	return new Promise((resolve) => {
		const defaultLocaleJson = jsonfile.readFileSync(DEFAULT_LOCALE_PATH);
		paths.forEach((path) => {
			if (path !== DEFAULT_LOCALE_PATH) {
				let dirty = false;
				const localeJson = jsonfile.readFileSync(`.${path}`);
				Object.keys(defaultLocaleJson).forEach((key) => {
					if (defaultLocaleJson[key].hasOwnProperty('placeholders')) {
						if (localeJson[key] && !localeJson[key].hasOwnProperty('placeholders')) {
							dirty = true;
							localeJson[key].placeholders = defaultLocaleJson[key].placeholders;
						}
					}
				});
				if (dirty) {
					console.log(`Placeholders were added to ${path}`);
					fs.writeFileSync(path, JSON.stringify(localeJson, null, '\t'));
				}
			}
		});
		resolve();
	});
}

// Main
gatherFilePaths().then((paths) => {
	validateJson(paths);
}).then((paths) => {
	fixMissingPlaceholders(paths);
}).catch((err) => {
	console.log('Errors found:', err);
}).then(() => {
	console.timeEnd('transifex');
});
