
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
import RSVP from 'rsvp';
import globals from '../classes/Globals';
import conf from '../classes/Conf';
import dispatcher from '../classes/Dispatcher';
import { log } from '../utils/common';
import Api from '../utils/api';

const api = new Api();
const {
	GHOSTERY_DOMAIN, AUTH_SERVER, ACCOUNT_SERVER, SYNC_ARRAY, IS_CLIQZ, BROWSER_INFO
} = globals;
const IS_EDGE = (BROWSER_INFO.name === 'edge');
const SYNC_SET = new Set(SYNC_ARRAY);

class Account {
	constructor() {
		const apiConfig = {
			AUTH_SERVER,
			ACCOUNT_SERVER,
			CSRF_DOMAIN: GHOSTERY_DOMAIN
		};
		const opts = {
			errorHandler: errors => (
				new Promise((resolve) => {
					for (const err of errors) {
						switch (err.code) {
							case Api.ERROR_CSRF_COOKIE_NOT_FOUND:
							case '10020': // token is not valid
							case '10060': // user id does not match
							case '10180': // user ID not found
							case '10181': // user ID is missing
							case '10190': // refresh token is expired
							case '10200': // refresh token does not exist
							case '10201': // refresh token is missing
							case '10300': // csrf token is missing
							case '10301': // csrf tokens do not match
								return this.logout()
									.then(() => resolve())
									.catch(() => resolve());
							default:
								return resolve();
						}
					}
					return resolve();
				})
			)
		};
		api.init(apiConfig, opts);
		// logout on user_id cookie removed
		// NOTE: Edge does not support chrome.cookies.onChanged
		if (!IS_EDGE) {
			chrome.cookies.onChanged.addListener(this._logoutOnUserIDCookieRemoved);
		}
	}

	login = (email, password) => {
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

	register = (email, confirmEmail, password, firstName, lastName) => {
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

	logout = () => (
		new RSVP.Promise((resolve, reject) => {
			chrome.cookies.get({
				url: `https://${GHOSTERY_DOMAIN}.com`,
				name: 'csrf_token',
			}, (cookie) => {
				if (cookie === null) { return reject(); }
				return fetch(`${AUTH_SERVER}/api/v2/logout`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'X-CSRF-Token': cookie.value },
				}).then((res) => {
					if (res.status < 400) { return resolve(); }
					return res.json().then(json => reject(json));
				}).catch(err => reject(err));
			});
		}).finally(() => {
			// remove cookies in case fetch fails
			this._removeCookies();
			this._clearAccountInfo();
		})
	)

	getUser = () => (
		this._getUserID()
			.then(userID => api.get('users', userID))
			.then((res) => {
				const user = build(normalize(res), 'users', res.data.id);
				this._setAccountUserInfo(user);
				return user;
			})
	)

	getUserSettings = () => (
		this._getUserID()
			.then(userID => api.get('settings', userID))
			.then((res) => {
				const settings = build(normalize(res, { camelizeKeys: false }), 'settings', res.data.id);
				const { settings_json } = settings;
				// @TODO setConfUserSettings settings.settingsJson
				this._setConfUserSettings(settings_json);
				this._setAccountUserSettings(settings_json);
				return settings_json;
			})
	)

	saveUserSettings = () => (
		this._getUserID()
			.then(userID => (
				api.update('settings', {
					type: 'settings',
					id: userID,
					attributes: {
						settings_json: this._buildUserSettings()
					}
				})
			))
	)

	sendValidateAccountEmail = () => (
		this._getUserID()
			.then(userID => fetch(`${AUTH_SERVER}/api/v2/send_email/validate_account/${userID}`))
			.then(res => res.status < 400)
	)

	resetPassword = (email) => {
		const data = `email=${window.encodeURIComponent(email)}`;
		return fetch(`${AUTH_SERVER}/api/v2/send_email/reset_password`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data),
			},
		}).then((res) => {
			if (res.status >= 400) {
				return res.json();
			}
			return {};
		});
	}

	migrate = () => (
		new Promise((resolve) => {
			const legacyLoginInfoKey = 'login_info';
			chrome.storage.local.get(legacyLoginInfoKey, (items) => {
				if (chrome.runtime.lastError) {
					resolve(new Error(chrome.runtime.lastError));
					return;
				}

				const { login_info } = items;
				if (!items || !login_info) {
					resolve();
					return;
				}

				// ensure we have all the necessary info
				const { decoded_user_token, user_token } = login_info;
				if (!decoded_user_token || !user_token) {
					chrome.storage.local.remove(legacyLoginInfoKey, () => resolve());
					return;
				}
				const {
					UserId, csrf_token, RefreshToken, exp
				} = decoded_user_token;
				if (!UserId || !csrf_token || !RefreshToken || !exp) {
					chrome.storage.local.remove(legacyLoginInfoKey, () => resolve());
					return;
				}

				// set cookies
				Promise.all([
					this._setLoginCookie({
						name: 'refresh_token',
						value: RefreshToken,
						expirationDate: exp + 604800, // + 7 days
						httpOnly: true,
					}),
					this._setLoginCookie({
						name: 'access_token',
						value: user_token,
						expirationDate: exp,
						httpOnly: true,
					}),
					this._setLoginCookie({
						name: 'csrf_token',
						value: csrf_token,
						expirationDate: exp,
						httpOnly: false,
					}),
					this._setLoginCookie({
						name: 'user_id',
						value: UserId,
						expirationDate: 1893456000, // Tue Jan 1 2030 00:00:00 GMT. @TODO is this the best way of hanlding this?
						httpOnly: false,
					})
				]).then(() => {
					// login
					this._setAccountInfo(UserId);
					chrome.storage.local.remove(legacyLoginInfoKey, () => resolve());
				}).catch((err) => {
					resolve(err);
				});
			});
		})
	)

	/**
	 * Determines if the user has the required scope combination(s) to access a resource.
	 * It takes a rest parameter of string arrays, each of which must be a possible combination of
	 * scope strings that would allow a user to access a resource. For example, if the required
	 * scopes for a resource are "resource:read" AND "resource:write" OR ONLY "resource:god", call
	 * this function with parameters (['resource:read', 'resource:write'], ['resource:god'])
	 * IMPORTANT: this function does NOT verify the content of the user scopes, therefore scopes
	 * could have been tampered with.
	 *
	 * @param  {rest of string arrays}	string arrays containing the required scope combination(s)
	 * @return {boolean}				true if the user scopes match at least one of the required scope combination(s)
	 */
	hasScopesUnverified(...required) {
		if (conf.account === null) { return false; }
		if (conf.account.user === null) { return false; }
		const userScopes = conf.account.user.scopes;
		if (userScopes === null) { return false; }
		if (required.length === 0) { return false; }

		// check scopes
		if (userScopes.indexOf('god') >= 0) { return true; }
		for (const sArr of required) {
			let matches = true;
			if (sArr.length > 0) {
				for (const s of sArr) {
					if (userScopes.indexOf(s) === -1) {
						matches = false;
						break;
					}
				}
				if (matches) {
					return true;
				}
			}
		}
		return false;
	}

	_setLoginCookie = details => (
		new Promise((resolve, reject) => {
			const {
				name, value, expirationDate, httpOnly
			} = details;
			if (!name || !value) {
				reject(new Error(`One or more required values missing: ${JSON.stringify({ name, value })}`));
				return;
			}
			chrome.cookies.set({
				name,
				value,
				url: `https://${GHOSTERY_DOMAIN}.com`,
				domain: `.${GHOSTERY_DOMAIN}.com`,
				expirationDate,
				secure: true,
				httpOnly,
			}, (cookie) => {
				if (chrome.runtime.lastError || cookie === null) {
					reject(new Error(`Error setting cookie ${JSON.stringify(details)}: ${chrome.runtime.lastError}`));
					return;
				}
				resolve(cookie);
			});
		})
	)

	_getUserID = () => (
		new Promise((resolve, reject) => {
			if (conf.account === null) {
				return reject(new Error('_getUserID() Not logged in'));
			}
			return resolve(conf.account.userID);
		})
	)

	_setAccountInfo = (userID) => {
		conf.account = {
			userID,
			user: null,
			userSettings: null,
		};
	}

	_setAccountUserInfo = (user) => {
		conf.account.user = user;
		dispatcher.trigger('conf.save.account');
	}

	_setAccountUserSettings = (settings) => {
		conf.account.userSettings = settings;
		dispatcher.trigger('conf.save.account');
	}

	_clearAccountInfo = () => {
		conf.account = null;
	}

	_getUserIDFromCookie = () => (
		new Promise((resolve, reject) => {
			chrome.cookies.get({
				url: `https://${GHOSTERY_DOMAIN}.com`,
				name: 'user_id',
			}, (cookie) => {
				if (cookie) {
					resolve(cookie.value);
					return;
				}
				reject(new Error('err getting login user_id cookie'));
			});
		})
	)

	/**
	 * Create settings object for syncing.
	 * @memberOf BackgroundUtils
	 *
	 * @return {Object} 	jsonifyable settings object for syncing
	 */
	_buildUserSettings = () => {
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
	_setConfUserSettings = (settings) => {
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

	_removeCookies = () => {
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

	_logoutOnUserIDCookieRemoved = (changeInfo) => {
		const { removed, cookie } = changeInfo;
		const { name, domain } = cookie;
		if (name === 'user_id' && domain === `.${GHOSTERY_DOMAIN}.com` && removed) {
			this.logout();
		}
	}
}

// Return the class as a singleton
export default new Account();
