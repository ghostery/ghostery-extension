
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

import _ from 'underscore';
import normalize from 'json-api-normalizer';
import build from 'redux-object';
import globals from '../classes/Globals';
import conf from '../classes/Conf';
import dispatcher from '../classes/Dispatcher';
import { log } from '../utils/common';
import { get, update, getCsrfCookie } from '../utils/api';

const {
	GHOSTERY_DOMAIN, AUTH_SERVER, SYNC_ARRAY, IS_CLIQZ, BROWSER_INFO
} = globals;
const IS_EDGE = (BROWSER_INFO.name === 'edge');
const SYNC_SET = new Set(SYNC_ARRAY);

class Account {
	login(email, password) {
		const data = `email=${window.encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
		return fetch(`${AUTH_SERVER}/api/v2/login`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data),
			},
			credentials: 'include',
		}).then((res) => {
			if (res.status >= 400) {
				return res.json();
			}
			this._getUserIDFromCookie().then((userID) => {
				this._setAccountInfo(userID);
			});
			return {};
		});
	}

	register(email, confirmEmail, password, firstName, lastName) {
		const data = `email=${window.encodeURIComponent(email)}&email_confirmation=${window.encodeURIComponent(confirmEmail)}&first_name=${window.encodeURIComponent(firstName)}&last_name=${window.encodeURIComponent(lastName)}&password=${window.encodeURIComponent(password)}`;
		return fetch(`${AUTH_SERVER}/api/v2/register`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data),
			},
			credentials: 'include',
		}).then((res) => {
			if (res.status >= 400) {
				return res.json();
			}
			this._getUserIDFromCookie().then((userID) => {
				this._setAccountInfo(userID);
			});
			return {};
		});
	}

	logout() {
		return getCsrfCookie()
			.then(cookie => fetch(`${AUTH_SERVER}/api/v2/logout`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRF-Token': cookie.value,
				},
			}))
			.finally(() => {
				// remove cookies in case fetch fails
				this._removeCookies();
				this._clearAccountInfo();
			});
	}

	getUser() {
		const { userID } = conf.account;
		return get('users', userID)
			.then((res) => {
				const user = build(normalize(res), 'users', userID);
				this._setAccountUserInfo(user);
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
				this._setConfUserSettings(settings_json);
				this._setAccountUserSettings(settings_json);
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

	sendValidateAccountEmail() {
		const { userID } = conf.account;
		return fetch(`${AUTH_SERVER}/api/v2/send_email/validate_account/${userID}`)
			.then(res => res.status < 400);
	}

	resetPassword(email) {
		const data = `email=${window.encodeURIComponent(email)}`;
		return fetch(`${AUTH_SERVER}/api/v2/send_email/reset_password`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data),
			},
		})
			.then((res) => {
				if (res.status >= 400) {
					return res.json();
				}
				return {};
			});
	}

	_setAccountInfo(userID) {
		conf.account = {
			userID,
			user: null,
			userSettings: null,
		};
	}

	_setAccountUserInfo(user) {
		conf.account.user = user;
		dispatcher.trigger('conf.save.account');
	}

	_setAccountUserSettings(settings) {
		conf.account.userSettings = settings;
		dispatcher.trigger('conf.save.account');
	}

	_clearAccountInfo() {
		conf.account = null;
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
				reject(new Error('err getting login user_id cookie'));
			});
		});
	}

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

	/**
	 * GET user settings from ConsumerAPI
	 * @private
	 *
	 * @return {Promise} 	user settings json or error
	 */
	_setConfUserSettings(settings) {
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

	_removeCookies() {
		const cookies = ['user_id', 'access_token', 'refresh_token', 'csrf_token', 'AUTH'];
		cookies.forEach((name) => {
			chrome.cookies.remove({
				url: `https://${GHOSTERY_DOMAIN}.com`,
				name,
			}, (details) => {
				log(`Removed cookie with name: ${details.name}`);
			});
		});
	}
}

// Return the class as a singleton
export default new Account();
