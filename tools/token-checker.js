/**
 * Token Checker
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

/* eslint import/no-extraneous-dependencies: 0 */
/* eslint no-console: 0 */

console.time('token-checker');

const fs = require('fs-extra');
const jsonfile = require('jsonfile');
const findInFiles = require('find-in-files');

// Constants
const DEFAULT_LOCALE_PATH = './_locales/en/messages.json';
const SEARCH_DIRECTORIES = ['app', 'databases', 'src', 'test', 'tools'];
const FIND_TOKEN_REGEX = /\Wt\(['|"|`](\w*)['|"|`]\)/;
const UNDEFINED_TOKEN_FILE = './tools/token_results/undefined_tokens.txt';

// Empty tools/token_results directory
fs.emptyDirSync('./tools/token_results');

/**
 * Outputs the contents of an object to a .txt file.
 * @param  string fileName       The location of the file we will output to
 * @param  object resultsObject  An object with the data we will output
 * @return none
 */
function recordResults(fileName, resultsObject) {
	const stream = fs.createWriteStream(fileName);
	stream.once('open', () => {
		Object.keys(resultsObject).forEach((file) => {
			stream.write(`'${file}' has missing tokens:\n`);
			Object.keys(resultsObject[file]).forEach((token) => {
				stream.write(`\t${token}\n`);
			});
			stream.write('\n');
		});
		stream.end();
	});
}

/**
 * Gathers the tokens used in a directory
 * @param  directory   directory to search for tokens
 * @const  RegEx       FIND_TOKEN_REGEX  regex used to find tokens
 * @return Promise     Resolves with an object of all tokens and the files
 *                     in which those tokens were found
 */
function findTokensInDirectory(directory) {
	return new Promise((resolve) => {
		const dirTokens = {};
		findInFiles.find(FIND_TOKEN_REGEX, directory).then((dirResults) => {
			const fileNames = Object.keys(dirResults);
			for (let i = 0; i < fileNames.length; i++) {
				const fileName = fileNames[i];
				const fileMatches = dirResults[fileName].matches;
				for (let j = 0; j < fileMatches.length; j++) {
					const match = fileMatches[j];
					const token = match.substr(4, match.length - 6);
					if (!dirTokens.hasOwnProperty(token)) {
						dirTokens[token] = { files: {} };
					}
					dirTokens[token].files[fileName] = true;
				}
			}
			resolve(dirTokens);
		});
	});
}

/**
 * Gathers the tokens used in a directory
 * @param  dirsTokens   Resolved object of findTokensInDirectory.
 *                      Object of tokens and files in which the tokens were found.
 * @const  string       DEFAULT_LOCALE_PATH  The location of the default locale JSON file
 * @return Promise      Resolves with an object of files that have tokens not found
 *                      in DEFAULT_LOCALE_PATH's messages.json file
 */
function compileUndefinedTokens(dirsTokens) {
	const defaultLocaleJson = jsonfile.readFileSync(DEFAULT_LOCALE_PATH);
	const undefinedTokenFiles = {};
	return new Promise((resolve) => {
		for (let i = 0; i < dirsTokens.length; i++) {
			const dirTokens = dirsTokens[i];
			const dirTokensArr = Object.keys(dirTokens);
			for (let j = 0; j < dirTokensArr.length; j++) {
				const token = dirTokensArr[j];
				if (!defaultLocaleJson.hasOwnProperty(token)) {
					const files = Object.keys(dirTokens[token].files);
					for (let k = 0; k < files.length; k++) {
						const file = files[k];
						if (!undefinedTokenFiles.hasOwnProperty(file)) {
							undefinedTokenFiles[file] = {};
						}
						undefinedTokenFiles[file][token] = true;
					}
				}
			}
		}
		resolve(undefinedTokenFiles);
	});
}

/**
 * Checks for missing tokens throughout the project. Writes the list of missing tokens to a file.
 * Does not check for tokens that are defined using variables.
 * @const  array       SEARCH_DIRECTORIES  directories to search for tokens
 * @const  string      UNDEFINED_TOKEN_FILE  The file where we should write the tokens
 * @return Promise     Resolves or Rejects depending on whether there are undefined tokens
 */
function findUndefinedTokens() {
	return new Promise((resolve, reject) => {
		Promise.all(
			SEARCH_DIRECTORIES.map(directory => findTokensInDirectory(directory))
		).then(compileUndefinedTokens).then((undefinedTokenFiles) => {
			const undefinedTokenFilesArr = Object.keys(undefinedTokenFiles);
			if (undefinedTokenFilesArr.length >= 1) {
				console.log('Error: undefined tokens were found. See them in `%s`.', UNDEFINED_TOKEN_FILE);
				recordResults(UNDEFINED_TOKEN_FILE, undefinedTokenFiles);
				reject();
			} else {
				console.log('Scanned all directories for undefined tokens, none found.');
				resolve();
			}
		});
	});
}

// Main
findUndefinedTokens().catch(() => {
	console.log('Errors found. Fix the files and run `node tools/token-checker` to re-validate translation tokens.');
}).then(() => {
	console.timeEnd('token-checker');
});
