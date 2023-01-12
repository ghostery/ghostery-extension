/**
 * License Fetcher
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

/* eslint import/no-extraneous-dependencies: 0 */
/* eslint no-console: 0 */

// dependencies
const checker = require('license-checker');
const fs = require('fs');

const IGNORED_PACAKGES = [
	'@ghostery/libs',
	'@ghostery/ui',
	'ghostery-common',
	'@ghostery/extension-manifest-v2',
	'@ghostery/extension-manifest-v3',
	'@types/',
];

// Build list of licenses
checker.init({
	start: '.',
	production: true,
	json: true,
	direct: false,
}, (err, licenseJSON) => {
	if (err) {
		console.error('License Fetcher error:', err);
	} else {
		console.log('Generating licenses.json');
		const output = {};

		Object.keys(licenseJSON).forEach((packageName) => {
			if (IGNORED_PACAKGES.some(name => packageName.startsWith(name))) {
				return;
			}

			output[packageName] = {
				name: packageName,
				repository: licenseJSON[packageName].repository,
				licenses: licenseJSON[packageName].licenses,
				publisher: licenseJSON[packageName].publisher,
				url: licenseJSON[packageName].url,
				email: licenseJSON[packageName].email,
				licenseText: licenseJSON[packageName].licenseText,
			};
		});

		if (!fs.existsSync('dist')) {
			fs.mkdirSync('dist');
		}

		fs.writeFileSync('./dist/licenses.json', JSON.stringify(output, null, 2));
		console.log('Completed licenses.json');
	}
});
