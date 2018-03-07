/**
 * License Fetcher
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

// depenencies
const jsonfile = require('jsonfile');
const checker = require('license-checker');
const extract = require('markdown-extract')
const fs = require('fs-extra');
const read = require('read-file');
const path = require('path');

path.extname('index.html')

//Build list of licenses
const licenseList = {};
checker.init({
	start: '.',
	production: true,
	json: true,
}, function(err, json) {
	if (err) {
			console.error("License Fetcher error:", err);
	} else {
		console.log('Generating licenses.json');
		const dependencies = jsonfile.readFileSync('./package.json').dependencies;
		const keysArray = [];
		Object.keys(dependencies).forEach(key => {
			if(key !== 'browser-core') {
				const packagePath = `./node_modules/${key}/package.json`;
				if(fs.pathExistsSync(packagePath)) {
					const newKey = jsonfile.readFileSync(packagePath)['_id'];
					keysArray.push(newKey);
				}
			}
		});
		const filteredList = {};
		Object.keys(json).forEach(key => {
			if(keysArray.indexOf(key) !== -1) {
				licenseList[key] = json[key];
				licenseList[key]['name'] = key;
				delete licenseList[key]['path'];
				const licenseFile = licenseList[key]['licenseFile'];
				delete licenseList[key]['licenseFile'];
				if(fs.pathExistsSync(licenseFile)) {
					const licenseText = read.sync(licenseFile, {encoding: 'utf8'});
					if(path.extname(licenseFile) === '.md'
						&& !path.basename(licenseFile).toLowerCase().includes('license')) {
						const nodes = extract({type: /heading/, text: /License/, gnp: true}, licenseFile);
						if(nodes && nodes.length && nodes[ 0 ]) {
							licenseList[key]['licenseText'] = nodes[ 0 ];
						} else {
							licenseList[key]['licenseText'] = '';
						}
					} else {
						licenseList[key]['licenseText'] = licenseText;
					}
				}
			}
		});
		jsonfile.writeFileSync("./tools/licenses/licenses.json", licenseList);
		console.log('Completed licenses.json');
	}
});
