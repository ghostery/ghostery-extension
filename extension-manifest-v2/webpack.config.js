/**
 * Webpack Config
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// dependencies
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin-next');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const sass = require('sass');

// constants
const BUILD_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');
const APP_DIR = path.resolve(__dirname, 'app');
const SHARED_COMP_DIR = path.resolve(__dirname, 'app/shared-components');
const ONBOARDING_DIR = path.resolve(__dirname, 'app/onboarding');
const PANEL_DIR = path.resolve(__dirname, 'app/panel');
const PANEL_ANDROID_DIR = path.resolve(__dirname, 'app/panel-android');
const SASS_DIR = path.resolve(__dirname, 'app/scss');
const CONTENT_SCRIPTS_DIR = path.resolve(__dirname, 'app/content-scripts');
const TRACKERS_PREVIEW_DIR = path.resolve(__dirname, 'app/trackers-preview');
const AUTOCONSENT_DIR = path.resolve(__dirname, 'app/autoconsent');
const RENEW_DIR = path.resolve(__dirname, 'app/renew');

const RM = (process.platform === 'win32') ? 'powershell remove-item' : 'rm';

const BUILD_TARGET = [
	'firefox68',
	'edge79',
	'opera56',
	'chrome69',
];

module.exports = {
	devtool: false,
	stats: 'errors-only',
	performance: {
		hints: false // notify of assets over 250kb
	},
	// watch node_module for changes in libs and ui
	snapshot: {
		managedPaths: [
			path.resolve(__dirname, 'node_modules/@ghostery/libs'),
			path.resolve(__dirname, 'node_modules/@ghostery/ui'),
		],
	},
	resolve: {
		mainFields: ['browser', 'main'],
		symlinks: false, // allow module resolution with `npm link`
		extensions: ['.js', '.jsx'], // allow leaving off file extension when importing
		fallback: {
			url: require.resolve('url'),
			os: require.resolve('os-browserify/browser'),
			tty: require.resolve('tty-browserify'),
		},
	},
	entry: {
		account_pages: [`${CONTENT_SCRIPTS_DIR}/account_pages.js`],
		background: [`${SRC_DIR}/background.js`],
		blocked_redirect: [`${CONTENT_SCRIPTS_DIR}/blocked_redirect.js`],
		checkout_pages: [`${CONTENT_SCRIPTS_DIR}/checkout_pages.js`],
		click_to_play: [`${CONTENT_SCRIPTS_DIR}/click_to_play.js`],
		content_script_bundle: [`${CONTENT_SCRIPTS_DIR}/content_script_bundle.js`],
		notifications: [`${CONTENT_SCRIPTS_DIR}/notifications.js`],
		page_performance: [`${CONTENT_SCRIPTS_DIR}/page_performance.js`],
		panel_android_react: [`${PANEL_ANDROID_DIR}/index.jsx`],
		panel_react: [`${PANEL_DIR}/index.jsx`],
		onboarding: [`${ONBOARDING_DIR}/index.js`],
		purplebox: [`${CONTENT_SCRIPTS_DIR}/purplebox.js`],
		shared_comp_react: [`${SHARED_COMP_DIR}/index.js`],
		trackers_preview: [`${TRACKERS_PREVIEW_DIR}/index.js`],
		trackers_preview_content_script: [`${CONTENT_SCRIPTS_DIR}/trackers-preview.js`],
		autoconsent: [`${AUTOCONSENT_DIR}/index.js`],
		renew: [`${RENEW_DIR}/index.js`],

		// Sass
		foundation: [`${SASS_DIR}/vendor/foundation.scss`],
		purplebox_styles: [`${SASS_DIR}/purplebox.scss`],
		trackers_preview_content_script_styles: [`${SASS_DIR}/trackers-preview_content_script.scss`],
	},
	output: {
		filename: '[name].js',
		path: BUILD_DIR,
	},
	plugins: [
		// Clear './dist' folder
		new CleanWebpackPlugin({
			verbose: false,
		}),
		// Ignore all locale files of moment.js
		new webpack.IgnorePlugin({
			resourceRegExp: /locale/,
			contextRegExp: /node_modules.+(moment)/,
		}),
		// Extract CSS into individual files
		new MiniCssExtractPlugin({
			filename: 'css/[name].css'
		}),
		// Clear duplicate js files created from CSS extraction
		new WebpackShellPlugin({
			onBuildEnd: {
				scripts: [
					`${RM} ./dist/foundation.js`,
					`${RM} ./dist/purplebox_styles.js`,
					'npm run licenses',
				],
				blocking: true,
			},
		}),
		// Create global `t` function for i18n
		new webpack.DefinePlugin({
			// eslint-disable-next-line object-shorthand
			t: function(messageName, substitutions) {
				return chrome.i18n.getMessage(messageName, substitutions);
			}
		}),
		// Set `chrome` global for browsers that don't support it
		new webpack.BannerPlugin({
			banner: 'if(typeof browser!=="undefined"){chrome=browser;}',
			raw: true,
			include: /\.js$/
		}),
	],
	optimization: {
		moduleIds: 'deterministic',
		minimize: false,
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: {
					loader: 'underscore-template-loader'
				}
			},
			{
				test: /\.js$/,
				include: /node_modules\/@ghostery\/ui/,
				use: [{ loader: 'import-meta-loader' }],
			},
			{
				test: /\.(js|jsx)$/,
				include: [APP_DIR, SRC_DIR],
				exclude: /node_modules/,
				use: [
					{
						loader: 'esbuild-loader',
						options: {
							loader: 'jsx',
							target: BUILD_TARGET,
						}
					},
				]
			},
			{
				test: /\.(css|scss)$/,
				resolve: {
					extensions: ['.scss', '.sass', '.css']
				},
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'resolve-url-loader',
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							implementation: sass,
							sassOptions: {
								includePaths: [
									path.resolve(__dirname, '../node_modules/foundation-sites/scss'),
									path.resolve(__dirname, 'app/scss'),
								]
							}
						},
					}
				]
			},
			{
				test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
				type: 'asset/inline',
			},
		],
	}
};
