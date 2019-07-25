/**
 * Webpack Config
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

// dependencies
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// constants
const BUILD_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');
const SHARED_COMP_DIR = path.resolve(__dirname, 'app/shared-components');
const PANEL_DIR = path.resolve(__dirname, 'app/panel');
const PANEL_ANDROID_DIR = path.resolve(__dirname, 'app/panel-android');
const HUB_DIR = path.resolve(__dirname, 'app/hub');
const LICENSES_DIR = path.resolve(__dirname, 'app/licenses');
const REWARDS_DIR = path.resolve(__dirname, 'app/rewards');
const SASS_DIR = path.resolve(__dirname, 'app/scss');
const CONTENT_SCRIPTS_DIR = path.resolve(__dirname, 'app/content-scripts');
const RM = (process.platform === 'win32') ? 'powershell remove-item' : 'rm';

module.exports = {
	devtool: 'none', // source-maps
	performance: {
		hints: false // notify of assets over 250kb
	},
	resolve: {
		symlinks: false, // allow module resolution with `npm link`
		extensions: ['.js', '.jsx'] // allow leaving off file extension when importing
	},
	watchOptions: {
		ignored: /node_modules/
	},
	entry: {
		account_pages: [`${CONTENT_SCRIPTS_DIR}/account_pages.js`],
		background: [`${SRC_DIR}/background.js`],
		blocked_redirect: [`${CONTENT_SCRIPTS_DIR}/blocked_redirect.js`],
		click_to_play: [`${CONTENT_SCRIPTS_DIR}/click_to_play.js`],
		content_script_bundle: [`${CONTENT_SCRIPTS_DIR}/content_script_bundle.js`],
		ghostery_dot_com: [`${CONTENT_SCRIPTS_DIR}/ghostery_dot_com.js`],
		hub_react: [`${HUB_DIR}/index.jsx`],
		licenses_react: [`${LICENSES_DIR}/Licenses.jsx`, `${LICENSES_DIR}/License.jsx`],
		notifications: [`${CONTENT_SCRIPTS_DIR}/notifications.js`],
		page_performance: [`${CONTENT_SCRIPTS_DIR}/page_performance.js`],
		panel_android_react: [`${PANEL_ANDROID_DIR}/index.jsx`],
		panel_react: [`${PANEL_DIR}/index.jsx`],
		purplebox: [`${CONTENT_SCRIPTS_DIR}/purplebox.js`],
		rewards: [`${CONTENT_SCRIPTS_DIR}/rewards`],
		shared_comp_react: [`${SHARED_COMP_DIR}/index.js`],
		// Sass
		foundation: [`${SASS_DIR}/vendor/foundation.scss`],
		foundation_hub: [`${SASS_DIR}/vendor/foundation_hub.scss`],
		ghostery_dot_com_css: [`${SASS_DIR}/ghostery_dot_com.scss`],
		hub: [`${SASS_DIR}/hub.scss`],
		licenses: [`${SASS_DIR}/licenses.scss`],
		panel: [`${SASS_DIR}/panel.scss`],
		panel_android: [`${SASS_DIR}/panel_android.scss`],
		purplebox_styles: [`${SASS_DIR}/purplebox.scss`],
		rewards_styles: [`${SASS_DIR}/rewards.scss`],
	},
	output: {
		filename: '[name].js',
		path: BUILD_DIR
	},
	plugins: [
		// Clear './dist' folder
		new CleanWebpackPlugin({
			verbose: false,
		}),
		// Ignore all locale files of moment.js
		new webpack.IgnorePlugin(/locale/, /node_modules.+(moment)/),
		// Extract CSS into individual files
		new MiniCssExtractPlugin({
			filename: 'css/[name].css'
		}),
		// Clear duplicate js files created from CSS extraction
		new WebpackShellPlugin({
			onBuildExit: [
				`${RM} ./dist/foundation.js`,
				`${RM} ./dist/foundation_hub.js`,
				`${RM} ./dist/ghostery_dot_com_css.js`,
				`${RM} ./dist/hub.js`,
				`${RM} ./dist/licenses.js`,
				`${RM} ./dist/panel.js`,
				`${RM} ./dist/panel_android.js`,
				`${RM} ./dist/purplebox_styles.js`,
				`${RM} ./dist/rewards_styles.js`,
			]
		}),
		// Create global `t` function for i18n
		new webpack.DefinePlugin({
			t: function(messageName, substitutions) {
				return chrome.i18n.getMessage(messageName, substitutions);
			}
		}),
		// For @EDGE, set `chrome` global
		new webpack.BannerPlugin({
			banner: 'if(typeof browser!=="undefined"){chrome=browser;}',
			raw: true,
			include: /\.js$/
		}),
	],
	module: {
		rules: [
			{
				test: /\.html$/,
				use: {
					loader: 'underscore-template-loader'
				}
			}, {
				test: /\.css$/,
				loader: ['to-string-loader', 'css-loader'],
			}, {
				test: /\.(js|jsx)$/,
				include: [SHARED_COMP_DIR, PANEL_ANDROID_DIR, PANEL_DIR, HUB_DIR, LICENSES_DIR, CONTENT_SCRIPTS_DIR, REWARDS_DIR],
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							envName: 'app',
						}
					},
					'eslint-loader'
				]
			}, {
				test: /\.js$/,
				include: [SRC_DIR],
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							envName: 'src',
						}
					},
					'eslint-loader'
				]
			}, {
				test: /\.scss$/,
				resolve: {
					extensions: ['.scss', '.sass']
				},
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'sass-loader',
						options: {
							includePaths: [
								path.resolve(__dirname, 'node_modules/foundation-sites/scss'),
							]
						}
					}
				]
			}, {
				test: /\.svg$/,
				loader: 'svg-url-loader'
			}, {
				test: /\.(png|woff|woff2|eot|ttf)$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 100000
					}
				}
			}
		]
	}
};
