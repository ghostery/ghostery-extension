/**
 * Webpack Config
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// depenencies
const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackShellPlugin = require('webpack-shell-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const spawnSync = require('child_process').spawnSync;

// constants
const BUILD_DIR = path.resolve(__dirname, 'dist');
const CLIQZ_DIR = path.resolve(__dirname, 'cliqz');
const SRC_DIR = path.resolve(__dirname, 'src');
const PANEL_DIR = path.resolve(__dirname, 'app/panel');
const PANEL_ANDROID_DIR = path.resolve(__dirname, 'app/panel-android');
const SETUP_DIR = path.resolve(__dirname, 'app/setup');
const LICENSES_DIR = path.resolve(__dirname, 'app/licenses');
const SASS_DIR = path.resolve(__dirname, 'app/scss');
const CONTENT_SCRIPTS_DIR = path.resolve(__dirname, 'app/content-scripts');
const RM = (process.platform === 'win32') ? 'powershell remove-item' : 'rm';

// webpack plugins

const extractSass = new MiniCssExtractPlugin({
	filename: "css/[name].css"
});

// @TODO: Refactor so this isn't necessary
const cleanTmpStyleFiles = new WebpackShellPlugin({
	onBuildEnd: [
		`${RM} ./dist/foundation.js`,
		`${RM} ./dist/licenses.js`,
		`${RM} ./dist/panel.js`,
		`${RM} ./dist/panel_android.js`,
		`${RM} ./dist/purplebox_styles.js`,
		`${RM} ./dist/setup.js`,
		`${RM} ./dist/ghostery_dot_com_css.js`
	]
});

const t = function (messageName, substitutions) {
	return chrome.i18n.getMessage(messageName, substitutions);
};

const lintOnChange = function() {
	// @TODO: Why it fails on Windows?
	if ((process.argv.includes('--env.nolint') || process.env.NO_LINT) ||
		process.platform === 'win32') {
		return;
	}
	const args = ['run', 'lint'];
	if (process.argv.includes('--env.fix')) {
		args.push('--', '--fix')
	}
	let lint = spawnSync('npm', args, { stdio: 'inherit'});
	if (lint.status !== 0) {
		process.exit(lint.status);
	}
};

lintOnChange.prototype.apply = function(compiler) {
	if (process.argv.includes('--env.prod') || (process.argv.includes('--env.nolint') || process.env.NO_LINT)) {
		return;
	}
	compiler.plugin("done", () => {
		const changedTimes = compiler.watchFileSystem.watcher.mtimes;
		const changedFiles = Object.keys(changedTimes).filter((file) => {
			return file.indexOf('.js') !== -1;
		});
		if (changedFiles.length) {
			const args = ['run', 'lint.raw', '--', ...changedFiles];
			if (process.argv.includes('--env.fix')) {
				args.push('--fix')
			}
			setTimeout(() => {
				spawnSync('npm', args, { stdio: 'inherit'});
			});
		}
	});
};

const buildPlugins = [
	new CleanWebpackPlugin('./dist/*'),
	new webpack.IgnorePlugin(/(locale)/, /node_modules.+(moment)/), // fix for Error: Can't resolve './locale'
	new lintOnChange(),
	extractSass,
	cleanTmpStyleFiles,
	new webpack.DefinePlugin({
		't': t,
	}),
	new webpack.BannerPlugin({
		banner: "if(typeof browser!=='undefined'){chrome=browser;}",
		raw: true,
		include: /\.js$/
	})
];

// configs
const config = {
	entry: {
		background: [SRC_DIR + '/background.js'],
		blocked_redirect: [CONTENT_SCRIPTS_DIR + '/blocked_redirect.js'],
		click_to_play: [CONTENT_SCRIPTS_DIR + '/click_to_play.js'],
		ghostery_dot_com: [CONTENT_SCRIPTS_DIR + '/ghostery_dot_com.js'],
		notifications: [CONTENT_SCRIPTS_DIR + '/notifications.js'],
		page_performance: [CONTENT_SCRIPTS_DIR + '/page_performance.js'],
		platform_pages: [CONTENT_SCRIPTS_DIR + '/platform_pages.js'],
		purplebox: [CONTENT_SCRIPTS_DIR + '/purplebox.js'],
		content_script_bundle: [CLIQZ_DIR + '/core/content-script.bundle.js'],
		panel_react: [PANEL_DIR + '/index.jsx'],
		panel_android_js: [PANEL_ANDROID_DIR + '/index.jsx'],
		setup_react: [SETUP_DIR + '/index.jsx'],
		licenses_react: [LICENSES_DIR + '/Licenses.jsx', LICENSES_DIR + '/License.jsx'],
		foundation: [SASS_DIR + '/vendor/foundation.scss'],
		ghostery_dot_com_css: [SASS_DIR + '/ghostery_dot_com.scss'],
		panel: [SASS_DIR + '/panel.scss'],
		panel_android: [SASS_DIR + '/panel_android.scss'],
		panel_android_ui: [SASS_DIR + '/panel_android_ui.scss'],
		purplebox_styles: [SASS_DIR + '/purplebox.scss'],
		setup: [SASS_DIR + '/setup.scss'],
		licenses: [SASS_DIR + '/licenses.scss'],
	},
	devtool: 'none',
	performance: { hints: false },
	output: {
		filename: '[name].js',
		path: BUILD_DIR
	},
	resolve: {
		symlinks: false,
		extensions: ['.js', '.jsx']
	},
	plugins: buildPlugins,
	module: {
		rules: [
			{
				test: /\.(html)$/,
				use: {
					loader: 'html-loader'
				}
			},{
				test : /\.jsx?/,
				include : [PANEL_ANDROID_DIR, PANEL_DIR, SETUP_DIR, LICENSES_DIR],
				use: {
					loader: 'babel-loader'
				}
			},{
				test: /\.scss?/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader"
					}, {
						loader: "sass-loader",
						options: {
							sourceMap: false,
							precision: 8,
							includePaths: [
								path.resolve(__dirname, 'node_modules/foundation-sites/scss'),
							]
						},
					}]
			},{
				test: /\.svg$/,
				loader: 'svg-url-loader'
			},{
				test: /\.(png|woff|woff2|eot|ttf)$/,
				loader: 'url-loader?limit=100000'
			}
		]
	}
};

module.exports = config;
