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

/* eslint no-console: 0 no-bitwise: 0 */

// DO NOT IMPORT MODULES TO THIS FILE

const LOG = chrome.runtime.getManifest().log || false;

/**
 * Custom Debug Logger.
 * @memberOf BackgroundUtils
 *
 * @param  {array} args 	ES6 Rest parameter
 *
 * @return {boolean}  		false if disabled, otherwise true
 */
export function log(...args) {
	if (!LOG) {
		return false;
	}
	// check for error messages
	const hasErrors = args.toString().toLowerCase().includes('error');
	// add timestamp to first position
	args.unshift(`${(new Date()).toLocaleTimeString()}\t`);

	if (hasErrors) {
		console.error(...args);
		console.trace();
	} else {
		console.log(...args);
	}
	return true;
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
					if (items && Object.prototype.hasOwnProperty.call(items, key)) {
						result = items[key];
					}
				} else {
					result = {}; // instantiate an empty object
					args.forEach((key) => {
						result[key] = null;
						if (items && Object.prototype.hasOwnProperty.call(items, key)) {
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
		hash = ((hash << 5) - hash) + character;
		hash &= hash;
	}

	return hash;
}

/**
 * Generator which makes object iterable with for...of loop
 * @memberOf BackgroundUtils
 *
 * @param  {Object} 	object over which own enumerable properties we want to iterate
 * @return {Object}		Generator object
 */

export function* objectEntries(obj) {
	const propKeys = Object.keys(obj);

	for (const propKey of propKeys) {
		// `yield` returns a value and then pauses
		// the generator. Later, execution continues
		// where it was previously paused.
		yield [propKey, obj[propKey]];
	}
}

/**
 * Unescape base64-encoded string.
 * @private
 *
 * @param  {string} str		base64-encoded str
 * @return {string}			unescaped str
 */
function _base64urlUnescape(str) {
	str += new Array(5 - str.length % 4).join('='); // eslint-disable-line no-param-reassign
	return str.replace(/\-/g, '+').replace(/_/g, '/'); // eslint-disable-line no-useless-escape
}

/**
 * Decode base64-encoded string.
 * @private
 *
 * @param  {string} str		base64-encoded string
 * @return {string}			decoded string
 */
function _base64urlDecode(str) {
	return new Buffer(_base64urlUnescape(str), 'base64').toString(); // eslint-disable-line no-buffer-constructor
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
