/**
 * i18n Checker
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

console.time('i18n-checker');
const fs = require('fs-extra');
const oboe = require('oboe');

// Constants
const LOCALES_FOLDER = './_locales';
const GATHER_FILE_PATHS_EXCEPTIONS = ['.DS_Store'];
const LANG_FILES_COUNT = 14;
const DEFAULT_LOCALE_PATH = '../_locales/en/messages.json';
const DUPLICATE_TOKENS_FILE = './tools/i18n_results/duplicate_tokens.txt';
const MISSING_TOKENS_FILE = './tools/i18n_results/missing_tokens.txt';
const EXTRA_TOKENS_FILE = './tools/i18n_results/extra_tokens.txt';
const MALFORMED_TOKENS_FILE = './tools/i18n_results/malformed_tokens.txt';
const MISSING_PLACEHOLDERS_FILE = './tools/i18n_results/missing_placeholders.txt';
const EXTRA_PLACEHOLDERS_FILE = './tools/i18n_results/extra_placeholders.txt';
const MALFORMED_PLACEHOLDERS_FILE = './tools/i18n_results/malformed_placeholders.txt';

// Empty tools/i18n_results directory
fs.emptyDirSync('./tools/i18n_results');

// Main
gatherFilePaths().then(paths => {
	return validateJson(paths);
}).then(paths => {
	return Promise.all([
		findDuplicates(paths),
		findMissingKeys(paths),
		findExtraKeys(paths),
		findMalformedKeys(paths),
		findMissingPlaceholders(paths),
		findExtraPlaceholders(paths),
		findMalformedPlaceholders(paths)
	]);
}).catch(() => {
	console.log('Errors found. Fix the files and run `node tools/i18n-checker` to re-validate locale files.');
}).then(result => {
	console.timeEnd('i18n-checker');
});

/**
 * Gathers the paths of the locale files
 * @params none
 * @const  string  LOCALES_FOLDER                The folder we search for locales
 * @const  array   GATHER_FILE_PATHS_EXCEPTIONS  Files in the LOCALE_FOLDER that we should skip
 * @const  int     LANG_FILES_COUNT              The number of locales we should find in LOCALES_FOLDER
 * @return Promise                               Resolves with the paths to all locale files if no errors,
 *                                               Rejects otherwise
 */
function gatherFilePaths() {
	return new Promise((resolve, reject) => {
		let paths = [];
		fs.readdir(LOCALES_FOLDER, (err, files) => {
			let langFilesCounted = 0;
			files.forEach(locale => {
				// Validate that the locale is named correctly, eg: en_GB
				if (!/^[a-z]{2}(\_[A-Z]{2})?$/.test(locale)) {
					if (GATHER_FILE_PATHS_EXCEPTIONS.indexOf(locale) === -1) {
						console.log('Error: "%s" is not a valid locale', locale);
					}
					return;
				}
				langFilesCounted = langFilesCounted + 1;
				paths.push(LOCALES_FOLDER + '/' + locale + '/messages.json');
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
		paths.forEach(path => {
			try {
				require('.' + path);
			} catch(err) {
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
 * Checks for duplicates in all the locale files. Writes found duplicates to a file
 * @params array   paths                  An array of strings denoting the paths to all the locale files
 * @const  string  DUPLICATE_TOKENS_FILE  The file where we should write the found duplicates
 * @const  int     LANG_FILES_COUNT       The number of we are searching over
 * @return Promise                        Resolves if no duplicates were found,
 *                                        Rejects otherwise
 */
function findDuplicates(paths) {
	return new Promise((resolve, reject) => {
		let langFilesCounted = 0;
		let hasDuplicates = false;
		let duplicates = {};
		paths.forEach(path => {
			let foundKeys = {};
			let locale = path.match(/_locales\/(.*)\/messages.json/)[1];
			duplicates[locale] = [];
			oboe(fs.createReadStream(path)).node('{message}', (val, keys) => {
				let key = keys[0];
				if (foundKeys.hasOwnProperty(key)) {
					hasDuplicates = true;
					duplicates[locale].push(key);
					return;
				}
				foundKeys[key] = true;
			}).done(() => {
				langFilesCounted = langFilesCounted + 1;
				if (langFilesCounted === LANG_FILES_COUNT) {
					if (hasDuplicates) {
						console.log('Error: duplicate tokens were found. See them in `%s`.', DUPLICATE_TOKENS_FILE);
						recordResults(DUPLICATE_TOKENS_FILE, duplicates);
						reject();
					} else {
						console.log('Scanned all locale files for duplicate tokens, none found.');
						resolve();
					}
				}
			});
		});
	});
}

/**
 * Checks for missing tokens in all the locale files. Writes the list of missing tokens to a file
 * @params array   paths                An array of strings denoting the paths to all the locale files
 * @const  string  DEFAULT_LOCALE_PATH  The location of the default locale JSON file
 * @const  string  MISSING_TOKENS_FILE  The file where we should write the missing tokens
 * @return Promise                      Resolves if no missing tokens were found,
 *                                      Rejects otherwise
 */
function findMissingKeys(paths) {
	return new Promise((resolve, reject) => {
		let defaultLocaleJson = require(DEFAULT_LOCALE_PATH);
		let hasMissingKeys = false;
		let missingKeys = {};
		paths.forEach(path => {
			let localeJson = require('.' + path);
			let locale = path.match(/_locales\/(.*)\/messages.json/)[1];
			missingKeys[locale] = [];
			Object.keys(defaultLocaleJson).forEach(key => {
				if (!localeJson.hasOwnProperty(key)) {
					hasMissingKeys = true;
					missingKeys[locale].push(key);
					return;
				}
			});
		});
		if (hasMissingKeys) {
			console.log('Error: missing tokens were found. See them in `%s', MISSING_TOKENS_FILE);
			recordResults(MISSING_TOKENS_FILE, missingKeys);
			reject();
		} else {
			console.log('Scanned all locale files for missing tokens, none found.');
			resolve();
		}
	});
}

/**
 * Checks for extra tokens in all the locale files. Writes the list of extra tokens to a file
 * @params array   paths                An array of strings denoting the paths to all the locale files
 * @const  string  DEFAULT_LOCALE_PATH  The location of the default locale JSON file
 * @const  string  EXTRA_TOKENS_FILE    The file where we should write the extra tokens
 * @return Promise                      Resolves if no extra tokens were found,
 *                                      Rejects otherwise
 */
function findExtraKeys(paths) {
	return new Promise((resolve, reject) => {
		let defaultLocaleJson = require(DEFAULT_LOCALE_PATH);
		let hasExtraKeys = false;
		let extraKeys = {};
		paths.forEach(path => {
			let localeJson = require('.' + path);
			let locale = path.match(/_locales\/(.*)\/messages.json/)[1];
			extraKeys[locale] = [];
			Object.keys(localeJson).forEach(key => {
				if (!defaultLocaleJson.hasOwnProperty(key)) {
					hasExtraKeys = true;
					extraKeys[locale].push(key);
					return;
				}
			});
		});
		if (hasExtraKeys) {
			console.log('Error: extra tokens were found. See them in `%s', EXTRA_TOKENS_FILE);
			recordResults(EXTRA_TOKENS_FILE, extraKeys);
			reject();
		} else {
			console.log('Scanned all locale files for extra tokens, none found.');
			resolve();
		}
	});
}

/**
 * Checks for malformed token key objects in all the locale files. Writes the list of malformed tokens to a file
 * @params array   paths                  An array of strings denoting the paths to all the locale files
 * @const  string  MALFORMED_TOKENS_FILE  The file where we should write the malformed tokens
 * @return Promise                        Resolves if no malformed tokens were found,
 *                                        Rejects otherwise
 */
function findMalformedKeys(paths) {
	return new Promise((resolve, reject) => {
		let hasMalformedKeys = false;
		let malformedKeys = {};
		paths.forEach(path => {
			let localeJson = require('.' + path);
			let locale = path.match(/_locales\/(.*)\/messages.json/)[1];
			malformedKeys[locale] = [];
			Object.keys(localeJson).forEach(key => {
				if (!localeJson[key].hasOwnProperty('message')) {
					hasMalformedKeys = true;
					malformedKeys[locale].push(key);
					return;
				}
			});
		});
		if (hasMalformedKeys) {
			console.log('Error: malformed tokens were found. See them in `%s', MALFORMED_TOKENS_FILE);
			recordResults(MALFORMED_TOKENS_FILE, malformedKeys);
			reject();
		} else {
			console.log('Scanned all locale files for malformed tokens, none found.');
			resolve();
		}
	});
}

/**
 * Checks for missing placeholders in all the locale files. Writes the list of missing placeholders to a file
 * @params array   paths                      An array of strings denoting the paths to all the locale files
 * @const  string  DEFAULT_LOCALE_PATH        The location of the default locale JSON file
 * @const  string  MISSING_PLACEHOLDERS_FILE  The file where we should write the extra tokens
 * @return Promise                            Resolves if no extra tokens were found,
 *                                            Rejects otherwise
 */
function findMissingPlaceholders(paths) {
	return new Promise((resolve, reject) => {
		let defaultLocaleJson = require(DEFAULT_LOCALE_PATH);
		let hasMissingPlaceholders = false;
		let missingPlaceholders = {};
		paths.forEach(path => {
			let localeJson = require('.' + path);
			let locale = path.match(/_locales\/(.*)\/messages.json/)[1];
			missingPlaceholders[locale] = [];
			Object.keys(defaultLocaleJson).forEach(key => {
				if (defaultLocaleJson[key].hasOwnProperty('placeholders')) {
					if (!localeJson[key] || !localeJson[key].hasOwnProperty('placeholders')) {
						hasMissingPlaceholders = true;
						missingPlaceholders[locale].push(key + ': missing ' + Object.keys(defaultLocaleJson[key]['placeholders']).length + ' placeholder(s)');
						return;
					}
					Object.keys(defaultLocaleJson[key]['placeholders']).forEach(placeholder => {
						if (!localeJson[key]['placeholders'][placeholder]) {
							hasMissingPlaceholders = true;
							missingPlaceholders[locale].push(key + ': ' + placeholder);
						}
					});
				}
			});
		});
		if (hasMissingPlaceholders) {
			console.log('Error: missing placeholders were found. See them in `%s`', MISSING_PLACEHOLDERS_FILE);
			recordResults(MISSING_PLACEHOLDERS_FILE, missingPlaceholders);
			reject();
		} else {
			console.log('Scanned all locale files for missing placeholders, none found.');
			resolve();
		}
	});
}

/**
 * Checks for extra placeholders in all the locale files. Writes the list of extra placeholders to a file
 * @params array   paths                    An array of strings denoting the paths to all the locale files
 * @const  string  DEFAULT_LOCALE_PATH      The location of the default locale JSON file
 * @const  string  EXTRA_PLACEHOLDERS_FILE  The file where we should write the extra tokens
 * @return Promise                          Resolves if no extra tokens were found,
 *                                          Rejects otherwise
 */
function findExtraPlaceholders(paths) {
	return new Promise((resolve, reject) => {
		let defaultLocaleJson = require(DEFAULT_LOCALE_PATH);
		let hasExtraPlaceholders = false;
		let extraPlaceholders = {};
		paths.forEach(path => {
			let localeJson = require('.' + path);
			let locale = path.match(/_locales\/(.*)\/messages.json/)[1];
			extraPlaceholders[locale] = [];
			Object.keys(localeJson).forEach(key => {
				if (localeJson[key].hasOwnProperty('placeholders')) {
					if (!defaultLocaleJson[key] || !defaultLocaleJson[key].hasOwnProperty('placeholders')) {
						hasExtraPlaceholders = true;
						extraPlaceholders[locale].push(key + ': has ' + Object.keys(localeJson[key]['placeholders']).length + ' extra placeholder(s)');
						return;
					}
					Object.keys(localeJson[key]['placeholders']).forEach(placeholder => {
						if (!defaultLocaleJson[key]['placeholders'][placeholder]) {
							hasExtraPlaceholders = true;
							extraPlaceholders[locale].push(key + ': ' + placeholder);
						}
					});
				}
			});
		});
		if (hasExtraPlaceholders) {
			console.log('Error: extra placeholders were found. See them in `%s`', EXTRA_PLACEHOLDERS_FILE);
			recordResults(EXTRA_PLACEHOLDERS_FILE, extraPlaceholders);
			reject();
		} else {
			console.log('Scanned all locale files for extra placeholders, none found.');
			resolve();
		}
	});
}

/**
 * Checks for malformed placeholders in all the locale files. Writes the list of extra placeholders to a file
 * @params array   paths                        An array of strings denoting the paths to all the locale files
 * @const  string  MALFORMED_PLACEHOLDERS_FILE  The file where we should write the extra tokens
 * @return Promise                              Resolves if no extra tokens were found,
 *                                              Rejects otherwise
 */
function findMalformedPlaceholders(paths) {
	return new Promise((resolve, reject) => {
		let hasMalformedPlaceholders = false;
		let malformedPlaceholders = [];
		paths.forEach(path => {
			let localeJson = require('.' + path);
			let locale = path.match(/_locales\/(.*)\/messages.json/)[1];
			malformedPlaceholders[locale] = [];
			Object.keys(localeJson).forEach(key => {
				let message = localeJson[key].message || '';
				let placeholders = localeJson[key].placeholders || {};
				let matchedPlaceholders = message.match(/\$[A-Z_]+\$/gi) || []; // Matches $PLACE_HOLDER$ in the message
				if (matchedPlaceholders) {
					matchedPlaceholders.forEach(placeholder => {
						placeholder = placeholder.toLowerCase().slice(1, -1);
						if (!placeholders.hasOwnProperty(placeholder)) {
							hasMalformedPlaceholders = true;
							malformedPlaceholders[locale].push(key + ': needs placeholder "' + placeholder + '"');
							return;
						}
					});
				}
				if (placeholders) {
					Object.keys(placeholders).forEach(placeholder => {
						placeholder = '$' + placeholder.toUpperCase() + '$';
						if (matchedPlaceholders.indexOf(placeholder) === -1) {
							hasMalformedPlaceholders = true;
							malformedPlaceholders[locale].push(key + ': expects placeholder "' + placeholder + '" in message');
							return;
						}
					});
				}
			});
		});
		if (hasMalformedPlaceholders) {
			console.log('Error: malformed placeholders were found. See them in `%s`', MALFORMED_PLACEHOLDERS_FILE);
			recordResults(MALFORMED_PLACEHOLDERS_FILE, malformedPlaceholders);
			reject();
		} else {
			console.log('Scanned all locale files for malformed placeholders, none found.');
			resolve();
		}
	});
}

/**
 * Outputs the contents of an object to a .txt file.
 * @param  string fileName       The location of the file we will output to
 * @param  object resultsObject  An object with the data we will output
 * @return none
 */
function recordResults(fileName, resultsObject) {
	var stream = fs.createWriteStream(fileName);
	stream.once('open', () => {
		Object.keys(resultsObject).forEach(key => {
			stream.write(key + '[' + resultsObject[key].length + ']:\n');
			resultsObject[key].forEach(duplicate => {
				stream.write(duplicate + '\n');
			});
			stream.write('\n')
		});
		stream.end();
	});
}
