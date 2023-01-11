/**
 * Common Methods
 *
 * Methods and properties that are shared between app and src modules.
 * NOTE: In order to save space, this file should not have any module imports.
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

// DO NOT IMPORT MODULES TO THIS FILE

// Private variable that controls whether calls to log() produce the requested console output or do nothing
let _shouldLog = chrome.runtime.getManifest().debug || false;

/**
 * Report whether logging is active
 * @memberOf BackgroundUtils
 *
 * @return {Boolean}					True if logging is active and false otherwise
 */
export function isLog() {
	return _shouldLog;
}

/**
 * Activate / deactivate logging
 * Allows modules like the console debugger to override the manifest debug setting
 * @memberOf BackgroundUtils
 *
 * @param  {Boolean} shouldActivate		Whether logging should be activated or deactivated. Optional; defaults to true
 *
 * @return {undefined}					No explicit return value
 */
export function activateLog(shouldActivate = true) {
	_shouldLog = shouldActivate;
}

/**
 * Log to console regardless of log settings
 * @memberOf BackgroundUtils
 *
 * @param  {array} args 	ES6 Rest parameter
 *
 * @return {boolean}		Always true
 */
export function alwaysLog(...args) {
	// check for error messages
	const hasErrors = args.toString().toLowerCase().includes('error');
	// add timestamp to first position
	args.unshift(`${(new Date()).toLocaleTimeString()}\t`);

	if (hasErrors) {
		console.error(...args); // eslint-disable-line no-console
		console.trace(); // eslint-disable-line no-console
	} else {
		console.log(...args); // eslint-disable-line no-console
	}
	return true;
}

/**
 * Custom Debug Logger.
 * Unliked alwaysLog, only logs if logging is turned on
 * through the manifest and/or GhosteryDebugger
 * @memberOf BackgroundUtils
 *
 * @param  {array} args 	ES6 Rest parameter
 *
 * @return {boolean}  		false if disabled, otherwise true
 */
export function log(...args) {
	if (!_shouldLog) {
		return false;
	}

	return alwaysLog(...args);
}

/**
 * Get multiple prefs.
 * @memberOf BackgroundUtils
 *
 * @param  {array} args 	ES6 Rest Parameter
 * @return {Promise} 		Object if multiple prefs, single value for one pref
 */
export function prefsGet(...args) {
	return new Promise(((resolve, reject) => {
		chrome.storage.local.get(args.length ? args : null, (items) => {
			if (chrome.runtime.lastError) {
				log('prefsGet ERROR', chrome.runtime.lastError);
				reject(chrome.runtime.lastError);
			} else {
				let result = null;
				if (args.length <= 0) {
					result = items;
				} else if (args.length === 1) {
					const key = args[0]; // extract value from array
					if (items && items.hasOwnProperty(key)) {
						result = items[key];
					}
				} else {
					result = {}; // instantiate an empty object
					args.forEach((key) => {
						result[key] = null;
						if (items && items.hasOwnProperty(key)) {
							result[key] = items[key];
						}
					});
				}
				resolve(result);
			}
		});
	}));
}

/**
 * Set multiple prefs.
 * @memberOf BackgroundUtils
 *
 * @param  {Object} prefs 	jsonifyable key/value pairs of prefs
 * @return {Promise} 		prefs object which has been set, or error
 */
export function prefsSet(prefs) {
	if (prefs === undefined || prefs === null) {
		throw new Error('Bad argument');
	}
	return new Promise(((resolve, reject) => {
		try {
			chrome.storage.local.set(prefs, () => {
				if (chrome.runtime.lastError) {
					alwaysLog('prefsSet ERROR', chrome.runtime.lastError);
					reject(chrome.runtime.lastError);
				} else {
					resolve(prefs);
				}
			});
		} catch (e) {
			alwaysLog('prefsSet ERROR', e);
			reject(e);
		}
	}));
}

/**
 * Get/Set single pref
 * Use prefs for persisting basic values to local storage. For User
 * Configuration properties, use Conf (which calls prefs).
 * @memberOf BackgroundUtils
 *
 * @param  {string} key   			pref name
 * @param  {*} 		value 			pref value
 * @return {Promise}				value which has been obtained or set, or error
 */
export function pref(key, value) {
	if (typeof value === 'undefined') {
		return prefsGet(key);
	}
	return prefsSet({ [key]: value });
}

/**
 * Generate hash code for a string
 * Used for checking the hash of the backup file, easy validation check.
 * Modified code from: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @memberOf BackgroundUtils
 *
 * @param  {string} str 	input string
 * @return {string} 		hash code string
 */
export function hashCode(str) {
	let hash = 0;
	let character;
	let i;

	if (str.length === 0) {
		return hash;
	}

	for (i = 0; i < str.length; i++) {
		character = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + character; // eslint-disable-line no-bitwise
		hash &= hash; // eslint-disable-line no-bitwise
	}

	return hash;
}

// source https://stackoverflow.com/a/38552302
export function parseJwt(token) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(
		window.atob(base64)
			.split('')
			.map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
			.join('')
	);

	return JSON.parse(jsonPayload);
}

export function getISODate() {
	return new Date().toISOString().split('T')[0];
}
