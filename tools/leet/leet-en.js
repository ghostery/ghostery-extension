/**
 * Run this script to convert the English translation file /_locales/en/messages.json
 * to a leeted version for the purposes of testing.
 * Leet: https://en.wikipedia.org/wiki/Leet
 *
 * To run the script:
 * ```sh
 * npm run leet
 * ```
 *
 * The leet process will make strings longer while keeping the extension readable/usable.
 *
 * You may want to leet the translation file because:
 * 1. You are building UI components and you want to see where the UI will break
 *    when strings are longer.
 * 2. You want to see how the UI might hold up when locale strings are different.
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

const fs = require('fs');
const jsonfile = require('jsonfile');

// Modified from https://www.npmjs.com/package/leet
const leet_convert = function(string) {
	const characterMap = {
		a: '4a4',
		b: '8b8',
		// 'c': 'c',
		// 'd': 'd',
		e: '3e3',
		// 'f': 'f',
		g: '6g6',
		// 'h': 'h',
		// 'i': 'i',
		// 'j': 'j',
		// 'k': 'k',
		l: '1l1',
		// 'm': 'm',
		// 'n': 'n',
		o: '0o0',
		// 'p': 'p',
		// 'q': 'q',
		// 'r': 'r',
		s: '5s5',
		t: '7t7'
		// 'u': 'u',
		// 'v': 'v',
		// 'w': 'w',
		// 'x': 'x',
		// 'y': 'y',
		// 'z': 'z',
	};

	let letter;
	let output = string || '';
	output = output.replace(/cks/g, 'x');

	for (letter in characterMap) {
		if (characterMap.hasOwnProperty(letter)) {
			output = output.replace(new RegExp(letter, 'g'), characterMap[letter]);
		}
	}

	return output;
};

// Check if the copied English messages.json file exists
if (!fs.existsSync('./tools/leet/messages.en.copy.json')) {
	// Copy the English messages.json file to a temporary location
	fs.copyFileSync('./_locales/en/messages.json', './tools/leet/messages.en.copy.json');

	// Import the copied messages file
	const leet = {};
	let key;
	const en = jsonfile.readFileSync('./tools/leet/messages.en.copy.json');

	// Create a LEETed version of the messages.json file
	for (key in en) {
		if (en[key].hasOwnProperty('message')) {
			const message = leet_convert(en[key].message);
			const { placeholders } = en[key];
			leet[key] = { message, placeholders };
		}
	}

	// Save the leeted version and override the existing English messages.json file
	fs.writeFileSync('./tools/leet/messages.leet.json', JSON.stringify(leet), 'utf-8');
	fs.copyFileSync('./tools/leet/messages.leet.json', './_locales/en/messages.json');

	// Log success to the user
	console.log('Successfully leeted messages.json.');
} else {
	// Log an error to the user
	console.log('Error: leeting has already been done. Run `npm run leet.reset` and then try again.');
}
