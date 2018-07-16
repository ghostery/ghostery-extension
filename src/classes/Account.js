
/**
 * User Accounts
 *
 * Provides functionality for login, create account and settings sync.
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

// @TODO: Somebody please fix these

/* eslint no-use-before-define: 0 */
/* eslint prefer-promise-reject-errors: 0 */
/* eslint prefer-destructuring: 0 */
/* eslint no-shadow: 0 */
/* eslint no-param-reassign: 0 */

import _ from 'underscore';
import normalize from 'json-api-normalizer';
import build from 'redux-object';
import globals from '../classes/Globals';
import conf from '../classes/Conf';
import { log } from '../utils/common';
import { get, update, getCsrfCookie } from '../utils/api';

const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const { IS_CLIQZ } = globals;

// CONSTANTS
const { GHOSTERY_DOMAIN } = globals;
const SYNC_SET = new Set(globals.SYNC_ARRAY);

class Account {
	setAccountInfo(userID) {
		conf.account = {
			userID,
			user: null,
			userSettings: null,
		};
	}

	setAccountUserInfo(user) {
		conf.account.user = user;
	}

	setAccountUserSettings(settings) {
		conf.account.userSettings = settings;
	}

	clearAccountInfo() {
		conf.account = null;
	}

	login(email, password) {
		const data = `email=${window.encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
		return fetch(`${globals.AUTH_SERVER}/api/v2/login`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data),
			},
			credentials: 'include',
		}).then((response) => {
			if (response.status >= 400) {
				return response.json();
			}
			this._getUserIDFromCookie().then((userID) => {
				this.setAccountInfo(userID);
			});
			return Promise.resolve({});
		});
	}

	logout() {
		return getCsrfCookie()
			.then(cookie => fetch(`${globals.AUTH_SERVER}/api/v2/logout`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRF-Token': cookie.value,
				},
			}))
			.finally(() => {
				// remove cookies in case fetch fails
				this._removeCookies();
				this.clearAccountInfo();
			});
	}

	getUser() {
		const { userID } = conf.account;
		return get('users', userID)
			.then((res) => {
				const user = build(normalize(res), 'users', userID);
				this.setAccountUserInfo(user);
				return user;
			});
	}

	getUserSettings() {
		const { userID } = conf.account;
		return get('settings', userID)
			.then((res) => {
				const settings = build(normalize(res, { camelizeKeys: false }), 'settings', userID);
				const { settings_json } = settings;
				// @TODO setConfUserSettings settings.settingsJson
				this.setConfUserSettings(settings_json);
				this.setAccountUserSettings(settings_json);
				return settings_json;
			});
	}

	saveUserSettings() {
		const { userID } = conf.account;
		return update('settings', {
			type: 'settings',
			id: userID,
			attributes: {
				settings_json: this._buildUserSettings()
			}
		});
	}

	_getUserIDFromCookie() {
		return new Promise((resolve, reject) => {
			chrome.cookies.get({
				url: `https://${GHOSTERY_DOMAIN}.com`, // ghostery.com || ghosterystage.com
				name: 'user_id',
			}, (cookie) => {
				if (cookie) {
					resolve(cookie.value);
					return;
				}
				reject('err getting login user_id cookie');
			});
		});
	}

	/**
	 * Return current login state.
	 * @memberOf BackgroundUtils
	 *
	 * @return {Promise} 	current login state
	 */
	// getLoginInfo() {
	// 	return new Promise((resolve, reject) => {
	// 		resolve(conf.login_info);
	// 	});
	// }

	/**
	 * Create settings object for syncing.
	 * @memberOf BackgroundUtils
	 *
	 * @return {Object} 	jsonifyable settings object for syncing
	 */
	_buildUserSettings() {
		const settings = {};
		const now = Number(new Date().getTime());
		SYNC_SET.forEach((key) => {
			// Whenever we prepare data to be sent out
			// we have to convert these two parameters to objects
			// so that they may be imported by pre-8.2 version
			if (key === 'reload_banner_status' ||
				key === 'trackers_banner_status') {
				settings[key] = {
					dismissals: [],
					show_time: now,
					show: conf[key]
				};
			} else {
				settings[key] = conf[key];
			}
		});
		return settings;
	}

	resetPassword(data) {
		return fetch(`${globals.AUTH_SERVER}/api/v2/send_email/reset_password`, { // eslint-disable-line no-undef
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data),
			},
		})
			.then((response) => {
				if (response.status >= 400) {
					return response.json().then(json => Promise.resolve(json));
				}
				return Promise.resolve(response);
			})
			.catch(err => Promise.reject(err));
	}

	_removeCookies() {
		const cookies = ['user_id', 'access_token', 'refresh_token', 'csrf_token', 'AUTH'];
		cookies.forEach((name) => {
			chrome.cookies.remove({
				url: `https://${GHOSTERY_DOMAIN}.com`, // ghostery.com || ghosterystage.com
				name,
			}, (details) => {
				log(`Removed cookie with name: ${details.name}`);
			});
		});
	}

	/**
	 * GET user settings from ConsumerAPI
	 * @private
	 *
	 * @return {Promise} 	user settings json or error
	 */
	setConfUserSettings(settings) {
		log('SET USER SETTINGS', settings);
		if (IS_EDGE) {
			settings.enable_human_web = false;
			settings.enable_offers = false;
		}
		if (IS_CLIQZ) {
			settings.enable_human_web = false;
			settings.enable_offers = false;
			settings.enable_ad_block = false;
			settings.enable_anti_tracking = false;
		}
		SYNC_SET.forEach((key) => {
			if (settings[key] !== undefined &&
				!_.isEqual(conf[key], settings[key])) {
				conf[key] = settings[key];
			}
		});
		return settings;
	}

	sendVerificationEmail() {
		return new Promise((resolve, reject) => {
			fetch(`${globals.AUTH_SERVER}/api/v2/send_email/validate_account/${conf.login_info.user_id}`)
				.then((res) => {
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	createAccount(data) {
		return fetch(`${globals.AUTH_SERVER}/api/v2/register`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data),
			},
			credentials: 'include',
		})
			.then((response) => {
				if (response.status >= 400) {
					return response.json().then(json => Promise.resolve(json));
				}
				return Promise.resolve(response);
			})
			.catch(err => Promise.reject(err));
	}
}

// Return the class as a singleton
export default new Account();
