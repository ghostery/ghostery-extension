/**
 * React Utilities
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

import { log } from '../../../src/utils/common';

/**
 * Update key:value pair in immutable object and return new object.
 * @memberOf PanelUtils
 * @param  {Object} obj 	immutable object
 * @param  {string} key 	property name
 * @param  {*} 		value 	property value
 * @return {Object}     	new object
 */
export function updateObject(obj, key, value) {
	const output = {};
	output[key] = value;
	return Object.assign({}, obj, output);
}

/**
 * Remove key from immutable object and return new object
 * @memberOf PanelUtils
 * @param  {Object} obj 	immutable object
 * @param  {string} key 	property name
 * @return {Object}     	new object
 */
export function removeFromObject(obj, key) {
	return Object.keys(obj).filter(k => k !== key.toString()).reduce((result, k) => {
		result[k] = obj[k];
		return result;
	}, {});
}

/**
 * Add new item to immutable array and return new array.
 * @memberOf PanelUtils
 * @param  {array} array 	original array
 * @param  {*} 	  item		item to add
 * @return {array}  		clone with item added
 */
export function addToArray(array, item) {
	return [...array, item];
}

/**
 * Remove item from immutable array by index and return new array
 * @memberOf PanelUtils
 * @param  {array} 		array 			original array
 * @param  {number}   	position		index of the item to be removed
 * @return {array} 						clone with item removed
 */
export function removeFromArray(array, position) {
	return array.filter((item, index) => index !== position);
}

/**
 * Check for valid email
 * @memberOf PanelUtils
 * @param  {string} email 		email to validate
 * @return {boolean}			true if valid, false otherwise
 */
export function validateEmail(email) {
	const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/;
	return email !== '' && emailRegex.test(email);
}

/**
 * Check for valid password
 * @memberOf PanelUtils
 * @param  {string} pwd 	password to validate
 * @return {boolean} 		true if valid, false otherwise
 */
export function validatePassword(pwd) {
	const pwdRegex = /^[a-zA-Z0-9!@#$%^&*=+()<>{}[\];:,./?]{8,50}$/;
	return pwd !== '' && pwdRegex.test(pwd);
}

/**
 * Helper method for making XHR requests
 * @memberOf PanelUtils
 * @param  {string} method 		request method
 * @param  {string} url 		request url
 * @param  {string} query		stringified JSON
 * @return {Promise} 			resolve yields response data in form
 *                              of a JSON object, reject yields error object
 */
export function doXHR(method, url, query) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.onload = function () {
			// This is called even on 404 etc, so check the status.
			if (xhr.status >= 200 && xhr.status < 400) {
				resolve(JSON.parse(xhr.responseText));
			} else {
				// Otherwise reject with the status text
				log('doXHR error', xhr.statusText);
				reject(new Error(xhr.statusText));
			}
		};

		// Handle network errors
		xhr.onerror = function (error) {
			log('doXHR network error', error);
			reject(new Error(error));
		};

		// Make the request
		log('doXHR request', method, url, query);
		xhr.open(method, url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('Accept', 'application/json');
		xhr.overrideMimeType('application/json');
		xhr.send(query);
	});
}
