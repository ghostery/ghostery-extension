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
				reject(new Error(chrome.runtime.lastError));
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
	log('PREFS SET', prefs);
	return new Promise(((resolve, reject) => {
		if (typeof prefs !== 'undefined') {
			chrome.storage.local.set(prefs, () => {
				if (chrome.runtime.lastError) {
					log('prefsSet ERROR', chrome.runtime.lastError);
					reject(new Error(chrome.runtime.lastError));
				} else {
					resolve(prefs);
				}
			});
		} else {
			log('prefsSet ERROR', chrome.runtime.lastError);
			reject(new Error(chrome.runtime.lastError));
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
		// call getter
		return prefsGet(key);
	}
	// convert params to object and call setter
	const valueObj = {};
	valueObj[key] = value;
	return prefsSet(valueObj);
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

/**
 * Unescape base64-encoded string.
 * @private
 *
 * @param  {string} str		base64-encoded str
 * @return {string}			unescaped str
 */
function _base64urlUnescape(str) {
	const returnStr = str + new Array(5 - (str.length % 4)).join('=');
	return returnStr.replace(/-/g, '+').replace(/_/g, '/');
}

/**
 * Decode base64-encoded string.
 * @private
 *
 * @param  {string} str		base64-encoded string
 * @return {string}			decoded string
 */
function _base64urlDecode(str) {
	return Buffer.from(_base64urlUnescape(str), 'base64').toString();
}

/**
 * Decode JWT Tokens.
 * @memberOf BackgroundUtils
 *
 * @param  {string} token 		JWT token
 *
 * @return {Object} 			Object with decoded parts of JWT token
 */
export function decodeJwt(token) {
	const segments = token.split('.');

	if (segments.length !== 3) {
		return null;
	}

	// All segment should be base64
	const headerSeg = segments[0];
	const payloadSeg = segments[1];
	const signatureSeg = segments[2];

	// base64 decode and parse JSON
	const header = JSON.parse(_base64urlDecode(headerSeg));
	const payload = JSON.parse(_base64urlDecode(payloadSeg));

	return {
		header,
		payload,
		signature: signatureSeg
	};
}
