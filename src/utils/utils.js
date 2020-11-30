/**
 * Utilities
 *
 * Methods and properties that are used ONLY by src modules.
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

/**
 * @namespace BackgroundUtils
 */
import { debounce } from 'underscore';
import { URL } from '@cliqz/url-parser';
import tabInfo from '../classes/TabInfo';
import globals from '../classes/Globals';
import { log } from './common';

const { BROWSER_INFO } = globals;
const IS_FIREFOX = (BROWSER_INFO.name === 'firefox');

/**
 * Handle chrome.runtime.lastError messages
 */
const defaultCallback = () => {
	if (chrome.runtime.lastError) {
		log('defaultCallback error:', chrome.runtime.lastError);
	}
};

/**
 * Send message to a specific tab ID.
 * @memberOf BackgroundUtils
 *
 * @param  {number} 	tab_id  	tab id
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {function} 	callback	function to call (at most once) when you have a response
 */
export function sendMessage(tab_id, name, message, callback = defaultCallback()) {
	log(`BACKGROUND SENT ${name} TO TAB`);
	chrome.tabs.sendMessage(tab_id, {
		name,
		message
	}, callback);
}

/**
 * Send message to a specific tab ID and frame ID.
 * @memberOf BackgroundUtils
 *
 * @param  {number} 	tab_id  	tab id
 * @param  {number} 	frame_id 	frame id
 * @param  {string} 	name 		message name
 * @param  {Object} 	message 	message data
 * @param  {function} 	callback 	function to call (at most once) when you have a response
 */
export function sendMessageToFrame(tab_id, frame_id, name, message, callback = defaultCallback()) {
	log(`BACKGROUND SENT ${name} TO TAB ${tab_id} - FRAME ${frame_id}`);
	chrome.tabs.sendMessage(tab_id, {
		name,
		message
	}, {
		frameId: frame_id
	}, callback);
}
/**
 * Send message to the panel window
 * @memberOf BackgroundUtils
 *
 * @param  {string} name 		message name
 * @param  {Object} message 	message data
 */
export function sendMessageToPanel(name, message) {
	log('BACKGROUND SENDS MESSAGE TO PANEL', name);
	chrome.runtime.sendMessage({ name, message }, () => {
		if (chrome.runtime.lastError) {
			log('sendMessageToPanel error:', chrome.runtime.lastError);
		}
	});
}

/**
 * Checks to make sure the event object belongs to
 * a top-level document and a valid tab.
 * @memberOf BackgroundUtils
 *
 * @param  {Object} details 	event data
 * @return {boolean}
 */
export function isValidTopLevelNavigation(details) {
	const { url } = details;

	return details.frameId === 0 &&
		details.tabId > 0 &&
		url.startsWith('http') &&
		// TODO note this in the "not scanned" text for Chrome
		!url.startsWith('https://chrome.google.com/webstore/');
}

/**
 * Flush Chrome's in-memory cache.
 * Debounced to run no more often than once every 35 seconds to avoid the "slow extension" warning.
 *   + TODO should run once at start of period, and once at end?
 *   + TODO use chrome.webRequest.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES
 * (can default to 20 if undefined)
 * @memberOf BackgroundUtils
 */
export const flushChromeMemoryCache = debounce(() => {
	chrome.webRequest.handlerBehaviorChanged();
}, 1000 * 35, true);

/**
 * Modifies existing properties on a object with custom getters/setters
 * @memberOf BackgroundUtils
 *
 * @param  {Object}   obj      	the object on which to define the property
 * @param  {string}   prop     	the name of the property to be defined or modified
 * @param  {function} callback 	function to call to evaluate the value if it has not been set yet
 */
export function defineLazyProperty(obj, prop, callback) {
	let value;
	let isSet = false;

	Object.defineProperty(obj, prop, {
		get() {
			if (!isSet) {
				value = callback();
				isSet = true;
			}
			return value;
		},
		set(val) {
			value = val;
			isSet = true;
		}
	});
}

/**
 * Process First Party Exception URLs to return host and path.
 * @memberOf BackgroundUtils
 *
 * @param  {string} src 	the first party exception url
 * @return {Object} 		contains host, path as properties
 */
export function processFpeUrl(src) {
	const index = src.indexOf('/');
	const host = (index === -1) ? src : src.substring(0, index);
	const path = (index === -1) ? '' : src.substring(index + 1);

	return { host, path };
}

/**
 * Process URLs to remove query strings, hashes, schemes, etc.
 * @memberOf BackgroundUtils
 *
 * @param  {string} src 	the source url
 * @return {URL} 		contains url parts as properties
 *
 */
export function processUrl(src) {
	try {
		const res = new URL(src);
		return res;
	} catch (e) {
		return {
			protocol: '',
			hostname: '',
			pathname: '',
		};
	}
}

/**
 * Process URLs and returns the query string as an object.
 * @memberOf BackgroundUtils
 * @param  {string} src 	the source url
 * @return {Object}			contains parts of parsed query as its properties
 */
export function processUrlQuery(src) {
	if (!src) {
		return {};
	}

	try {
		const res = {};
		for (const [key, value] of new URL(src).searchParams.entries()) { // eslint-disable-line no-restricted-syntax
			res[key] = value;
		}
		return res;
	} catch (e) {
		return {};
	}
}

/**
 * Get a tab by ID. Will throw an error if the
 * tab_id is a prefetched tab (or otherwise not found).
 * @memberOf BackgroundUtils
 *
 * @param  {number}  	tab_id 		tab id
 * @param  {function} 	callback   	function to call if tab found
 * @param  {function}   [error]  	function to call if tab not found
 */
export function getTab(tab_id, callback, error) {
	chrome.tabs.get(tab_id, (tab) => {
		if (chrome.runtime.lastError) {
			log('getTab', chrome.runtime.lastError.message);
			if (error && typeof error === 'function') {
				error(chrome.runtime.lastError);
			}
		} else if (tab && typeof callback === 'function') {
			callback(tab);
		}
	});
}

/**
 * Query the active tab.
 * @memberOf BackgroundUtils
 *
 * @param  {function} callback		function to call if tab found
 */
export function getActiveTab(callback, error) {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, (tabs) => {
		if (chrome.runtime.lastError) {
			log('getActiveTab', chrome.runtime.lastError.message);
			if (error && typeof error === 'function') {
				error(chrome.runtime.lastError);
			}
		} else if (tabs.length === 0) {
			if (error && typeof error === 'function') {
				error({ message: 'Active tab not found' });
			}
		} else if (callback && typeof callback === 'function') {
			callback(tabs[0]);
		}
	});
}

/**
 * Query the first tab that matches the url argument.
 * Will throw an error if the url argument is an invalid url pattern.
 * @memberOf BackgroundUtils
 *
 * @param {string} url				the tab url to search for
 * @param {function} callback		function to call if at least one matching tab is found
 * @param {function} error			function to call if the provided url pattern is invalid or no matching tab is found
 */
export function getTabByUrl(url, callback, error) {
	chrome.tabs.query(
		{
			url
		},
		(tabs) => {
			if (chrome.runtime.lastError) {
				log('getTabByUrl', chrome.runtime.lastError.message);
				if (error && typeof error === 'function') {
					error(chrome.runtime.lastError);
				}
			} else if (tabs.length === 0) {
				if (error && typeof error === 'function') {
					error();
				}
			} else if (callback && typeof callback === 'function') {
				callback(tabs[0]);
			}
		}
	);
}

/**
 * Helper called by openNewTab.
 * @memberOf BackgroundUtils
 * @private
 *
 * @param  {Object} data 	info about the new tab
 */
function _openNewTab(data) {
	getActiveTab((tab) => {
		if (tab) {
			chrome.tabs.create({
				url: data.url,
				active: data.become_active || false,
				openerTabId: tab.id,
				index: tab.index + 1
			});
		} else {
			chrome.tabs.create({
				url: data.url,
				active: data.become_active || false
			});
		}
	}, (err) => {
		log(`_openNewTab Error: ${err}`);
	});
}
/**
 * Open a new browser tab.
 * @memberOf BackgroundUtils
 *
 * @param  {Object} data 	info about the new tab
 */
export function openNewTab(data) {
	if (IS_FIREFOX) {
		chrome.tabs.create({
			url: data.url,
			active: data.become_active || false
		});
	} else if (data.tab_id) {
		chrome.tabs.get(data.tab_id, (tab) => {
			if (tab) {
				chrome.tabs.create({
					url: data.url,
					active: data.become_active || false,
					openerTabId: tab.id,
					index: tab.index + 1,
					windowId: tab.windowId
				});
			} else {
				_openNewTab(data);
			}
		});
	} else {
		_openNewTab(data);
	}
}

/**
 * Fetch JSON or text files asynchronously.
 * @memberOf BackgroundUtils
 * @private
 *
 * @param  {string} method 			GET or POST
 * @param  {string} url    			URI
 * @param  {Object} query  			fetch load (applicable to POST)
 * @param  {Object} extraHeaders 	contains names and values of fetch headers as properties
 * @return {Promise}				resolve yields fetched json or plain text data, reject yields error
 */
function _fetchJson(method, url, query, extraHeaders, referrer = 'no-referrer', credentials = 'omit') {
	if (typeof fetch === 'function') {
		const headers = new Headers({
			'Content-Type': 'application/json',
			Accept: 'application/json'
		});
		if (extraHeaders) {
			const extraHeadersKeys = Object.keys(extraHeaders);
			extraHeadersKeys.forEach((key) => {
				const value = extraHeaders[key];
				headers.append(key, value);
			});
		}
		const options = {
			method,
			headers,
			body: query,
			referrerPolicy: referrer,
			credentials
		};
		if (method === 'GET' || method === 'HEAD') {
			delete options.body;
		}

		const request = new Request(url, options);
		return fetch(request).then((response) => {
			const contentType = response.headers.get('content-type');
			if (!response.ok) {
				return Promise.reject(new Error(`Failed to fetch ${url} with status ${response.status} (${response.statusText})`));
			}
			// check for 204 status (No Content) from CMP
			if (response.status === 204) {
				return false; // send back false to signal no new campaigns
			}
			if (contentType && contentType.includes('application/json')) {
				return response.json();
			}
			if (contentType && contentType.includes('text/html')) {
				return response.text();
			}
			return response.text();
		}).then((data) => {
			// GET /api/Sync/ returns json with content-type:text/html. go figure.
			if (typeof data === 'string' && data.includes('{')) {
				try {
					log('_fetchJson resolved', (data) ? JSON.parse(data) : {});
					// attempt to parse the response.text as json
					return (data) ? JSON.parse(data) : {};
				} catch (err) {
					log('_fetchJson error', err);
					return Promise.reject(new Error(err));
				}
			} else {
				// data is either false or actual application/json
				return data;
			}
		}).catch((err) => {
			log(`_fetchJson Error: ${err}`);
			return Promise.reject(new Error(err));
		});
	}
	return new Promise(((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.onload = function() {
			// This is called even on 404 etc, so check the status.
			if (xhr.status >= 200 && xhr.status < 400) {
				// check for 204 status (No Content) from CMP
				if (xhr.status === 204) {
					resolve(false); // send back false to signal no new campaigns
				} else if (xhr.responseText.includes('{')) {
					// For saveUserSettings we only get back a string that cannot be parsed
					try {
						log('_fetchJson resolved', (xhr.responseText) ? JSON.parse(xhr.responseText) : {});
						// Resolve the promise with the response text
						resolve((xhr.responseText) ? JSON.parse(xhr.responseText) : {});
					} catch (err) {
						log('_fetchJson error', err);
						reject(new Error(err));
					}
				} else {
					resolve(xhr.responseText);
				}
			} else {
				// Otherwise reject with the status text
				log('_fetchJson error', xhr.statusText);
				reject(new Error(xhr.statusText));
			}
		};

		// Handle network errors
		xhr.onerror = function(error) {
			log('_fetchJson network error', error);
			reject(new Error(error));
		};

		// Make the request
		log('_fetchJson request', method, url, query, extraHeaders);
		xhr.open(method, url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('Accept', 'application/json');
		if (extraHeaders) {
			const extraHeadersKeys = Object.keys(extraHeaders);
			extraHeadersKeys.forEach((key) => {
				const value = extraHeaders[key];
				xhr.setRequestHeader(key, value);
			});
		}
		xhr.overrideMimeType('application/json');
		xhr.send(query);
	}));
}

/**
 * POST json data.
 * @memberOf BackgroundUtils
 *
 * @param  {srting} url				URI to post data to
 * @param  {Object} query   		POST load as json object
 * @param  {Object} extraHeaders 	contains names and values of additional headers
 * @return {Promise}				resolve yields fetched data, if any, reject yields error
 */
export function postJson(url, query, extraHeaders) {
	return _fetchJson('POST', url, query, extraHeaders).catch((error) => {
		log('postJson error', error);
		return Promise.reject(error);
	});
}

/**
 * GET JSON data.
 * @memberOf BackgroundUtils
 *
 * @param  {string} url 			URI to get data from
 * @param  {Object} extraHeaders    contains names and values of additional headers
 * @return {Promise} 				resolve yields fetched data, reject yields error
 */
export function getJson(url, extraHeaders) {
	return _fetchJson('GET', url, null, extraHeaders).catch((error) => {
		log('getJson error', error);
		return Promise.reject(error);
	});
}

/**
 * Fetch local json resource files asynchronously.
 * @memberOf BackgroundUtils
 *
 * @param  {string}	 url	URI of the local resource
 * @return {Promise} 		resolve yields fetched data, reject yields error
 */
export function fetchLocalJSONResource(url) {
	if (typeof fetch === 'function') {
		return fetch(url).then((response) => {
			if (!response.ok) {
				return Promise.reject(new Error(`Failed to fetchLocalJSONResource ${url} with status ${response.status} (${response.statusText})`));
			}
			return response.json();
		}).catch((err) => {
			log(`fetchLocalJSONResource error: ${err}`);
			return Promise.reject(new Error(err));
		});
	}
	return new Promise(((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = function() {
			// This is called even on 404 etc, so check the status.
			if (xhr.status >= 200 && xhr.status < 400) {
				try {
					resolve((xhr.responseText) ? JSON.parse(xhr.responseText) : {});
				} catch (err) {
					log('fetchLocalJSONResource error', err);
					reject(new Error(err));
				}
			} else {
				// Otherwise reject with the status text
				log('fetchLocalJSONResource error', xhr.statusText);
				reject(new Error(xhr.statusText));
			}
		};

		// Handle network errors
		xhr.onerror = function(error) {
			log('fetchLocalJSONResource network error', error);
			reject(new Error(error));
		};

		// Make the request
		log('fetchLocalJSONResource request', url);
		xhr.open('GET', url, true);
		xhr.overrideMimeType('image/png');
		xhr.send();
	}));
}

/**
 * Like Array.prototype.slice(), but for objects.
 * Get a property on an object (if props is a property key string),
 * OR Get a subset of properties (if props is a regex),
 * OR Get the whole supplied object back (if props is missing, invalid, or produces no matches).
 * If the property is not defined on the object,
 * returns the whole object as the val prop of the return object.
 *
 * @memberOf BackgroundUtils
 *
 * @param	{Object}		obj			The object to extract a property or properties from
 * @param 	{string|RegExp} props		String name of the property, or regex to match against all properties. Optional.
 * @return 	{Object}					{ val: undefined|Object, foundMatch: Boolean, err: Boolean, errMsg: undefined|String }
 */
export function getObjectSlice(obj, props) {
	if (obj === undefined || typeof obj !== 'object') {
		return ({
			val: undefined,
			foundMatch: false,
			err: true,
			errMsg: 'You must provide an object as the first argument',
		});
	}

	if (props === undefined) {
		return ({
			val: obj,
			foundMatch: false,
			err: false,
			errMsg: undefined,
		});
	}

	if ((typeof props !== 'string') && !(props instanceof RegExp)) {
		return ({
			val: obj,
			foundMatch: false,
			err: true,
			errMsg: 'The second argument must be either a property name string, or a regex. Returning whole object.'
		});
	}

	if (typeof props === 'string') {
		if (obj[props] === undefined) {
			return ({
				val: obj,
				foundMatch: false,
				err: false,
				errMsg: undefined,
			});
		}

		return ({
			val: { [props]: obj[props] },
			foundMatch: true,
			err: false,
			errMsg: undefined,
		});
	}

	// A regex literal has been passed in
	if (props instanceof RegExp) {
		const matches = {};
		Object.keys(obj).forEach((key) => {
			if (props.test(key)) {
				matches[key] = obj[key];
			}
		});
		if (Object.keys(matches).length > 0) {
			return ({
				val: matches,
				foundMatch: true,
				err: false,
				errMsg: undefined,
			});
		}
	}

	return ({
		val: obj,
		foundMatch: false,
		err: false,
		errMsg: undefined,
	});
}

/**
 * Pick a random element from the array argument.
 * If no argument is provided, if the argument is not an array, or if the argument array is empty,
 * the err property on the return object is set to true, errMsg has details, and val is left undefined.
 * Otherwise, err is false, errMsg is undefined, and val contains the randomly picked element.
 *
 * @memberOf BackgroundUtils
 *
 * @param 	{Array} arr			The array to pick a value from. Elements can be of any type(s)
 * @return	{Object}			{ val: *, err: Boolean, errMsg: undefined|String }
 */
export function pickRandomArrEl(arr) {
	if (arr === undefined) {
		return ({
			err: true,
			errMsg: 'Undefined or no argument provided',
			val: undefined,
		});
	}

	if (!Array.isArray(arr)) {
		return ({
			err: true,
			errMsg: 'The argument must be an array',
			val: undefined,
		});
	}

	const len = arr.length;

	if (len === 0) {
		return ({
			err: true,
			errMsg: 'It is beyond the power of pickRandomArrEl to pick a random element from an empty array',
			val: undefined,
		});
	}

	return ({
		err: false,
		errMsg: undefined,
		val: arr[Math.floor((Math.random() * len))],
	});
}

/**
 * Uppercase the first character of each word in the phrase argument.
 * Assumes that words are space-separated by default,
 * but accepts an optional custom string separator argument.
 *
 * @memberOf BackgroundUtils
 *
 * @param 	{String} phrase					The string to capitalize.
 * @param	{String|undefined} separator	Separator string. Optional; defaults to a space.
 * @return	{Object}						{ val: String|undefined, err: Boolean, errMsg: undefined|String }
 */
export function capitalize(phrase, separator = ' ') {
	if (phrase === undefined) {
		return ({
			err: true,
			errMsg: 'Undefined or no argument provided',
			val: undefined,
		});
	}

	if (typeof phrase !== 'string') {
		return ({
			err: true,
			errMsg: 'The first argument must be a string',
			val: undefined,
		});
	}

	if (typeof separator !== 'string') {
		return ({
			err: true,
			errMsg: 'The second argument is optional, but must be a string if provided',
			val: undefined,
		});
	}

	const words = phrase.split(separator);
	const trimmedWords = words.map(word => word.trim());
	const capitalizedWords = trimmedWords.map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`);

	return ({
		err: false,
		errMsg: undefined,
		val: capitalizedWords.join(separator),
	});
}

/**
 * Inject content scripts and CSS into a given tabID (top-level frame only).
 * Note: Chrome 61 blocks content scripts on the new tab page. Be
 * sure to check the current URL before calling this function, otherwise Chrome will throw
 * a permission error
 *
 * @memberOf BackgroundUtils
 *
 * @param  {number} tabId 		tab id
 * @param  {string} scriptfile	path to the js file
 * @param  {string} cssfile 	path to the css file
 * @param  {string} runAt		"document_start", "document_end", or "document_idle"
 * @return {Promise}			resolve yields no data, rejects yields error
 */
export function injectScript(tabId, scriptfile, cssfile, runAt) {
	return new Promise((resolve, reject) => {
		chrome.tabs.executeScript(tabId, { file: scriptfile, runAt }, () => {
			if (chrome.runtime.lastError) {
				log('injectScript error', chrome.runtime.lastError);
				reject(new Error(chrome.runtime.lastError));
				return;
			}

			if (cssfile) {
				chrome.tabs.insertCSS(tabId, { file: cssfile, runAt }, () => {
					if (chrome.runtime.lastError) {
						log('insertCSS error', chrome.runtime.lastError);
						reject(new Error(chrome.runtime.lastError));
						return;
					}
					resolve();
				});
			} else {
				resolve();
			}
		});
	});
}

/**
 * Inject dist/notifications.js content script.
 * @memberOf BackgroundUtils
 *
 * @param  {number} 	tab_id 			tab id
 * @param  {boolean} 	importExport 	true means that script is being injected
 * @return {Promise} 					resolve yields no data, rejects yields error
 */
export function injectNotifications(tab_id, importExport = false) {
	if (globals.NOTIFICATIONS_LOADED) {
		// return true to allow sendMessage calls to continue
		return Promise.resolve(true);
	}
	const tab = tabInfo.getTabInfo(tab_id);
	// check for prefetching, non http/s pages and Chrome (< 75) or Edge new tab page
	if (tab && (tab.prefetched === true || !tab.protocol.startsWith('http') ||
		tab.path.includes('_/chrome/newtab') || tab.host.includes('ntp.msn.com') ||
		(!importExport && globals.EXCLUDES.includes(tab.host)))) {
		// return false to prevent sendMessage calls
		return Promise.resolve(false);
	}

	return injectScript(tab_id, 'dist/notifications.js', '', 'document_start').then(() => {
		globals.NOTIFICATIONS_LOADED = true;
		return true;
	}).catch((err) => {
		log('injectNotifications error', err);
		return false; // prevent sendMessage calls
	});
}

/**
 * Compare semantic version strings
 * @param  {string} a 	semantic version (x.x.x)
 * @param  {string} b 	semantic version (x.x.x)
 * @return {int}		(a > b) = 1, (a < b) = -1, (a == b) = 0
 */
export function semverCompare(a, b) {
	const pa = a.split('.');
	const pb = b.split('.');
	for (let i = 0; i < 3; i++) {
		const na = Number(pa[i]);
		const nb = Number(pb[i]);
		if (na > nb) return 1;
		if (nb > na) return -1;
		if (!Number.isNaN(na) && Number.isNaN(nb)) return 1;
		if (Number.isNaN(na) && !Number.isNaN(nb)) return -1;
	}
	return 0;
}
