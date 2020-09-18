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
import { alwaysLog, isLog, activateLog } from '../utils/common';
import { capitalize, getObjectSlice, pickRandomArrEl } from '../utils/utils';

/**
 * @class for debugging Ghostery via the background.js console.
 * @memberof BackgroundClasses
 */

const OBJECT_OUTPUT_STYLE = true;
const STRING_OUTPUT_STYLE = false;

const THANKS = 'Thanks for using Ghostery';
const UP_REMINDER = 'Remember you can press up to avoid having to retype your previous command';
const CSS_SUBHEADER = '__SUBHEADER__';

class GhosteryDebug {
	// ToC
	// Search for these strings to quickly jump to their sections
	// [[Output styling, formatting, and printing]]
	// [[Help CLI & strings]]
	// [[Main Actions]]
	// [[Settings Actions]]

	constructor() {
		this.settings._isLog = isLog();
		this.settings._objectOutputStyle = OBJECT_OUTPUT_STYLE; // other option is 'json'

		this.accountEvents = [];

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

	// START [[Output styling, formatting, and printing]] SECTION
	static outputStyles = {
		highlight: 'font-weight: bold; padding: 2px 0px;',
		mainheader: 'font-size: 16px; font-weight: bold; padding: 4px 0px',
		subheader: 'font-weight: bold; padding: 2px 0px;',
	};

	/** private printToConsole helper that applies specified formatting
	 *  to a line of text, removes the CSS marker from it, and prints it
	 *
	 * @param {String}	text		the string to output
	 * @param {String}	style		the style to apply
	 */
	static printFormatted(text, style) {
		// eslint-disable-next-line no-console
		console.log(
			`%c${text.replace(`__${style.toUpperCase()}__`, '')}`,
			GhosteryDebug.outputStyles[style]
		);
	}

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
			// eslint-disable-next-line no-console
			if (typeof line === 'object')				console.dir(line);
			else if (line.startsWith('__MAINHEADER__')) GhosteryDebug.printFormatted(line, 'mainheader');
			else if (line.startsWith(CSS_SUBHEADER))	GhosteryDebug.printFormatted(line, 'subheader');
			else if (line.startsWith('__HIGHLIGHT__'))	GhosteryDebug.printFormatted(line, 'highlight');
			// eslint-disable-next-line no-console
			else										console.log(line);
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

			if ((!Array.isArray(rawText)) && (typeof rawText === 'object')) {
				formattedLines.push(rawText);
			}

			if (Array.isArray(rawText)) {
				const leftSide = rawText[0];
				const rightSide = rawText[1];
				const cssStyleMarkerLength =
					(leftSide.startsWith('__MAINHEADER__') && '__MAINHEADER__'.length)
					|| (leftSide.startsWith(CSS_SUBHEADER) && CSS_SUBHEADER.length)
					|| (leftSide.startsWith('__HIGHLIGHT__') && '__HIGHLIGHT__'.length)
					|| 0;
				formattedLines.push(
					leftSide.padEnd(40 + cssStyleMarkerLength, ' ').concat(rightSide)
				);
			}
		});

		formattedLines.push('\n');

		return formattedLines;
	}
	// END [[Output styling, formatting, and printing]] SECTION

	// START [[Help CLI & strings]] SECTION
	// The order of definition matters in this section:
	// it appears that static class fields must be defined
	// before they can be referenced by other static class fields
	static helpFunctionNames = {
		fetchABTestsWithIr: 'ghostery.fetchABTestsWithIr()',
		getABTests: 'ghostery.getABTests()',
		getConfData: 'ghostery.getConfData()',
		getGlobals: 'ghostery.getGlobals()',
		showPromoModal: 'ghostery.showPromoModal()',
		settingsToggleOutputStyle: 'ghostery.settings.toggleOutputStyle()',
		settingsShow: 'ghostery.settings.show()',
		settingsToggleLogging: 'ghostery.settings.toggleLogging()',
	};

	static helpHeader = [
		'__MAINHEADER__Ghostery Extension Debugger (GED) Help',
		'',
		`${CSS_SUBHEADER}Usage:`,
		['ghostery.help()', 'Show this message'],
		["ghostery.help('functionName')", 'Show function usage details like supported argument types/values'],
		['', "Example: ghostery.help('getABTests')"],
	];

	static helpAvailableFunctions = [
		[`${this.helpFunctionNames.fetchABTestsWithIr}`, 'Hit the A/B server endpoint with the supplied install random number'],
		[`${this.helpFunctionNames.getABTests}`, 'Display what A/B tests have been fetched from the A/B test server'],
		[`${this.helpFunctionNames.getConfData}`, 'Show the current value of a config property or properties'],
		[`${this.helpFunctionNames.getGlobals}`, 'Show the current value of a global property or properties'],
		[`${this.helpFunctionNames.showPromoModal}`, 'Show specified promo modal at the next opportunity'],
		[`${this.helpFunctionNames.settingsToggleOutputStyle}`, 'Change debugger method return value formatting'],
		[`${this.helpFunctionNames.settingsShow}`, 'Show the current debugger settings'],
		[`${this.helpFunctionNames.settingsToggleLogging}`, 'Toggle all other debug logging on/off'],
	];

	static helpOverview = [
		...this.helpHeader,
		'',
		'__SUBHEADER__Available functions:',
		...this.helpAvailableFunctions,
	];

	static helpFetchABTestsWithIr = [
		`__MAINHEADER__${this.helpFunctionNames.fetchABTestsWithIr}`,
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

	static helpShowPromoModal = [
		`__MAINHEADER__${this.helpFunctionNames.showPromoModal}`,
		'Force the specified promo modal to display at the next opportunity.',
		'That may be, for example, the next time you open the extension panel.',
		'Resets after one display. If you need to see the modal again, call this function again',
		'',
		['__SUBHEADER__When called with...', 'Does...'],
	];

	static helpSettingsShow = [
		`__MAINHEADER__${this.helpFunctionNames.settingsShow}`,
		'Show the current debugger settings.',
		'Settings persist until you end the browser session',
		'',
		['__SUBHEADER__Setting', 'Explanation'],
		['Logging', 'Turn extension debug output on/off'],
		['Object Output Style', 'Set return value display style to object or string'],
	];

	static helpSettingsToggleLogging = [
		`__MAINHEADER__${this.helpFunctionNames.settingsToggleLogging}`,
		'Toggle regular debug output on/off.',
		'This overrides the debug property in the manifest',
		'and allows you to turn on logging in production builds',
		"and any other builds that don't have debug set in the manifest",
		'',
		['__SUBHEADER__When called with...', 'Does...'],
		["'ON'", 'Turns logging on'],
		["'OFF'", 'Turns logging off'],
		['Any other argument or no argument', 'Turns logging on if it was off and vice versa'],
	]

	static helpSettingsToggleOutputStyle = [
		`__MAINHEADER__${this.helpFunctionNames.settingsToggleOutputStyle}`,
		'Change the output style for debugger method return values.',
		'Strings are easy to copy and easier to grok at a glance.',
		'Object style output looks nicer and shows the structure better',
		'',
		['__SUBHEADER__When called with...', 'Does...'],
		["'OBJECT'", 'Debugger method return values will now be output as objects'],
		["'STRING'", 'Debugger method return values will now be output as strings'],
		['Any other argument or no argument', 'Changes the output style from the current setting to the other one'],
	];

	static helpPromoMessages = [
		THANKS,
		'Try our desktop tracker blocker Midnight for free',
		'Try our tracker analytics tool Insights for free',
	];

	static _assembleHelpStringArr(fnName) {
		const {
			helpOverview,
			helpAvailableFunctions,
			helpFetchABTestsWithIr,
			helpGetABTests,
			helpGetConfData,
			helpGetGlobals,
			helpShowPromoModal,
			helpSettingsShow,
			helpSettingsToggleLogging,
			helpSettingsToggleOutputStyle,
		} = GhosteryDebug;

		const invalidArgumentError = [
			`__MAINHEADER__'${fnName}' is not a GED function. Here are the valid ones:`,
			'',
			...helpAvailableFunctions,
		];

		const helpStringArr = [];
		const eeFnName = (fnName && typeof fnName === 'string' && fnName.toLowerCase()) || undefined;
		if 		(fnName === undefined) 				helpStringArr.push(...helpOverview);
		else if (eeFnName === 'getabtests') 		helpStringArr.push(...helpGetABTests);
		else if (eeFnName === 'getconfdata')		helpStringArr.push(...helpGetConfData);
		else if (eeFnName === 'getglobals')			helpStringArr.push(...helpGetGlobals);
		else if (eeFnName === 'fetchabtestswithir')	helpStringArr.push(...helpFetchABTestsWithIr);
		else if (eeFnName === 'showpromomodal') {
			helpStringArr.push(...helpShowPromoModal);
			const activeModalTypes = PromoModals.getActiveModalTypes();
			activeModalTypes.forEach((amt) => {
				const { val: cappedAmt } = capitalize(amt.toLowerCase());
				helpStringArr.push([
					`'${amt}'`, `Open the ${cappedAmt} modal at the next opportunity`,
				]);
			});
		} else if (eeFnName === 'show')				helpStringArr.push(...helpSettingsShow);
		else if (eeFnName === 'togglelogging')		helpStringArr.push(...helpSettingsToggleLogging);
		else if (eeFnName === 'toggleoutputstyle')	helpStringArr.push(...helpSettingsToggleOutputStyle);
		else 										helpStringArr.push(...invalidArgumentError);

		return helpStringArr;
	}

	// eslint-disable-next-line class-methods-use-this
	help(fnName) {
		const {
			_assembleHelpStringArr,
			helpPromoMessages,
			printToConsole,
			typeset
		} = GhosteryDebug;

		printToConsole(
			typeset(
				_assembleHelpStringArr(fnName)
			)
		);

		// Display a little ad or thank you note instead of "undefined"
		return (pickRandomArrEl(helpPromoMessages).val);
	}
	// END [[Help CLI & strings]] SECTION

	// START [[Main Actions]] SECTION
	// [[Main Actions]] public API
	showPromoModal = (modalType) => {
		const result = PromoModals.showOnce(modalType);

		if (result === 'success') {
			const { val: cappedModalType } = capitalize(modalType.toLowerCase());
			GhosteryDebug.printToConsole(
				GhosteryDebug.typeset([
					'__SUBHEADER__Success!',
					`The ${cappedModalType} modal will trigger at the next opportunity`,
				])
			);

			return (THANKS);
		}

		if (result === 'failure') {
			const noDice = [
				'__SUBHEADER__No dice',
				'That was not a valid argument. Here are the valid ones:',
				'',
				...GhosteryDebug._assembleHelpStringArr('showPromoModal')
			];
			GhosteryDebug.printToConsole(GhosteryDebug.typeset(noDice));

			return (THANKS);
		}

		GhosteryDebug.printToConsole(GhosteryDebug.typeset([
			'The function neither succeeded nor failed. If you have a minute to spare, we would greatly appreciate hearing about this likely bug at support@ghostery.com.',
		]));

		return ('Welcome to the Twilight Zone');
	}

	getABTests = () => {
		const output = [];
		const tests = abtest.getTests();

		output.push('__SUBHEADER__These are all the A/B tests currently in memory:');
		this._push(tests, output);
		GhosteryDebug.printToConsole(GhosteryDebug.typeset(output));

		return (THANKS);
	}

	fetchABTestsWithIr = (ir) => {
		if (ir === undefined) {
			GhosteryDebug.printToConsole(GhosteryDebug.typeset([
				'__SUBHEADER__Oops: required argument missing',
				'You must provide an integer number argument between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		if (typeof ir !== 'number') {
			GhosteryDebug.printToConsole(GhosteryDebug.typeset([
				'__SUBHEADER__Oops: invalid argument type',
				'The argument must be an integer between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		if ((ir < 1) || (ir > 100)) {
			GhosteryDebug.printToConsole(GhosteryDebug.typeset([
				'__SUBHEADER__Oops: invalid argument value',
				'The argument must be an integer >between 1 and 100 inclusive<',
			]));
			return UP_REMINDER;
		}

		if (Math.floor(ir) !== ir) {
			GhosteryDebug.printToConsole(GhosteryDebug.typeset([
				'__SUBHEADER__Oops: invalid argument value',
				'The argument must be an >integer< between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		GhosteryDebug.printToConsole(GhosteryDebug.typeset([
			'We are about to make an async call to the A/B server. Results should appear below shortly:'
		]));

		return (abtest.silentFetch(ir)
			.then((result) => {
				const output = [];
				if (result === 'resolved') {
					output.push(`__HIGHLIGHT__The call to the A/B server with ir=${ir} succeeded`);
					output.push('These are the tests that are now in memory:');
					this._push(abtest.getTests(), output);
				} else {
					output.push('__HIGHLIGHT__Something went wrong with the call to the A/B server');
					output.push('If this keeps happening, we would greatly appreciate hearing about it at support@ghostery.com');
					output.push('The tests in memory were not updated, but here they are anyway just in case:');
					this._push(abtest.getTests(), output);
				}
				GhosteryDebug.printToConsole(GhosteryDebug.typeset(output));

				return THANKS;
			})
			.catch(() => {
				const output = [];
				output.push('__HIGHLIGHT__Something went wrong with the call to the A/B server');
				output.push('If this keeps happening, we would greatly appreciate hearing about it at support@ghostery.com');
				output.push('The tests in memory were not updated, but here they are anyway just in case:');
				this._push(abtest.getTests(), output);
				GhosteryDebug.printToConsole(GhosteryDebug.typeset(output));

				return THANKS;
			}));
	}

	getConfData = slice => this._getObjectSlice(confData, slice, 'config');

	getGlobals = slice => this._getObjectSlice(globals, slice, 'globals');

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

		// TODO pipe through typeset and printToConsole
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

	// [[Main Actions]] private helpers
	_getObjectSlice(obj, slice, objStr) {
		const objSlice = getObjectSlice(obj, slice);
		const output = [];

		if (slice === undefined) {
			output.push(`__SUBHEADER__You didn't provide an argument, so here's the whole ${objStr} object:`);
		} else if (typeof slice === 'string') {
			if (objSlice.foundMatch) {
				output.push('__SUBHEADER__We found the property you asked for:');
			} else {
				output.push(`__SUBHEADER__We did not find '${slice}' on the ${objStr} object, so here is the whole thing instead:`);
			}
		} else if (slice instanceof RegExp) {
			if (objSlice.foundMatch) {
				output.push('__SUBHEADER__Here are the matches we found for that regex:');
			} else {
				output.push(`__SUBHEADER__That regex produced no matches, so here is the whole ${objStr} object instead:`);
			}
		}

		this._push(objSlice.val, output);

		GhosteryDebug.printToConsole(GhosteryDebug.typeset(output));

		return (THANKS);
	}

	_push(obj, arr) {
		if (this.settings._objectOutputStyle === OBJECT_OUTPUT_STYLE) {
			arr.push(obj);
		} else if (this.settings._objectOutputStyle === STRING_OUTPUT_STYLE) {
			arr.push(JSON.stringify(obj));
		}
	}
	// END [[Main Actions]] SECTION

	// START [[Settings Actions]] SECTION
	settings = {
		// Private properties added in the constructor:
		// _isLog						stores log toggle setting
		// _objectOutputStyle	 		stores object output style setting

		show: (updated) => {
			const updatedOrCurrent = (updated === 'logging' || updated === 'outputStyle') ? 'Updated' : 'Current';
			const potentialLoggingHighlight = (updated === 'logging') ? '__HIGHLIGHT__' : '';
			const potentialOutputStyleHighlight = (updated === 'outputStyle') ? '__HIGHLIGHT__' : '';

			const currentSettings = [
				`__MAINHEADER__${updatedOrCurrent} Settings`,
				[
					`${potentialLoggingHighlight}Logging`,
					`${this.settings._isLog ? 'On' : 'Off'}`
				],
				[
					`${potentialOutputStyleHighlight}Object Output Style`,
					`${this.settings._objectOutputStyle === OBJECT_OUTPUT_STYLE ? 'Object' : 'String'}`
				],
			];

			GhosteryDebug.printToConsole(GhosteryDebug.typeset(currentSettings));

			return (THANKS);
		},

		toggleLogging: (newValue) => {
			this.settings._toggleSettingHelper('on', 'off', '_isLog', newValue);
			activateLog(this.settings._isLog);
			return (this.settings.show('logging'));
		},

		toggleOutputStyle: (newValue) => {
			this.settings._toggleSettingHelper('object', 'string', '_objectOutputStyle', newValue);
			return (this.settings.show('outputStyle'));
		},

		_toggleSettingHelper: (optOn, optOff, setting, requested) => {
			if 		(typeof requested !== 'string')			this.settings[setting] = !this.settings[setting];
			else if (requested?.toLowerCase() === optOn) 	this.settings[setting] = true;
			else if (requested?.toLowerCase() === optOff) 	this.settings[setting] = false;
			else 											this.settings[setting] = !this.settings[setting];
		},
	}
	// END [[Settings Actions]] SECTION
}

const ghosteryDebug = new GhosteryDebug();
export default ghosteryDebug;
