/**
 * Babel Config
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

module.exports = function (api) {
	let presets = ['@babel/preset-react'];
	let plugins = [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-object-rest-spread',
	];

	switch(api.env()) {
		case 'app':
			// @TODO: Add additional plugins for './app' dir as needed
			break;
		case 'src':
			// Don't transpile the './src' dir
			presets = [];
			break;
		case 'test':
			// Calling Jest from package.json with `BABEL_ENV=test` set
			plugins.push('@babel/plugin-transform-modules-commonjs');
			break;
	}

	return {
		presets,
		plugins
	};
};
