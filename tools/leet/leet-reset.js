/**
 * Run this script to reset the English translation file /_locales/en/messages.json
 * back to its original version
 *
 * To run the script:
 * ```sh
 * npm run leet.reset
 * ```
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

"use strict";
const fs = require('fs');

// Check if the copied English messages.json file exists
if (fs.existsSync('./tools/leet/messages.en.copy.json')) {
	// Copy message file back to its proper location
	fs.copyFileSync('./tools/leet/messages.en.copy.json', './_locales/en/messages.json');

	// Delete temporary files
	fs.unlinkSync('./tools/leet/messages.leet.json');
	fs.unlinkSync('./tools/leet/messages.en.copy.json');

	// Log success to the user
	console.log('Successfully reverted messages.json back to its original state');
} else {
	// Log an error to the user
	console.log('Error: unable to revert because the copied messages.json file DNE.');
}
