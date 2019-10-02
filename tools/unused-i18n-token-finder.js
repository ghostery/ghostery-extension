/**
 * i18n Unused Tokens Checker
 * * Combs through default local messages.json file looking for tokens that are not used in the project
 * * Writes the results to a file
 * * Results should be manually verified before removing any tokens because some tokens are dynamically generated
 * 	 and this simple script does not account for that
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

const fs = require('fs-extra');
const jsonfile = require('jsonfile')

// Constants
const UNUSED_TOKENS_FILE = './tools/i18n_results/unused_tokens.txt';

// Empty tools/i18n_results directory
fs.emptyDirSync('./tools/i18n_results');


/**
 * Outputs the contents of an object to a .txt file.
 * @param  string fileName       The location of the file we will output to
 * @param  object resultsObject  An object with the data we will output
 * @return none
 */

function recordResults(fileName, resultsObject) {
	const stream = fs.createWriteStream(fileName);
	stream.once('open', () => {
		Object.keys(resultsObject).forEach((key) => {
			stream.write(`${key}[${resultsObject[key].length}]:\n`);
			resultsObject[key].forEach((duplicate) => {
				stream.write(`${duplicate}\n`);
			});
			stream.write('\n');
		});
		stream.end();
	});
}

function findUnusedTokens(tokens, filepaths) {
	tokens = tokens.map(token => ({ value: token, isUsed: false }));

	// Simpler than splicing arrays
	filepaths.forEach((filepath) => {
		const fileContents = fs.readFileSync(filepath, 'utf8');
		tokens.forEach((token) => {
			if (token.isUsed) { return; }

			if (fileContents.includes(token.value)) {
				token.isUsed = true;
			}
		});
	});

	const unusedTokens =
		(tokens.filter(token => token.isUsed === false))
			.map(token => token.value);

	return unusedTokens;
}

/**
 * Recursively collect the filepaths of files that
 * satisfy the supplied extension and file system location conditions
 * @param [Array|object] whereToLookAndForWhatExtensions
 * @param [string Array] filepaths							The matching filepaths
 * @returns [string Array] filepaths						The matching filepaths
 */
function getFilepaths(whereToLookAndForWhatExtensions, filepaths = []) {
	const targets = whereToLookAndForWhatExtensions;

	if (Array.isArray(targets)) {
		targets.forEach((target) => {
			filepaths = getFilepaths(target, filepaths);
		});
	} else {
		const dirEntries = fs.readdirSync(targets.dir, { withFileTypes: true });

		dirEntries.forEach((dirEntry) => {
			if (dirEntry.isDirectory()) {
				filepaths = getFilepaths({
					dir: `${targets.dir}/${dirEntry.name}`,
					extensions: targets.extensions
				}, filepaths);
			}
			if (dirEntry.isFile()) {
				if (targets.extensions.some(extension => dirEntry.name.endsWith(extension))) {
					filepaths.push(`${targets.dir}/${dirEntry.name}`);
				};
			};
		});

		return filepaths;
	}

	return filepaths;
}

function getJSONKeys(filepath) {
	const json = jsonfile.readFileSync(filepath);
	return Object.keys(json);
}

console.time('i18n-unused-tokens-checker.js');
// recordResults(
	findUnusedTokens(
		getJSONKeys('./_locales/en/messages.json'),
		getFilepaths(
			[
				// Overly broad, but we favor simplicity since there is no compelling reason here to favor performance / efficiency
				// Also, we prefer that unused tokens be incorrectly reported as used (due to an overbroad search) than vice versa
				{ dir: './app', extensions: ['.jsx', '.js'] },
				{ dir: './src', extensions: ['.js'] },
			]
		)
	);
//);
console.timeEnd('i18n-unused-tokens-checker.js');
