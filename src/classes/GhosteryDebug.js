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
import cmp from './CMP';
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
const CSS_SUBHEADER = 'css_subheader__';
const CSS_MAINHEADER = 'css_mainheader__';
const CSS_HIGHLIGHT = 'css_highlight__';
const OUTPUT_COLUMN_WIDTH = 40;

/**
 * Class that implements an interactive console debugger.
 *
 * @since 8.5.3
 *
 * @memberOf  BackgroundClasses
 */
class GhosteryDebug {
	// ToC
	// Search for these strings to quickly jump to their sections
	// [[Output styling, formatting, and printing]]
	// [[Help CLI & strings]]
	// [[Main Actions]]
	// [[Settings Actions]]

	constructor() {
		// Public settings methods are defined in a public instance field in the [[Settings Actions]] section
		// These are the private settings methods and properties
		this.settings._isLog = isLog();
		this.settings._objectOutputStyle = OBJECT_OUTPUT_STYLE;
		this.settings._toggleSettingHelper = (optOn, optOff, setting, requested) => {
			if 		(typeof requested !== 'string')			this.settings[setting] = !this.settings[setting];
			else if (requested?.toLowerCase() === optOn) 	this.settings[setting] = true;
			else if (requested?.toLowerCase() === optOff) 	this.settings[setting] = false;
			else 											this.settings[setting] = !this.settings[setting];
		};

		this.accountEvents = [];

		const _cookieChangeEvent = (changeInfo) => {
			const { removed, cookie, cause } = changeInfo;
			const { domain, name } = cookie;
			if (domain.includes(globals.GHOSTERY_ROOT_DOMAIN)) {
				const type = `Cookie ${name} ${removed ? 'Removed' : 'Added'}`;
				this._addAccountEvent(type, cause, cookie);
			}
		};

		// Chrome Documentation: https://developer.chrome.com/extensions/cookies#event-onChanged
		// Mozilla Documentation: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/onChanged
		chrome.cookies.onChanged.addListener(_cookieChangeEvent);
	}

	// START [[Output styling, formatting, and printing]] SECTION
	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * Styles used to format debugger output.
	 */
	static _outputStyles = {
		[CSS_HIGHLIGHT]: 'font-weight: bold; padding: 2px 0px;',
		[CSS_MAINHEADER]: 'font-size: 16px; font-weight: bold; padding: 4px 0px',
		[CSS_SUBHEADER]: 'font-weight: bold; padding: 2px 0px;',
	};

	/**
	 * @private
	 * @since 8.5.3
	 *
	 *  `GhosteryDebug._printToConsole` helper. Applies the provided styles
	 *  and prints the text argument.
	 *
	 * @param {String}	text		The string to output.
	 * @param {String}	style		The style to apply.
	 *
	 * @return {undefined}			No explicit return.
	 */
	static _printFormatted(text, style) {
		// eslint-disable-next-line no-console
		console.log(
			`%c${text.replace(style, '')}`,
			GhosteryDebug._outputStyles[style]
		);
	}

	/**
	 * @private
	 * @since 8.5.3
	 *
	 * Output an array of strings and/or objects to the browser developer console.
	 * Scans strings for CSS markers, applies the specified styles when they are found,
	 * and removes the markers from the final output.
	 *
	 * @param {Array} lines			An array of strings and/or objects to be logged. Strings may start with a CSS marker.
	 * @return {undefined}			No explicit return.
	 */
	static _printToConsole(lines) {
		// Individual log statements for each line allow for
		// more legible and appealing output spacing and formatting
		lines.forEach((line) => {
			// eslint-disable-next-line no-console
			if (typeof line === 'object')				console.dir(line);
			else if (line.startsWith(CSS_MAINHEADER)) 	GhosteryDebug._printFormatted(line, CSS_MAINHEADER);
			else if (line.startsWith(CSS_SUBHEADER))	GhosteryDebug._printFormatted(line, CSS_SUBHEADER);
			else if (line.startsWith(CSS_HIGHLIGHT))	GhosteryDebug._printFormatted(line, CSS_HIGHLIGHT);
			// eslint-disable-next-line no-console
			else										console.log(line);
		});
	}

	/**
	 * @private
	 * @since 8.5.3
	 *
	 * Takes an array whose elements are a combination of strings, two element string arrays, and objects
	 * and processes it into an array ready for printing to the console by `GhosteryDebug#_printToConsole`.
	 * String and object input array elements are passed through unaltered.
	 * String array input array elements have their elements concatenated with padding to create columns.
	 * Newlines are added at the beginning and the end.
	 *
	 * @param {Array} rawTexts		An array of string, two element string arrays, and/or objects.
	 * @return {Array}				An array of strings and/or objects tidied and padded for printing.
	 */
	static _typeset(rawTexts) {
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
					(leftSide.startsWith(CSS_MAINHEADER) && CSS_MAINHEADER.length)
					|| (leftSide.startsWith(CSS_SUBHEADER) && CSS_SUBHEADER.length)
					|| (leftSide.startsWith(CSS_HIGHLIGHT) && CSS_HIGHLIGHT.length)
					|| 0;
				formattedLines.push(
					leftSide.padEnd(OUTPUT_COLUMN_WIDTH + cssStyleMarkerLength, ' ').concat(rightSide)
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

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * Function name strings used in help output.
	 */
	static _helpFunctionNames = {
		fetchABTestsWithIr: 'ghostery.fetchABTestsWithIr()',
		getABTests: 'ghostery.getABTests()',
		getConfData: 'ghostery.getConfData()',
		getGlobals: 'ghostery.getGlobals()',
		showPromoModal: 'ghostery.showPromoModal()',
		settingsToggleOutputStyle: 'ghostery.settings.toggleOutputStyle()',
		settingsShow: 'ghostery.settings.show()',
		settingsToggleLogging: 'ghostery.settings.toggleLogging()',
	};

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * Header string for the help main menu.
	 */
	static _helpHeader = [
		`${CSS_MAINHEADER}Ghostery Extension Debugger (GED) Help`,
		'',
		`${CSS_SUBHEADER}Usage:`,
		['ghostery.help()', 'Show this message'],
		["ghostery.help('functionName')", 'Show function usage details like supported argument types/values'],
		['', "Example: ghostery.help('getABTests')"],
	];

	// In static fields, 'this' refers to the class instance, so this works,
	// as long as the referenced class property has already been defined
	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * Brief descriptions of the debugger API methods displayed in the main help menu.
	 */
	static _helpAvailableFunctions = [
		[`${this._helpFunctionNames.fetchABTestsWithIr}`, 'Hit the A/B server endpoint with the supplied install random number'],
		[`${this._helpFunctionNames.getABTests}`, 'Display what A/B tests have been fetched from the A/B test server'],
		[`${this._helpFunctionNames.getConfData}`, 'Show the current value of a config property or properties'],
		[`${this._helpFunctionNames.getGlobals}`, 'Show the current value of a global property or properties'],
		[`${this._helpFunctionNames.showPromoModal}`, 'Show specified promo modal at the next opportunity'],
		[`${this._helpFunctionNames.settingsToggleOutputStyle}`, 'Change debugger method return value formatting'],
		[`${this._helpFunctionNames.settingsShow}`, 'Show the current debugger settings'],
		[`${this._helpFunctionNames.settingsToggleLogging}`, 'Toggle all other debug logging on/off'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The entire help main menu text
	 */
	static _helpMainMenu = [
		...this._helpHeader,
		'',
		`${CSS_SUBHEADER}Available functions:`,
		...this._helpAvailableFunctions,
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `fetchABTestsWithIr()` method.
	 * Displayed after calling ghostery.help('fetchABTestsWithIr').
	 */
	static helpFetchABTestsWithIr = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.fetchABTestsWithIr}`,
		'A random number between 1 and 100 is generated and saved to local storage',
		'when the extension is first installed. This number is included in requests',
		'to the A/B test server as the value of the ir query parameter, and it determines',
		'which test buckets the user is placed in.',
		'This function lets you hit the A/B server with any valid ir number',
		'to make it easier to check whether different A/B tests are returned as expected',
		'and check the functionality of the different test scenarios',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Returns...'],
		['A number between 1 and 100', 'The tests returned by the A/B server for that ir value'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `getABTests()` method.
	 * Displayed after calling ghostery.help('getABTests').
	 */
	static helpGetABTests = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.getABTests}`,
		'Display what A/B tests have been fetched from the A/B test server',
		'Fetches happen on browser startup and then at regularly scheduled intervals',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Returns...'],
		['No argument or any arguments', 'The A/B test strings currently in memory'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `getConfData()` method.
	 * Displayed after calling ghostery.help('getConfData').
	 */
	static helpGetConfData = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.getConfData}`,
		'Display the current value(s) of a config property or properties',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Returns...'],
		['No argument', 'The whole config object'],
		['A property key string', 'An object with just that property'],
		['', "Example: ghostery.getConfData('enable_smart_block')"],
		['A property key regex', 'An object with all matching properties'],
		['', 'Example: ghostery.getConfData(/setup_/)'],
		['Anything else', 'The whole config object. Also returned if there are no matching results'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `getGlobals()` method.
	 * Displayed after calling ghostery.help('getGlobals').
	 */
	static helpGetGlobals = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.getGlobals}`,
		'Display the current value(s) of a global property or properties',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Returns...'],
		['No argument', 'The whole globals object'],
		['A property key string', 'An object with just that property'],
		['', "Example: ghostery.getGlobals('BROWSER_INFO')"],
		['A property key regex', 'An object with all matching properties'],
		['', 'Example: ghostery.getGlobals(/ACCOUNT_/)'],
		['Anything else', 'The whole globals object. Also returned if there are no matching results'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `showPromoModal()` method.
	 * Displayed after calling ghostery.help('showPromoModal').
	 */
	static helpShowPromoModal = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.showPromoModal}`,
		'Force the specified promo modal to display at the next opportunity.',
		'That may be, for example, the next time you open the extension panel.',
		'Resets after one display. If you need to see the modal again, call this function again',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Does...'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `settings.show()` method.
	 * Displayed after calling ghostery.help('show').
	 */
	static helpSettingsShow = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.settingsShow}`,
		'Show the current debugger settings.',
		'Settings persist until you end the browser session',
		'',
		[`${CSS_SUBHEADER}Setting`, 'Explanation'],
		['Logging', 'Turn extension debug output on/off'],
		['Object Output Style', 'Set return value display style to object or string'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `settings.toggleLogging()` method.
	 * Displayed after calling ghostery.help('toggleLogging').
	 */
	static helpSettingsToggleLogging = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.settingsToggleLogging}`,
		'Toggle regular debug output on/off.',
		'This overrides the debug property in the manifest',
		'and allows you to turn on logging in production builds',
		"and any other builds that don't have debug set in the manifest",
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Does...'],
		["'ON'", 'Turns logging on'],
		["'OFF'", 'Turns logging off'],
		['Any other argument or no argument', 'Turns logging on if it was off and vice versa'],
	]

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `settings.toggleOutputStyle()` method.
	 * Displayed after calling ghostery.help('toggleOutputStyle').
	 */
	static helpSettingsToggleOutputStyle = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.settingsToggleOutputStyle}`,
		'Change the output style for debugger method return values.',
		'Strings are easy to copy and easier to grok at a glance.',
		'Object style output looks nicer and shows the structure better',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Does...'],
		["'OBJECT'", 'Debugger method return values will now be output as objects'],
		["'STRING'", 'Debugger method return values will now be output as strings'],
		['Any other argument or no argument', 'Changes the output style from the current setting to the other one'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * Short ads and thank you messages used as the return value for `help` calls
	 * so they are printed to the console instead of `undefined`.
	 */
	static _helpPromoMessages = [
		THANKS,
		'Try our desktop tracker blocker & VPN Midnight for free',
		'Try our tracker research & analytics extension Insights for free',
		'Visit ghostery.com to learn more about our values and products',
	];

	/**
	 * @private
	 * @since 8.5.3
	 *
	 * Prepares and returns the help strings array for the requested function.
	 * Exists as a separate function so that public methods can concatenate some custom messages
	 * with standard help output before forwarding all the string to `_typeset` and `_printToConsole`.
	 *
	 * @param {String}	fnName		The name of the function for which help output was requested.
	 * @return {Array} 				Returns the help strings array for the requested function, or an error strings array if the argument is missing or not supported.
	 */
	static _assembleHelpStringArr(fnName) {
		const {
			_helpMainMenu,
			_helpAvailableFunctions,
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
			`${CSS_MAINHEADER}'${fnName}' is not a GED function. Here are the valid ones:`,
			'',
			..._helpAvailableFunctions,
		];

		const helpStringArr = [];
		const eeFnName = (fnName && typeof fnName === 'string' && fnName.toLowerCase()) || undefined;
		if 		(fnName === undefined) 				helpStringArr.push(..._helpMainMenu);
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

	/**
	 * @since 8.5.3
	 *
	 * Prints general and function-specific help output. Part of the public CLI.
	 *
	 * @param {String}	[fnName]	The name of the function for which help output was requested, if any.
	 * @return {String} 			An ad / thank you message (printed to the console as the last line of output).
	 */
	// eslint-disable-next-line class-methods-use-this
	help(fnName) {
		const {
			_assembleHelpStringArr,
			_helpPromoMessages,
			_printToConsole,
			_typeset
		} = GhosteryDebug;

		_printToConsole(
			_typeset(
				_assembleHelpStringArr(fnName)
			)
		);

		// Display a little ad or thank you note instead of "undefined"
		return (pickRandomArrEl(_helpPromoMessages).val);
	}
	// END [[Help CLI & strings]] SECTION

	// START [[Main Actions]] SECTION
	// [[Main Actions]] public API
	fetchABTestsWithIr = (ir) => {
		if (ir === undefined) {
			GhosteryDebug._printToConsole(GhosteryDebug._typeset([
				`${CSS_SUBHEADER}Oops: required argument missing`,
				'You must provide an integer number argument between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		if (typeof ir !== 'number') {
			GhosteryDebug._printToConsole(GhosteryDebug._typeset([
				`${CSS_SUBHEADER}Oops: invalid argument type`,
				'The argument must be an integer between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		if ((ir < 1) || (ir > 100)) {
			GhosteryDebug._printToConsole(GhosteryDebug._typeset([
				`${CSS_SUBHEADER}Oops: invalid argument value`,
				'The argument must be an integer >between 1 and 100 inclusive<',
			]));
			return UP_REMINDER;
		}

		if (Math.floor(ir) !== ir) {
			GhosteryDebug._printToConsole(GhosteryDebug._typeset([
				`${CSS_SUBHEADER}Oops: invalid argument value`,
				'The argument must be an >integer< between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		GhosteryDebug._printToConsole(GhosteryDebug._typeset([
			'We are about to make an async call to the A/B server. Results should appear below shortly:'
		]));

		return (abtest.silentFetch(ir)
			.then((result) => {
				const output = [];
				if (result === 'resolved') {
					output.push(`${CSS_HIGHLIGHT}The call to the A/B server with ir=${ir} succeeded`);
					output.push('These are the tests that are now in memory:');
					this._push(abtest.getTests(), output);
				} else {
					output.push(`${CSS_HIGHLIGHT}Something went wrong with the call to the A/B server`);
					output.push('If this keeps happening, we would greatly appreciate hearing about it at support@ghostery.com');
					output.push('The tests in memory were not updated, but here they are anyway just in case:');
					this._push(abtest.getTests(), output);
				}
				GhosteryDebug._printToConsole(GhosteryDebug._typeset(output));

				return THANKS;
			})
			.catch(() => {
				const output = [];
				output.push(`${CSS_HIGHLIGHT}Something went wrong with the call to the A/B server`);
				output.push('If this keeps happening, we would greatly appreciate hearing about it at support@ghostery.com');
				output.push('The tests in memory were not updated, but here they are anyway just in case:');
				this._push(abtest.getTests(), output);
				GhosteryDebug._printToConsole(GhosteryDebug._typeset(output));

				return THANKS;
			}));
	}

	fetchCMPCampaigns = () => {
		GhosteryDebug._printToConsole(GhosteryDebug._typeset([
			'We are about to make an async call to the CMP server. Results should appear below shortly:'
		]));

		return (cmp.debugFetch()
			.then((result) => {
				console.log(result);
				const session = getObjectSlice(globals, 'SESSION').val;
				console.log(session);
			})
			.catch(() => console.log('There was an error'))
		);
	}

	getABTests = () => {
		const output = [];
		const tests = abtest.getTests();

		output.push(`${CSS_SUBHEADER}These are all the A/B tests currently in memory:`);
		this._push(tests, output);
		GhosteryDebug._printToConsole(GhosteryDebug._typeset(output));

		return (THANKS);
	}

	getConfData = slice => this._getObjectSlice(confData, slice, 'config');

	getGlobals = slice => this._getObjectSlice(globals, slice, 'globals');

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

		// TODO pipe through _typeset and _printToConsole
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

	showPromoModal = (modalType) => {
		const result = PromoModals.showOnce(modalType);

		if (result === 'success') {
			const { val: cappedModalType } = capitalize(modalType.toLowerCase());
			GhosteryDebug._printToConsole(
				GhosteryDebug._typeset([
					`${CSS_SUBHEADER}Success!`,
					`The ${cappedModalType} modal will trigger at the next opportunity`,
				])
			);

			return (THANKS);
		}

		if (result === 'failure') {
			const noDice = [
				`${CSS_SUBHEADER}No dice`,
				'That was not a valid argument. Here are the valid ones:',
				'',
				...GhosteryDebug._assembleHelpStringArr('showPromoModal')
			];
			GhosteryDebug._printToConsole(GhosteryDebug._typeset(noDice));

			return (THANKS);
		}

		GhosteryDebug._printToConsole(GhosteryDebug._typeset([
			'The function neither succeeded nor failed. If you have a minute to spare, we would greatly appreciate hearing about this likely bug at support@ghostery.com.',
		]));

		return ('Welcome to the Twilight Zone');
	}

	// [[Main Actions]] private helpers
	_addAccountEvent(type, event, details) {
		const timestamp = new Date();
		const pushObj = { type, event, timestamp };
		if (details) {
			pushObj.details = details;
		}

		this.accountEvents.push(pushObj);
	}

	_getObjectSlice(obj, slice, objStr) {
		const objSlice = getObjectSlice(obj, slice);
		const output = [];

		if (slice === undefined) {
			output.push(`${CSS_SUBHEADER}You didn't provide an argument, so here's the whole ${objStr} object:`);
		} else if (typeof slice === 'string') {
			if (objSlice.foundMatch) {
				output.push(`${CSS_SUBHEADER}We found the property you asked for:`);
			} else {
				output.push(`${CSS_SUBHEADER}We did not find '${slice}' on the ${objStr} object, so here is the whole thing instead:`);
			}
		} else if (slice instanceof RegExp) {
			if (objSlice.foundMatch) {
				output.push(`${CSS_SUBHEADER}Here are the matches we found for that regex:`);
			} else {
				output.push(`${CSS_SUBHEADER}That regex produced no matches, so here is the whole ${objStr} object instead:`);
			}
		}

		this._push(objSlice.val, output);

		GhosteryDebug._printToConsole(GhosteryDebug._typeset(output));

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
		// _toggleSettingsHelper		helper method that provides a general implementation of setting toggling

		show: (updated) => {
			const updatedOrCurrent = (updated === 'logging' || updated === 'outputStyle') ? 'Updated' : 'Current';
			const potentialLoggingHighlight = (updated === 'logging') ? CSS_HIGHLIGHT : '';
			const potentialOutputStyleHighlight = (updated === 'outputStyle') ? CSS_HIGHLIGHT : '';

			const currentSettings = [
				`${CSS_MAINHEADER}${updatedOrCurrent} Settings`,
				[
					`${potentialLoggingHighlight}Logging`,
					`${this.settings._isLog ? 'On' : 'Off'}`
				],
				[
					`${potentialOutputStyleHighlight}Object Output Style`,
					`${this.settings._objectOutputStyle === OBJECT_OUTPUT_STYLE ? 'Object' : 'String'}`
				],
			];

			GhosteryDebug._printToConsole(GhosteryDebug._typeset(currentSettings));

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
	}
	// END [[Settings Actions]] SECTION
}

const ghosteryDebug = new GhosteryDebug();
export default ghosteryDebug;
