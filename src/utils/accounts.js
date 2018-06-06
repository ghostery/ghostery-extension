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
import globals from '../classes/Globals';
import conf from '../classes/Conf';
import { log, decodeJwt } from './common';
import { getJson, postJson, sendMessageToPanel } from './utils';

const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const { IS_CLIQZ } = globals;

// CONSTANTS
const { GHOSTERY_DOMAIN } = globals;
// @TODO const API_ROOT_URL = `https://consumerapi.${GHOSTERY_DOMAIN}.com`;
const API_ROOT_URL = `https://localhost:8080`;
const VERIFICATION_URL = `https://signon.${GHOSTERY_DOMAIN}.com/register/verify/`; // can't set culture because site needs to append guid
const REDIRECT_URL = `https://account.${GHOSTERY_DOMAIN}.com/`;
const SIGNON_URL = `https://signon.${GHOSTERY_DOMAIN}.com/`; // culture query param not needed, only for cookie
const AUTH_COOKIE = 'AUTH';
// milliseconds. Refresh call will be made REFRESH_OFFSET seconds in advance of Account expiration.
const REFRESH_OFFSET = 60000;
const LOGOUT_TIMEOUT = 604800000; // one week in millisec
const GROUND_ZERO_TIME = (new Date(0)).getTime();
const SYNC_SET = new Set(globals.SYNC_ARRAY);

/**
 * Set the login state of the current user.
 *
 * setLoginInfo is called in multiple cases:
 * - user creates account or logs in/out - called in response to setLoginInfo message
 * - user navigated to a ghostery page with AUTH cookie on it, called by
 * setLoginInfoFromAuthCookie() onAttach to page.
 * @memberOf BackgroundUtils
 *
 * @param {Object} message 			Contains user_token and decoded_user_token
 * @param {boolean} fromCookie 		indicates that this function is
 *                              	called by setLoginInfoFromAuthCookie
 *
 * @return {Promise} 				login info object
 */
export function setLoginInfo() {
	/* @TODO
		- get user info from /api/v2/users/{userid}
		- email will be in response. store it in conf.login_info
		- use extension cookie API to get user_id cookie
	*/
	return new Promise((resolve, reject) => {
		chrome.cookies.get({
			url: 'localhost', // ghostery.com || ghosterystage.com
			name: 'user_id',
		}, cookie => {
			conf.login_info = {
				logged_in: true,
				user_id: cookie.value
				// user_token,
				// decoded_user_token,
				// is_validated // (email validation) get from user endpoint
			};
			resolve(cookie.value);
		});
	});

}

/**
 * Return current login state.
 * @memberOf BackgroundUtils
 *
 * @return {Promise} 	current login state
 */
export function getLoginInfo() {
	return _refreshToken().then(wasRefreshed => conf.login_info)
		.catch((err) => {
			_logOut();
			log('getLoginInfo error:', err);
			return conf.login_info;
		});
}

/**
 * Create settings object for syncing.
 * @memberOf BackgroundUtils
 *
 * @return {Object} 	jsonifyable settings object for syncing
 */
export function buildUserSettings() {
	const settings = {};
	const nowTime = Number(new Date().getTime());
	SYNC_SET.forEach((key) => {
		// Whenever we prepare data to be sent out
		// we have to convert these two parameters to objects
		// so that they may be imported by pre-8.2 version
		if (key === 'reload_banner_status' ||
			key === 'trackers_banner_status') {
			settings[key] = {
				dismissals: [],
				show_time: nowTime,
				show: conf[key]
			};
		} else {
			settings[key] = conf[key];
		}
	});
	return settings;
}

/**
 * Fetch user settings from Consumer API endpoint and store them locally.
 * @memberOf BackgroundUtils
 *
 * @return {Promise} 	user settings object
 */
export function pullUserSettings() {
	return _refreshToken().then(wasUpdated => _pullUserSettings()).catch(err => Promise.reject(err));
}

/**
 * Post user settings to Consumer API.
 * @memberOf BackgroundUtils
 *
 * @param  {Object} settings 	settings object returned by getSettings()
 *
 * @return {Promise}
 */
export function pushUserSettings(settings) {
	return _refreshToken().then(wasUpdated => _pushUserSettings(settings)).catch((err) => {
		log('Token error:', err);
		return Promise.resolve(err);
	});
}

/**
 * Trigger email validation email for a given user.
 * @memberOf BackgroundUtils
 *
 * @return {Promise} 		object indicating success or failure
 */
export function sendVerificationEmail() {
	const { login_info } = conf;
	const { decoded_user_token, email } = login_info;
	const userId = decoded_user_token ? decoded_user_token.UserId : undefined;

	if (userId) {
		const params = {
			UserId: userId,
			RedirectUrlToAddCodeSuffixOn: VERIFICATION_URL,
			FooterUrl: VERIFICATION_URL,
			VerificationContinueUrl: REDIRECT_URL
		};
		const query = JSON.stringify(params);
		return postJson(`${API_ROOT_URL}/api/Validation/Send`, query).then((result) => {
			// We expect false here
			log('post api/Validation/Send successful', result);
			return {
				success: true,
				email
			};
		}).catch((e) => {
			log('Error: post api/Validation/Send failed', e);
			return Promise.reject({
				success: false,
				email
			});
		});
	}
	log('post api/Validation/Send do nothing when user is not logged in');
	return Promise.resolve({
		success: false,
		email
	});
}

/**
 * Sets login info extracted from AUTH cookie
 *
 * @EDGE failes with cookies.getAll, as it finds only cookies belonging
 * to the currently opened tabs.
 * The code was changed to use cookies.get in
 * a asynchronous sequence, as a workaround.
 * This code still fails to find cookies if
 * extensionweb sets a cookie while bing.com was opened in another tab.
 * @memberOf BackgroundUtils
 *
 * @param {url} 		url 		domain url for AUTH cookie
 * @return {Promise} 				loginInfo from cookie or false if already logged in
 */
export function setLoginInfoFromAuthCookie(url) {
	const urlArray = ['https://extension.ghostery.com',
		'https://extension.ghosterystage.com',
		'http://extension.ghosterydev.com',
		'https://signon.ghostery.com',
		'https://signon.ghosterystage.com',
		'https://account.ghostery.com',
		'https://account.ghosterystage.com'
	]; // Same as in matches: for platform_pages.js in manifest.json
	const urlArraySize = urlArray.length;

	let	urlArrayIndex = 0;

	function doCookie(cookie) {
		return new Promise((resolve, reject) => {
			user_token = cookie.value;
			if (user_token) {
				// base64 decode and parse JSON
				const decoded_user_token = decodeJwt(user_token).payload;
				const is_validated = !!((typeof decoded_user_token.ClaimEmailAddressValidated === 'string' && decoded_user_token.ClaimEmailAddressValidated.toLowerCase() === 'true'));
				const email = decoded_user_token.ClaimEmailAddress;

				log('setLoginInfoFromAuthCookie: AUTH cookie found. Decoded user token:', decoded_user_token);
				conf.login_info = {
					logged_in: true,
					email,
					user_token,
					decoded_user_token,
					is_validated
				};

				// Check validity
				_refreshToken().then((wasRefreshed) => {
					if (wasRefreshed) {
						// Override cookie
						_setAuthCookie(url, user_token, decoded_user_token);
					}
					resolve();
				});
			} else {
				reject();
			}
		})
			.catch((err) => {
				log('doCookie error:', err);
				return Promise.reject(err);
			});
	}

	function getCookie(url) {
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line consistent-return
			chrome.cookies.get({ url, name: AUTH_COOKIE }, (cookie) => {
				if (cookie) {
					return doCookie(cookie).then((result) => {
						reject(result);
					}).catch((err) => {
						resolve();
					});
				}
				resolve();
			});
		});
	}

	// A recursive routine which throws once cookie is found or the end of the cookie list is reached
	function processCookie() {
		if (urlArrayIndex < urlArraySize) {
			return getCookie(urlArray[urlArrayIndex++]).then(() => processCookie());
		}
		return Promise.reject(false);
	}

	const { login_info } = conf;
	const logged_in = login_info.logged_in || false;
	const is_validated = login_info.is_validated || false;
	const decoded_user_token = login_info.decoded_user_token;
	let user_token = login_info.user_token;

	if (logged_in && is_validated) {
		return _refreshToken().then((wasRefreshed) => {
			if (wasRefreshed) {
				// Override cookie
				_setAuthCookie(url, user_token, decoded_user_token);
			}
		});
	}
	return processCookie().catch((result) => {
		if (result === false) {
			log('NO COOKIES');
			return Promise.resolve(false);
		}
		log('COOKIE FOUND', result);
		return Promise.resolve(true);
	});
}

/**
 * Clears login info in prefs and returns empty login data
 * @private
 *
 * @return {Object} 			cleared login_info object
 */
function _logOut() {
	conf.login_info = {
		logged_in: false,
		email: '',
		user_token: '',
		decoded_user_token: {},
		is_validated: false
	};

	_deleteAuthCookie();
	return conf.login_info;
}

/**
 * Returns expiration timeout
 * @private
 *
 * @return {number} expiration timeout in millisec
 */
function _getExpirationTimeout() {
	const decoded_user_token = conf.login_info.decoded_user_token;
	if (decoded_user_token && decoded_user_token.exp) {
		const currentTime = (new Date()).getTime();
		const tokenExpTime = decoded_user_token.exp * 1000;
		return (tokenExpTime - currentTime);
	}
	// force immediate refresh
	return GROUND_ZERO_TIME;
}

/**
 * Make refresh call to check the state of the account. Notifies extension.
 * @private
 *
 * @return {Promise} 	no data, or error
 */
function _refreshLoginInfo() {
	const login_info = conf.login_info;
	if (!login_info.logged_in) {
		sendMessageToPanel('onLoginInfoUpdated', _logOut());
		return Promise.resolve('User not logged in');
	}

	let decoded_user_token = login_info.decoded_user_token;
	if (!decoded_user_token || !decoded_user_token.RefreshToken) {
		sendMessageToPanel('onLoginInfoUpdated', _logOut());
		return Promise.reject('decoded_user_token or decoded_user_token.RefreshToken is null.');
	}

	const params = {
		RefreshToken: decoded_user_token.RefreshToken,
		ClientId: '1',
		ClientSecret: '1'
	};
	const query = JSON.stringify(params);

	return postJson(`${API_ROOT_URL}/api/Login/Refresh`, query).then((response) => {
		log('Refresh call succeeded', response);
		const user_token = response.Token;
		if (user_token) {
			decoded_user_token = decodeJwt(user_token).payload;
			log('Setting login info in PREFS on Refresh:', decoded_user_token);

			let is_validated = decoded_user_token.ClaimEmailAddressValidated;
			is_validated = !!((typeof is_validated === 'string' && is_validated.toLowerCase() === 'true'));

			conf.login_info = {
				logged_in: true,
				email: decoded_user_token.ClaimEmailAddress,
				user_token,
				decoded_user_token,
				is_validated
			};

			log('GOT REFRESHED LOGIN INFO', conf.login_info);

			_setAuthCookie(SIGNON_URL, user_token, decoded_user_token);
			sendMessageToPanel('onLoginInfoUpdated', conf.login_info);
			return Promise.resolve();
		}
		sendMessageToPanel('onLoginInfoUpdated', _logOut());
		return Promise.reject('Refresh call returned null user_token');
	}).catch((err) => {
		log('_refreshLoginInfo', err);
		_logOut();
		sendMessageToPanel('onLoginInfoUpdated', _logOut());
		return Promise.reject(err);
	});
}

/**
 * GET user settings from ConsumerAPI
 * @private
 *
 * @return {Promise} 	user settings json or error
 */
function _pullUserSettings() {
	const login_info = conf.login_info;
	if (login_info.logged_in) {
		const user_token = login_info.user_token;
		const decoded_user_token = login_info.decoded_user_token;
		const userId = decoded_user_token ? decoded_user_token.UserId : undefined;
		if (user_token && userId) {
			return getJson(`${API_ROOT_URL}/api/Sync/${userId}`, { Authorization: `Bearer ${user_token}` }).then((settings) => {
				settings = settings || {};
				settings = settings.SettingsJson;
				try {
					settings = settings ? JSON.parse(settings) : {};
				} catch (e) {
					return Promise.reject('Corrupted settings');
				}
				log('PULL USER SETTINGS', settings);
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
			}).catch(err => Promise.reject('_pullUserSettings error', err));
		}
		return Promise.reject('_pullUserSettings: corrupted token');
	}
	return Promise.resolve({});
}
/**
 * POST user settings to ConsumerAPI
 * @private
 *
 * @param {Object} user settings
 *
 * @return {Promise} 	no data, or error
 */
function _pushUserSettings(settings) {
	const login_info = conf.login_info;
	const logged_in = login_info.logged_in;
	const user_token = login_info.user_token;
	const decoded_user_token = login_info.decoded_user_token;
	const userId = decoded_user_token ? decoded_user_token.UserId : undefined;
	if (logged_in && user_token && userId) {
		log('PUSH USER SETTINGS');
		// eslint-disable-next-line no-useless-concat
		const query = `${'{"SettingsJson":' + '\''}${JSON.stringify(settings.conf)}'}`;
		return postJson(`${API_ROOT_URL}/api/Sync/${userId}`, query, { Authorization: `Bearer ${user_token}` })
			.catch((err) => {
				log('Error: post api/Sync failed in _pushUserSettings', err);
				return Promise.reject('_pushUserSettings error:', err);
			});
	}
	return Promise.resolve();
}
/**
 * Sets AUTH cookie
 * @private
 *
 * @param  {string} url - cookie url
 * @param  {string} user_token - encrypted user token string
 * @param  {Object} decoded_user_token -decoded user token as an JSON object
 */
function _setAuthCookie(url, user_token, decoded_user_token) {
	_refreshToken().then((wasRefreshed) => {
		const expiredIn = _getExpirationTimeout();
		const epochExpirationTime = Math.floor(((new Date()).getTime() + expiredIn) / 1000); // in sec

		chrome.cookies.set({
			url,
			name: AUTH_COOKIE,
			domain: `${GHOSTERY_DOMAIN}.com`,
			path: '/',
			value: user_token,
			expirationDate: epochExpirationTime
		}, (cookie) => {
			if (chrome.runtime.lastError) {
				log('_setAuthCookie error:', chrome.runtime.lastError, url);
			}
		});
	})
		.catch((err) => {
			log('_setAuthCookie error:', err);
		});
}

/**
 * Deletes AUTH cookie
 * @private
 */
function _deleteAuthCookie() {
	const urls = [
		'https://extension.ghostery.com',
		'https://extension.ghosterystage.com',
		'https://signon.ghostery.com',
		'https://signon.ghosterystage.com',
		'https://account.ghostery.com',
		'https://account.ghosterystage.com',
		'http://extension.ghosterydev.com'
	];
	urls.forEach((url) => {
		chrome.cookies.remove({
			url,
			name: 'AUTH'
		}, (details) => {
			if (!details) {
				log('Could not find AUTH cookie');
			}
		});
	});
}
/**
 * Refreshes token if necessary
 * @private
 *
 * @return {Promise} 		true if token was updated, false otherwise, or rejects with error
 */
function _refreshToken() {
	return new Promise((resolve, reject) => {
		if (!conf.login_info.logged_in) {
			resolve('User not logged in');
			return;
		}

		const decoded_user_token = conf.login_info.decoded_user_token;
		if (!decoded_user_token || !decoded_user_token.exp) {
			reject('User token is corrupted or null');
			return;
		}

		const currentTime = (new Date()).getTime();
		const tokenExpTime = decoded_user_token.exp * 1000;
		if (currentTime > tokenExpTime && currentTime >= LOGOUT_TIMEOUT + tokenExpTime) {
			sendMessageToPanel('onLoginInfoUpdated', _logOut());
			log('_refreshToken: user token is over a week old. Logging out...');
			reject('_refreshToken: user token is over a week old. Logging out...');
		} else if (tokenExpTime < (currentTime + REFRESH_OFFSET)) {
			_refreshLoginInfo().then(() => {
				sendMessageToPanel('onLoginInfoUpdated', conf.login_info);
				resolve(true); // was updated
			})
				.catch((err) => {
					sendMessageToPanel('onLoginInfoUpdated', _logOut());
					log('_refreshToken: refresh token failed', err);
					reject(err);
				});
		} else {
			resolve(false); // was not updated
		}
	});
}
