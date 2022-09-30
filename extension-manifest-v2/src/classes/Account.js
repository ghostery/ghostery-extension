/**
 * User Accounts
 *
 * Provides functionality for login, create account and settings sync.
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { isEqual } from 'underscore';
import normalize from 'json-api-normalizer';
import build from 'redux-object';
import globals from './Globals';
import conf from './Conf';
import dispatcher from './Dispatcher';
import { alwaysLog, log } from '../utils/common';
import Api from '../utils/api';
import metrics from './MetricsWrapper';
import ghosteryDebugger from './Debugger';
import { cookiesGet, setAllLoginCookies, cookiesRemove } from '../utils/cookies';

const api = new Api();
const {
	COOKIE_URL, AUTH_SERVER, ACCOUNT_SERVER, SYNC_ARRAY
} = globals;

const SYNC_SET = new Set(SYNC_ARRAY);

class Account {
	constructor() {
		const apiConfig = {
			AUTH_SERVER,
			ACCOUNT_SERVER,
			COOKIE_URL
		};
		const opts = {
			errorHandler: errors => (
				new Promise((resolve, reject) => {
					for (let i = 0; i < errors.length; i++) {
						const err = errors[i];
						switch (err.code) {
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
							case '10030': // email not validated
							case 'not-found':
								return reject(err);
							default:
								return resolve();
						}
					}
					return resolve();
				})
			)
		};
		api.init(apiConfig, opts);
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
			credentials: 'omit',
		}).then((res) => {
			if (res.status >= 400) {
				throw res.json();
			}
			return res.json();
		}).then(response => setAllLoginCookies({
			accessToken: response.access_token,
			refreshToken: response.refresh_token,
			csrfToken: response.csrf_token,
			userId: response.user_id,
		})).then(() => {
			ghosteryDebugger.addAccountEvent('login', 'cookie set by fetch POST');
			this._getUserIDFromCookie().then((userID) => {
				this._setAccountInfo(userID);
				this.getUserSubscriptionData({ calledFrom: 'login' });
			});
			return {};
		}).catch((err) => {
			alwaysLog(err);
			return err;
		});
	}

	async logout() {
		try {
			const csrfCookie = await cookiesGet({ name: 'csrf_token' });
			const accessTokenCookie = await cookiesGet({ name: 'access_token' });
			if (!csrfCookie || !accessTokenCookie) {
				throw new Error('no cookie');
			}
			const res = await fetch(`${AUTH_SERVER}/api/v2/logout`, {
				method: 'POST',
				credentials: 'omit',
				headers: {
					'X-CSRF-Token': csrfCookie.value,
					Authorization: `Bearer ${accessTokenCookie.value}`,
				},
			});
			if (res.status < 400) {
				ghosteryDebugger.addAccountEvent('logout', 'cookie set by fetch POST');
				return;
			}
			throw new Error(await res.json());
		} finally {
			// remove cookies in case fetch fails
			this._removeCookies();
			this._clearAccountInfo();
		}
	}

	refreshToken = () => api.refreshToken()

	// @TODO a 404 here should trigger a logout
	getUser = () => (
		this._getUserID()
			.then(userID => api.get('users', userID))
			.then((res) => {
				if (Array.isArray(res?.errors) && res.errors.length > 0) {
					log('We have a userID but we are not able to get data from the server. Force a logout. Errors:', res.errors);
					throw new Error('Unable to fetch the user acount (forcing logout)');
				}
				if (!res.data?.id) {
					alwaysLog('Unexpected case: the server sent missing data:', res);
					throw new Error('User not properly logged in (got corrupted response)');
				}
				const user = build(normalize(res), 'users', res.data.id);
				this._setAccountUserInfo(user);
				return user;
			})
	)

	getUserSettings = () => (
		this._getUserIDIfEmailIsValidated()
			.then(userID => api.get('settings', userID))
			.then((res) => {
				const settings = build(normalize(res, { camelizeKeys: false }), 'settings', res.data.id);
				const { settings_json } = settings;

				// if not onboarded do not let sync toggle the ONBOARDED_FEATURES features
				if (!conf.setup_complete) {
					globals.ONBOARDED_FEATURES.forEach((confName) => {
						delete settings_json[confName];
					});
				}

				// @TODO setConfUserSettings settings.settingsJson
				this._setConfUserSettings(settings_json);
				this._setAccountUserSettings(settings_json);
				return settings_json;
			})
			// Fetching the settings from the account server failed,
			// or they have simply never been synced to the account server yet
			// In that case, just use the local settings
			.catch(() => this.buildUserSettings())
	)

	/**
	 * @return {array}	All subscriptions the user has, empty if none
	*/
	getUserSubscriptionData = options => (
		this._getUserID()
			.then(userID => api.get('stripe/customers', userID, 'cards,subscriptions'))
			.then((res) => {
				const customer = build(normalize(res), 'customers', res.data.id);

				// TODO temporary fix to handle multiple subscriptions
				let sub = customer.subscriptions;
				if (!Array.isArray(sub)) {
					sub = [sub];
				}

				const subscriptions = [];

				const premiumSubscription = sub.find(subscription => subscription.productName.includes('Ghostery Premium'));
				if (premiumSubscription) {
					subscriptions.push(premiumSubscription);
					this._setSubscriptionData(premiumSubscription);
				}

				const plusSubscription = sub.find(subscription => subscription.productName.includes('Ghostery Plus'));
				if (plusSubscription) {
					subscriptions.push(plusSubscription);
					if (!premiumSubscription) {
						this._setSubscriptionData(plusSubscription);
					}
				}

				return subscriptions;
			})
			.finally(() => {
				if (options && options.calledFrom === 'login') {
					metrics.ping('sign_in_success');
				}
			})
	)

	saveUserSettings = () => (
		this._getUserIDIfEmailIsValidated()
			.then(userID => (
				api.update('settings', {
					type: 'settings',
					id: userID,
					attributes: {
						settings_json: this.buildUserSettings()
					}
				})
			))
	)

	getTheme = name => (
		this._getUserID()
			.then(() => {
				const now = Date.now();
				const { themeData } = conf.account;
				if (!themeData || !themeData[name]) { return true; }
				const { timestamp } = themeData[name];
				return now - timestamp > 86400000; // true if 24hrs have passed
			})
			.then((shouldGet) => {
				if (!shouldGet) {
					return conf.account.themeData[name].css;
				}
				return api.get('themes', `${name}.css`)
					.then((res) => {
						const { css } = build(normalize(res), 'themes', res.data.id);
						this._setThemeData({ name, css });
						return css;
					});
			})
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
			ghosteryDebugger.addAccountEvent('migrate', 'migrate start');
			const legacyLoginInfoKey = 'login_info';
			chrome.storage.local.get(legacyLoginInfoKey, (items) => {
				if (chrome.runtime.lastError) {
					ghosteryDebugger.addAccountEvent('migrate', 'runtime error');
					resolve(chrome.runtime.lastError);
					return;
				}

				const { login_info } = items;
				if (!items || !login_info) {
					ghosteryDebugger.addAccountEvent('migrate', 'no items found');
					resolve();
					return;
				}

				// ensure we have all the necessary info
				const { decoded_user_token, user_token } = login_info;
				if (!decoded_user_token || !user_token) {
					ghosteryDebugger.addAccountEvent('migrate', 'found items, not enough info I');
					chrome.storage.local.remove(legacyLoginInfoKey, () => resolve());
					return;
				}
				const {
					UserId, csrf_token, RefreshToken, exp
				} = decoded_user_token;
				if (!UserId || !csrf_token || !RefreshToken || !exp) {
					ghosteryDebugger.addAccountEvent('migrate', 'found items, not enough info II');
					chrome.storage.local.remove(legacyLoginInfoKey, () => resolve());
					return;
				}

				// set cookies
				this._setAllLoginCookies({
					refreshToken: RefreshToken,
					accessToken: user_token,
					csrfToken: csrf_token,
					userId: UserId,
					expirationDate: exp,
				}).then(() => {
					// login
					this._setAccountInfo(UserId);
					this.getUserSubscriptionData();
					ghosteryDebugger.addAccountEvent('migrate', 'remove legacy items');
					chrome.storage.local.remove(legacyLoginInfoKey, () => resolve());
				}).catch((err) => {
					ghosteryDebugger.addAccountEvent('migrate', 'cookies set error');
					resolve(err);
				});
			});
		})
			.then(async () => {
				// Checks if user is already logged in
				// @TODO move this into an init() function
				if (conf.account) {
					return;
				}
				const cookie = await cookiesGet({ name: 'user_id' });
				if (cookie) {
					this._setAccountInfo(cookie.value);
					this.getUserSubscriptionData();
				}
			})
			// should not break the init path
			.catch(e => alwaysLog(e))
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
	 * @param  {...array}	string arrays containing the required scope combination(s)
	 * @return {boolean}				true if the user scopes match at least one of the required scope combination(s)
	 */
	hasScopesUnverified = (...required) => {
		if (!conf.account) { return false; }
		if (!conf.account.user) { return false; }
		const userScopes = conf.account.user.scopes;
		if (!userScopes) { return false; }
		if (required.length === 0) { return false; }

		// check scopes
		if (userScopes.indexOf('god') >= 0) { return true; }
		for (let i = 0; i < required.length; i++) {
			const sArr = required[i];
			let matches = true;
			if (sArr.length > 0) {
				for (let j = 0; j < sArr.length; j++) {
					const s = sArr[j];
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

	/**
	 * Create settings object for syncing and/or Export.
	 * @memberOf BackgroundUtils
	 *
	 * @return {Object} 	jsonifyable settings object for syncing
	 */
	buildUserSettings = () => {
		const settings = {};
		const now = Date.now();
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

	async _getUserID() {
		if (!conf.account) {
			try {
				const userID = await this._getUserIDFromCookie();
				if (userID) {
					log('Found user ID', userID, 'in cookies');
					this._setAccountInfo(userID);
				}
			} catch (e) {
				log('Unable to get userID from cookie');
			}
		}
		const userID = conf.account?.userID;
		if (!userID) {
			throw new Error('_getUserID: cannot find userID (neither in account or cookies)');
		}
		return userID;
	}


	_getUserIDIfEmailIsValidated = () => (
		this._getUserID()
			.then(userID => (
				new Promise((resolve, reject) => {
					const { user } = conf.account;
					if (!user) {
						return this.getUser()
							.then((u) => {
								if (u.emailValidated !== true) {
									return reject(new Error('_getUserIDIfEmailIsValidated() Email not validated'));
								}
								return resolve(userID);
							});
					}
					if (!user.emailValidated) {
						return reject(new Error('_getUserIDIfEmailIsValidated() Email not validated'));
					}
					return resolve(userID);
				})
			))
	)

	_setAccountInfo = (userID) => {
		conf.account = {
			userID,
			user: null,
			userSettings: null,
			subscriptionData: null,
			themeData: null,
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

	_setSubscriptionData = (data) => {
		// TODO: Change this so that we aren't writing over data
		if (!conf.paid_subscription && data) {
			conf.paid_subscription = true;
			dispatcher.trigger('conf.save.paid_subscription');
		}
		conf.account.subscriptionData = data || null;
		dispatcher.trigger('conf.save.account');
	}

	_setThemeData = (data) => {
		if (!conf.account.themeData) {
			conf.account.themeData = {};
		}
		const { name } = data;
		conf.account.themeData[name] = { timestamp: Date.now(), ...data };
		dispatcher.trigger('conf.save.account');
	}

	_clearAccountInfo = () => {
		conf.account = null;
		conf.current_theme = 'default';
	}

	_getUserIDFromCookie = async () => {
		const cookie = await cookiesGet({ name: 'user_id' });
		if (!cookie) {
			throw new Error('err getting login user_id cookie');
		}
		return cookie.value;
	}

	/**
	 * GET user settings from ConsumerAPI
	 * @private
	 *
	 * @return {Promise} 	user settings json or error
	 */
	_setConfUserSettings = (settings) => {
		const returnedSettings = { ...settings };
		log('SET USER SETTINGS', returnedSettings);
		SYNC_SET.forEach((key) => {
			if (returnedSettings[key] !== undefined &&
				!isEqual(conf[key], returnedSettings[key])) {
				conf[key] = returnedSettings[key];
			}
		});
		return returnedSettings;
	}

	_removeCookies = () => {
		const cookies = ['user_id', 'access_token', 'refresh_token', 'csrf_token', 'AUTH'];
		cookies.forEach(async (name) => {
			try {
				await cookiesRemove({ name });
				log(`Removed cookie with name: ${name}`);
			} catch (e) {
				log(`Could not remove cookie with a name: ${name}`, e);
			}
		});
	}
}

// Return the class as a singleton
export default new Account();
