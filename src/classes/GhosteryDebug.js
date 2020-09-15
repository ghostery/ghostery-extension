/**
 * Ghostery Debug Class
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

import abtest from './ABTest';
import account from './Account';
import confData from './ConfData';
import globals from './Globals';
import tabInfo from './TabInfo';
import foundBugs from './FoundBugs';
import PromoModals from './PromoModals';
import { alwaysLog } from '../utils/common';
import { getObjectSlice, pickRandomArrEl } from '../utils/utils';

/**
 * @class for debugging Ghostery via the background.js console.
 * @memberof BackgroundClasses
 */
class GhosteryDebug {
	// ToC
	// Search for these strings to quickly jump to their sections
	// [[Output styling and formatting]]
	// [[Help CLI & strings]]

	constructor() {
		this.settings._isLog = chrome.runtime.getManifest().debug || false;
		this.settings._objectOutputStyle = 'object'; // other option is 'json'

		this.modules = {
			globals: {},
			conf: {},
		};

		this.actions = {
			forcePromoModalDisplay: modal => PromoModals.forceDisplay(modal),
		};

		this.accountEvents = [];
		this.browserInfo = globals.BROWSER_INFO;
		this.extensionInfo = {
			name: globals.EXTENSION_NAME,
			version: globals.EXTENSION_VERSION,
		};
		this.globals = { ...globals };

		const _cookieChangeEvent = (changeInfo) => {
			const { removed, cookie, cause } = changeInfo;
			const { domain, name } = cookie;
			if (domain.includes(globals.GHOSTERY_ROOT_DOMAIN)) {
				const type = `Cookie ${name} ${removed ? 'Removed' : 'Added'}`;
				this.addAccountEvent(type, cause, cookie);
			}
		};

		// Chrome Documentation: https://developer.chrome.com/extensions/cookies#event-onChanged
		// Mozilla Documentation: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/onChanged
		chrome.cookies.onChanged.addListener(_cookieChangeEvent);
	}

	// START [[Output styling and formatting]] SECTION
	static outputStyles = {
		argumentsHeader: 'font-weight: bold; padding: 2px 0px;',
		header: 'font-size: 16px; font-weight: bold; padding: 4px 0px',
	};

	/**
	 * Output an array of strings to the console
	 * Scans strings for CSS markers, applies the specified styles when they are found,
	 * and removes the markers from the final output
	 *
	 * @param {Array}		lines	An array of strings to be logged, each possibly starting with a CSS marker
	 * @return {undefined}			No explicit return value
	 */
	static printToConsole(lines) {
		// Individual log statements for each line allow for
		// more legible and appealing output spacing and formatting
		lines.forEach((line) => {
			if (line.startsWith('__MAINHEADER__')) {
				// eslint-disable-next-line no-console
				console.log(
					`%c${line.replace('__MAINHEADER__', '')}`,
					GhosteryDebug.outputStyles.header
				);
			} else if (line.startsWith('__SUBHEADER__')) {
				// eslint-disable-next-line no-console
				console.log(
					`%c${line.replace('__SUBHEADER__', '')}`,
					GhosteryDebug.outputStyles.argumentsHeader
				);
			} else {
				// eslint-disable-next-line no-console
				console.log(line);
			}
		});
	}

	/**
	 * Takes an array whose elements are either strings or two element string arrays
	 * and processes it into an array of strings ready for printing to the console
	 * String input array elements are passed through unaltered
	 * String array input array elements have their elements concatenated with padding to create neat columns
	 * Newlines are added at the beginning and the end
	 *
	 * @param {Array}	rawTexts	An array of strings and/or two element string arrays
	 * @return {Array}				An array of strings tidied and padded for printing
	 */
	static typeset(rawTexts) {
		const formattedLines = [];

		formattedLines.push('\n');

		rawTexts.forEach((rawText) => {
			if (typeof rawText === 'string') {
				formattedLines.push(rawText);
				return;
			}

			if (typeof rawText === 'object') {
				const leftSide = rawText[0];
				const rightSide = rawText[1];
				const cssStyleMarkerLength =
					(leftSide.startsWith('__MAINHEADER__') && '__MAINHEADER__'.length)
					|| (leftSide.startsWith('__SUBHEADER__') && '__SUBHEADER__'.length)
					|| 0;
				formattedLines.push(
					leftSide.padEnd(40 + cssStyleMarkerLength, ' ').concat(rightSide)
				);
			}
		});

		formattedLines.push('\n');

		return formattedLines;
	}
	// END [[Output styling and formatting]] SECTION

	// START [[Help CLI & strings]] SECTION
	// The order of definition matters in this section:
	// it appears that static class fields must be defined
	// before they can be referenced by other static class fields
	static helpFunctionNames = {
		getABTests: 'ghostery.getABTests()',
		getConfData: 'ghostery.getConfData()',
		getGlobals: 'ghostery.getGlobals()',
		hitABServerWithIr: 'ghostery.hitABServerWithIr()',
	};

	static helpAvailableFunctions = [
		[`${this.helpFunctionNames.getABTests}`, 'Display what A/B tests have been fetched from the A/B test server'],
		[`${this.helpFunctionNames.getConfData}`, 'Show the current value of a config property or properties'],
		[`${this.helpFunctionNames.getGlobals}`, 'Show the current value of a global property or properties'],
		[`${this.helpFunctionNames.hitABServerWithIr}`, 'Hit the A/B server endpoint with the supplied install random number'],
	];

	static helpHeader = [
		'__MAINHEADER__Ghostery Extension Debugger (GED) Help',
		'',
		'__SUBHEADER__Usage:',
		['ghostery.help()', 'Show this message'],
		["ghostery.help('functionName')", 'Show function usage details like supported argument types/values'],
		['', "Example: ghostery.help('getABTests')"],
	];

	static helpPromoMessages = [
		'Thanks for using Ghostery',
		'Try our desktop tracker blocker Midnight for free',
		'Try our tracker analytics tool Insights for free',
	];

	static helpGetABTests = [
		`__MAINHEADER__${this.helpFunctionNames.getABTests}`,
		'Display what A/B tests have been fetched from the A/B test server',
		'Fetches happen on browser startup and then at regularly scheduled intervals',
		'',
		['__SUBHEADER__When called with...', 'Returns...'],
		['No argument or any arguments', 'The A/B test strings currently in memory'],
	];

	static helpGetConfData = [
		`__MAINHEADER__${this.helpFunctionNames.getConfData}`,
		'Display the current value(s) of a config property or properties',
		'',
		['__SUBHEADER__When called with...', 'Returns...'],
		['No argument', 'The whole config object'],
		['A property key string', 'An object with just that property'],
		['', "Example: ghostery.getConfData('enable_smart_block')"],
		['A property key regex', 'An object with all matching properties'],
		['', 'Example: ghostery.getConfData(/setup_/)'],
		['Anything else', 'The whole config object. Also returned if there are no matching results'],
	];

	static helpGetGlobals = [
		`__MAINHEADER__${this.helpFunctionNames.getGlobals}`,
		'Display the current value(s) of a global property or properties',
		'',
		['__SUBHEADER__When called with...', 'Returns...'],
		['No argument', 'The whole globals object'],
		['A property key string', 'An object with just that property'],
		['', "Example: ghostery.getGlobals('BROWSER_INFO')"],
		['A property key regex', 'An object with all matching properties'],
		['', 'Example: ghostery.getGlobals(/ACCOUNT_/)'],
		['Anything else', 'The whole globals object. Also returned if there are no matching results'],
	];

	static helpHitABServerWithIr = [
		`__MAINHEADER__${this.helpFunctionNames.hitABServerWithIr}`,
		'A random number between 1 and 100 is generated and saved to local storage',
		'when the extension is first installed. This number is included in requests',
		'to the A/B test server as the value of the ir query parameter, and it determines',
		'which test buckets the user is placed in.',
		'This function lets you hit the A/B server with any valid ir number',
		'to make it easier to check whether different A/B tests are returned as expected',
		'and check the functionality of the different test scenarios',
		'',
		['__SUBHEADER__When called with...', 'Returns...'],
		['A number between 1 and 100', 'The tests returned by the A/B server for that ir value'],
	];

	static helpOverview = [
		...this.helpHeader,
		'',
		'__SUBHEADER__Available functions:',
		...this.helpAvailableFunctions,
	];

	// eslint-disable-next-line class-methods-use-this
	help(fnName) {
		const {
			helpAvailableFunctions,
			helpPromoMessages,
			helpGetABTests,
			helpGetConfData,
			helpGetGlobals,
			helpHitABServerWithIr,
			helpOverview,
		} = GhosteryDebug;

		const invalidArgumentError = [
			`__MAINHEADER__'${fnName}' is not a GED function. Here are the valid ones:`,
			'',
			...helpAvailableFunctions,
		];

		let outputStrArr;
		const eeFnName = (fnName && typeof fnName === 'string' && fnName.toLowerCase()) || undefined;
		if 		(fnName === undefined) 				outputStrArr = helpOverview;
		else if (eeFnName === 'getabtests') 		outputStrArr = helpGetABTests;
		else if (eeFnName === 'getconfdata')		outputStrArr = helpGetConfData;
		else if (eeFnName === 'getglobals')			outputStrArr = helpGetGlobals;
		else if (eeFnName === 'hitabserverwithir')	outputStrArr = helpHitABServerWithIr;
		else 										outputStrArr = invalidArgumentError;

		GhosteryDebug.printToConsole(GhosteryDebug.typeset(outputStrArr));

		// Display a little ad or thank you note instead of "undefined"
		return (pickRandomArrEl(helpPromoMessages).val);
	}
	// END [[Help CLI & strings]] SECTION

	getABTests = () => {
		// eslint-disable-next-line no-console
		if (this.settings._objectOutputStyle === 'object') {
			console.dir(abtest.getTests());
		}
		return 'These are all the A/B tests currently in memory';
	}

	hitABServerWithIr = (ir) => {
		abtest.fetch(ir);
		return 'These are the A/B tests the A/B server returns when called with the supplied ir';
	}

	_outputObjectSlice(obj, slice, objStr) {
		if (this.settings._objectOutputStyle === 'object') {
			console.dir(getObjectSlice(obj, slice));
		} else if (this.settings._objectOutputStyle === 'string') {
			console.log(JSON.stringify(getObjectSlice(obj, slice)));
		}

		if (slice === undefined) {
			return `That's the whole ${objStr} object`;
		}

		if (typeof slice === 'string') {
			return `That's property you asked for, or the whole ${objStr} object if we didn't find it`;
		}

		if (typeof slice === 'object' && typeof slice.test === 'function') {
			return `That's the matching subset of properties, or the whole ${objStr} object if there were no matches`;
		}

		return `That argument wasn't valid, but here's the whole ${objStr} object`;
	}

	getConfData = slice => this._outputObjectSlice(confData, slice, 'config');

	getGlobals = slice => this._outputObjectSlice(globals, slice, 'globals');

	settings = {
		// Private properties added in the constructor:
		// _isLog						stores log toggle setting
		// _objectOutputStyle	 		stores object output style setting
		show: () => {
			alwaysLog(
				`\nLogging: ${this.settings._isLog ? 'ON' : 'OFF'}`
			);

			return ('~~~~~~~~~');
		},
		toggleLogging: () => {
			this.settings._isLog = !this.settings._isLog;

			return (`Logging is ${this.settings._isLog ? 'ON' : 'OFF'}`);
		},
	}

	init() {
		this.extensionInfo.installDate = confData.install_date;
		this.extensionInfo.versionHistory = confData.version_history;
		this.configurationData = { ...confData };
	}

	addAccountEvent(type, event, details) {
		const timestamp = new Date();
		const pushObj = { type, event, timestamp };
		if (details) {
			pushObj.details = details;
		}

		this.accountEvents.push(pushObj);
	}

	/**
	 * TODO: Review / revise this
	 * this.tabInfo[tabId] properties update without re-calling getTabInfo.
	 * this.foundApps[tabId].foundApps properties update without re-calling getTabInfo.
	 * this.foundApps[tabId].foundBugs properties update without re-calling getTabInfo.
	 *   No need to call `window.GHOSTERY.getTabInfo()` to see changes to object properties.
	 *   You will need to call `window.GHOSTERY` again to see changes as console object
	 *   properties are fixed to when the object was read by the console.
	 *   Only object properties will update, no new tabIds will be added.
	 *   Reloading the tab will end these updates.
	 */
	getActiveTabInfoAsync() {
		function _getActiveTabIds() {
			return new Promise((resolve) => {
				chrome.tabs.query({
					active: true,
				}, (tabs) => {
					if (chrome.runtime.lastError) {
						return resolve(chrome.runtime.lastError.message);
					}
					const tabIds = tabs.map(tab => tab.id);
					return resolve(tabIds);
				});
			});
		}

		alwaysLog('Results will be in the `activeTabInfo` property when the Promise resolves');

		return new Promise((resolve) => {
			_getActiveTabIds().then((tabIds) => {
				this.activeTabInfo = {
					activeTabIds: tabIds,
					tabInfo: { ...tabInfo._tabInfo },
					foundBugs: {
						foundApps: { ...foundBugs._foundApps },
						foundBugs: { ...foundBugs._foundBugs },
					},
				};
				resolve(tabIds);
			});
		});
	}

	getUserData() {
		function _getUserCookies() {
			return new Promise((resolve) => {
				chrome.cookies.getAll({
					url: globals.COOKIE_URL,
				}, resolve);
			});
		}

		function _getUser() {
			return new Promise((resolve) => {
				account.getUser().then(resolve).catch(resolve);
			});
		}

		function _getUserSettings() {
			return new Promise((resolve) => {
				account.getUserSettings().then(resolve).catch(resolve);
			});
		}

		function _getUserSubscriptionData() {
			return new Promise((resolve) => {
				account.getUserSubscriptionData().then(resolve).catch(resolve);
			});
		}

		return new Promise((resolve) => {
			Promise.all([
				_getUserCookies(),
				_getUser(),
				_getUserSettings(),
				_getUserSubscriptionData(),
			]).then(([userCookies, userData, syncedUserSettings, userSubscriptionData]) => {
				this.user = {
					userCookies,
					userData,
					syncedUserSettings,
					userSubscriptionData,
				};
				resolve(this.user);
			});
		});
	}

	getDebugInfo() {
		return new Promise((resolve) => {
			Promise.all([
				this.getTabInfo(),
				this.getUserData(),
			]).then(() => {
				resolve(this);
			});
		});
	}
}

const ghosteryDebug = new GhosteryDebug();
export default ghosteryDebug;

// extracted to minimize import surface into utils/common.js
export const isLog = () => ghosteryDebug.settings._isLog;
