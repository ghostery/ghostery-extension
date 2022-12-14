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
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const ESLintPlugin = require('eslint-webpack-plugin');
const sass = require('sass');
const crypto = require('crypto');

// Webpack uses obsolete hash algorithm which is no longer provided
// by the node crypto package. This walkaround can be removed after
// Webpack version is updated.
const crypto_orig_createHash = crypto.createHash;
crypto.createHash = algorithm => crypto_orig_createHash(algorithm === 'md4' ? 'sha256' : algorithm);

// constants
const BUILD_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');
const APP_DIR = path.resolve(__dirname, 'app');
const SHARED_COMP_DIR = path.resolve(__dirname, 'app/shared-components');
const ONBOARDING_DIR = path.resolve(__dirname, 'app/onboarding');
const PANEL_DIR = path.resolve(__dirname, 'app/panel');
const PANEL_ANDROID_DIR = path.resolve(__dirname, 'app/panel-android');
const LICENSES_DIR = path.resolve(__dirname, 'app/licenses');
const SASS_DIR = path.resolve(__dirname, 'app/scss');
const CONTENT_SCRIPTS_DIR = path.resolve(__dirname, 'app/content-scripts');
const TRACKERS_PREVIEW_DIR = path.resolve(__dirname, 'app/trackers-preview');
const AUTOCONSENT_DIR = path.resolve(__dirname, 'app/autoconsent');
const RM = (process.platform === 'win32') ? 'powershell remove-item' : 'rm';

module.exports = {
	// devtool: 'source-maps',
	performance: {
		hints: false // notify of assets over 250kb
	},
	resolve: {
		mainFields: ['main'],
		symlinks: false, // allow module resolution with `npm link`
		extensions: ['.js', '.jsx'], // allow leaving off file extension when importing
		alias: {
			'@ghostery/ui$': path.resolve(__dirname, 'node_modules/@ghostery/ui/src/index.js'),
			'@ghostery/ui/autoconsent$': path.resolve(__dirname, 'node_modules/@ghostery/ui/src/modules/autoconsent/index.js'),
			'@ghostery/ui/autoconsent/iframe$': path.resolve(__dirname, 'node_modules/@ghostery/ui/src/modules/autoconsent/iframe.js'),
			'@ghostery/ui/onboarding$': path.resolve(__dirname, 'node_modules/@ghostery/ui/src/modules/onboarding/index.js'),
			'@ghostery/ui/trackers-preview$': path.resolve(__dirname, 'node_modules/@ghostery/ui/src/modules/trackers-preview/index.js'),
			'@ghostery/ui/wheel$': path.resolve(__dirname, 'node_modules/@ghostery/ui/src/utils/wheel.js'),
			'@ghostery/libs$': path.resolve(__dirname, 'node_modules/@ghostery/libs/src/index.js'),
		},
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
		licenses_react: [`${LICENSES_DIR}/Licenses.jsx`, `${LICENSES_DIR}/License.jsx`],
		notifications: [`${CONTENT_SCRIPTS_DIR}/notifications.js`],
		page_performance: [`${CONTENT_SCRIPTS_DIR}/page_performance.js`],
		panel_android_react: [`${PANEL_ANDROID_DIR}/index.jsx`],
		panel_react: [`${PANEL_DIR}/index.jsx`],
		onboarding: [`${ONBOARDING_DIR}/index.js`],
		purplebox: [`${CONTENT_SCRIPTS_DIR}/purplebox.js`],
		shared_comp_react: [`${SHARED_COMP_DIR}/index.js`],
		trackers_preview_popup: [`${TRACKERS_PREVIEW_DIR}/index.js`],
		trackers_preview_content_script: [`${CONTENT_SCRIPTS_DIR}/trackers-preview.js`],
		autoconsent_popup: [`${AUTOCONSENT_DIR}/index.js`],

		// Sass
		foundation: [`${SASS_DIR}/vendor/foundation.scss`],
		licenses: [`${SASS_DIR}/licenses.scss`],
		onboarding_styles: [`${SASS_DIR}/onboarding.scss`],
		panel: [`${SASS_DIR}/panel.scss`],
		panel_android: [`${SASS_DIR}/panel_android.scss`],
		purplebox_styles: [`${SASS_DIR}/purplebox.scss`],
		ghostery_ui: [`${SASS_DIR}/ghostery_ui.scss`],
		trackers_preview_content_script_styles: [`${SASS_DIR}/trackers-preview_content_script.scss`],
	},
	output: {
		filename: '[name].js',
		path: BUILD_DIR,
		hashFunction: 'sha256',
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
			onBuildExit: [
				`${RM} ./dist/foundation.js`,
				`${RM} ./dist/licenses.js`,
				`${RM} ./dist/panel.js`,
				`${RM} ./dist/panel_android.js`,
				`${RM} ./dist/purplebox_styles.js`,
			]
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
		new ESLintPlugin({
			extensions: ['js', 'jsx']
		}),
	],
	optimization: {
		minimizer: [
			new ESBuildMinifyPlugin({
				target: 'es2015',
			}),
		],
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
				test: /\.(js|jsx)$/,
				include: [APP_DIR, SRC_DIR],
				exclude: /node_modules/,
				use: [
					{
						loader: 'esbuild-loader',
						options: {
							loader: 'jsx',
							target: 'es2015',
						}
					},
				]
			},
			{
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
							implementation: sass,
							sassOptions: {
								includePaths: [
									path.resolve(__dirname, 'node_modules/foundation-sites/scss'),
									path.resolve(__dirname, 'app/scss'),
								]
							}
						},
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
						limit: 200000
					}
				},
				type: 'javascript/auto'
			}
		]
	}
};
