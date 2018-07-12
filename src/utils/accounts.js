
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
import { log, decodeJwt } from './common';
import { get, save, getCsrfCookie } from './api';
import { getJson, postJson, sendMessageToPanel } from './utils';

const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const { IS_CLIQZ } = globals;

// CONSTANTS
const { GHOSTERY_DOMAIN } = globals;
// @TODO const API_ROOT_URL = `https://consumerapi.${GHOSTERY_DOMAIN}.com`;
const API_ROOT_URL = 'https://localhost:8080';
const VERIFICATION_URL = `https://signon.${GHOSTERY_DOMAIN}.com/register/verify/`; // can't set culture because site needs to append guid
const REDIRECT_URL = `https://account.${GHOSTERY_DOMAIN}.com/`;
const SIGNON_URL = `https://signon.${GHOSTERY_DOMAIN}.com/`; // culture query param not needed, only for cookie
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
export function setLoginInfo(user) {
	const {
		email, emailValidated, id, firstName, lastName, loggedIn
	} = user;
	conf.login_info = {
		logged_in: loggedIn || false,
		user_id: id,
		is_validated: emailValidated,
		email,
		first_name: firstName,
		last_name: lastName,
	};
	return Promise.resolve(conf.login_info);
}

export function userLogin(credentials) {
	return fetch(`${globals.AUTH_SERVER}/api/v2/login`, {
		method: 'POST',
		body: credentials,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(credentials),
		},
		credentials: 'include',
	})
		.then((response) => {
			console.log('fetch response', response);
			return Promise.resolve(response);
		})
		.catch(e => Promise.reject(e));
}

export function fetchUser() {
	let user_id;
	return getLoginCookie()
		.then((cookie) => {
			user_id = cookie;
			console.log('fetchUser user_id', user_id);
			return get('users', user_id);
		})
		.then((response) => {
			const user = build(normalize(response), 'users', user_id);
			user.loggedIn = true;
			return setLoginInfo(user);
		})
		.then((loginInfo) => {
			console.log('fetchUser loginInfo', loginInfo);
			return Promise.resolve(loginInfo);
		})
		.catch(err => Promise.reject(err));
}

export function pullUserSettings(user_id) {
	return get('settings', user_id, 'settings')
		.then((data) => {
			const settings = build(normalize(data, { camelizeKeys: false }), 'settings', user_id);
			console.log('background pullUserSettings', settings);
			// @TODO setConfUserSettings settings.settingsJson
			setConfUserSettings(settings.settings_json);
			return Promise.resolve(settings);
		})
		.catch((error) => {
			log('PanelActions pullUserSettings error', error);
		});
}

export function getLoginCookie() {
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
export function getLoginInfo() {
	return new Promise((resolve, reject) => {
		resolve(conf.login_info);
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
 * GET user settings from ConsumerAPI
 * @private
 *
 * @return {Promise} 	user settings json or error
 */
export function setConfUserSettings(settings) {
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
