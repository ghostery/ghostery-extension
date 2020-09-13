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
	constructor() {
		this.isLog = chrome.runtime.getManifest().debug || false;
		this.objectOutputStyle = 'object'; // other option is 'json'

		this.coolBeans = [
			'Thanks for using Ghostery',
			'Try our desktop tracker blocker Midnight for free',
			'Try our tracker analytics tool Insights for free',
		];

		this.modules = {
			globals: {},
			conf: {},
		};

		this.actions = {
			hitABServerWithIr: ir => abtest.fetch(ir),
			toggleLogging: () => this._toggleLogging(),
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

	getABTests = () => {
		// eslint-disable-next-line no-console
		if (this.objectOutputStyle === 'object') {
			console.dir(abtest.getTests());
		}
		return 'These are all the A/B tests currently in memory';
	}

	_outputObjectSlice(obj, slice, objStr) {
		if (this.objectOutputStyle === 'object') {
			console.dir(getObjectSlice(obj, slice));
		} else if (this.objectOutputStyle === 'string') {
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

	static outputStyles = {
		argumentsHeader: 'font-weight: bold; padding: 2px 0px;',
		header: 'font-size: 16px; font-weight: bold; padding: 4px 0px',
	};

	static typeset(rawStrings) {
		const formattedLines = [];

		formattedLines.push('\n');

		rawStrings.forEach((rawString) => {
			if (typeof rawString === 'string') {
				formattedLines.push(rawString.trim());
				return;
			}

			if (typeof rawString === 'object') {
				const leftSide = rawString[0];
				const rightSide = rawString[1];
				const cssStyleMarkerLength =
					(leftSide.startsWith('__MAINHEADER__') && '__MAINHEADER__'.length)
					|| (leftSide.startsWith('__SUBHEADER__') && '__SUBHEADER__'.length)
					|| 0;
				formattedLines.push(
					leftSide.padEnd(40 + cssStyleMarkerLength, ' ').concat(rightSide).trim()
				);
			}
		});

		formattedLines.push('\n');

		return formattedLines;
	}

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

	help(fnName) {
		const fnNames = {
			getABTests: 'ghostery.getABTests()',
			getConfData: 'ghostery.getConfData()',
			getGlobals: 'ghostery.getGlobals()',
		};

		const header = [
			'__MAINHEADER__Ghostery Extension Debugger (GED) Help',
			'',
			'__SUBHEADER__Usage:',
			['ghostery.help()', 'Show this message'],
			["ghostery.help('functionName')", 'Show function usage details like supported argument types/values'],
			['', "Example: ghostery.help('getABTests')"],
		];

		const availableFunctions = [
			[`${fnNames.getABTests}`, 'Display what A/B tests have been fetched from the A/B test server'],
			[`${fnNames.getConfData}`, 'Show the current value of a config property or properties'],
			[`${fnNames.getGlobals}`, 'Show the current value of a global property or properties'],
		];

		const overview = [
			...header,
			'',
			'__SUBHEADER__Available functions:',
			...availableFunctions,
		];

		const getABTests = [
			`__MAINHEADER__${fnNames.getABTests}`,
			'Display what A/B tests have been fetched from the A/B test server',
			'Fetches happen on browser startup and then at regularly scheduled intervals',
			'',
			['__SUBHEADER__When called with...', 'Returns...'],
			['No argument or any arguments', 'The A/B test strings currently in memory'],
		];

		const getConfData = [
			`__MAINHEADER__${fnNames.getConfData}`,
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

		const getGlobals = [
			`__MAINHEADER__${fnNames.getGlobals}`,
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

		const invalidArgumentError = [
			`__MAINHEADER__'${fnName}' is not a GED function. Here are the valid ones:`,
			'',
			...availableFunctions,
		];

		let outputStrArr;
		const eeFnName = (fnName && typeof fnName === 'string' && fnName.toLowerCase()) || undefined;
		if 		(fnName === undefined) 			outputStrArr = overview;
		else if (eeFnName === 'getabtests') 	outputStrArr = getABTests;
		else if (eeFnName === 'getconfdata')	outputStrArr = getConfData;
		else if (eeFnName === 'getglobals')		outputStrArr = getGlobals;
		else 									outputStrArr = invalidArgumentError;

		GhosteryDebug.printToConsole(GhosteryDebug.typeset(outputStrArr));

		return (pickRandomArrEl(this.coolBeans).val);
	}

	status() {
		alwaysLog(
			`\nLogging: ${this.isLog ? 'ON' : 'OFF'}`
		);

		return ('~~~~~~~~~');
	}

	_toggleLogging() {
		this.isLog = !this.isLog;

		return (`Logging is ${this.isLog ? 'ON' : 'OFF'}`);
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
export const isLog = () => ghosteryDebug.isLog;
