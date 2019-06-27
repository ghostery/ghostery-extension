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

// dependencies
const jsonfile = require('jsonfile');
const checker = require('license-checker');
const fs = require('fs-extra');

// Build list of licenses
checker.init({
	start: '.',
	production: true,
	json: true,
	direct: true, // get top-level only
	excludePackages: 'browser-core',
	customPath: 'licenseTemplate.json',
}, (err, licenseJSON) => {
	if (err) {
		console.error('License Fetcher error:', err);
	} else {
		console.log('Generating licenses.json');

		const output = {};
		const packageNames = [];
		const npmDependencies = jsonfile.readFileSync('./package.json').dependencies;

		// Get all top-level dependencies from package.json (except browser-core)
		Object.keys(npmDependencies).forEach((packageName) => {
			if (packageName !== 'browser-core') {
				const packagePath = `./node_modules/${packageName}/package.json`;
				if (fs.pathExistsSync(packagePath)) {
					const { name, version } = jsonfile.readFileSync(packagePath);
					if (name && version) {
						packageNames.push(`${name}@${version}`);
					}
				}
			}
		});

		// Compare package.json dependencies against licenses found in node_modules
		Object.keys(licenseJSON).forEach((packageName) => {
			if (packageNames.indexOf(packageName) !== -1) {
				// TODO: customPath option for 'license-checker' is broken so we have to manually build the output
				output[packageName] = {
					name: packageName,
					repository: licenseJSON[packageName].repository,
					licenses: licenseJSON[packageName].licenses,
					publisher: licenseJSON[packageName].publisher,
					url: licenseJSON[packageName].url,
					email: licenseJSON[packageName].email,
					licenseText: licenseJSON[packageName].licenseText,
				};
			}
		});
		jsonfile.writeFileSync('./tools/licenses/licenses.json', output);
		console.log('Completed licenses.json');
	}
});
