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
import { isLog, activateLog } from '../utils/common';
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
const ACCOUNT_EVENTS_CAP = 1000;

/**
 * Class that implements an interactive console debugger.
 *
 * @since 8.5.3
 *
 * @memberOf  BackgroundClasses
 */
class Debugger {
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

		this._accountEvents = [];

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
	 *  `Debugger._printToConsole` helper. Applies the provided styles
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
			Debugger._outputStyles[style]
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
	 * @param 	{Array} lines		An array of strings and/or objects to be logged. Strings may start with a CSS marker.
	 * @return 	{undefined}			No explicit return.
	 */
	static _printToConsole(lines) {
		// Individual log statements for each line allow for
		// more legible and appealing output spacing and formatting
		lines.forEach((line) => {
			// eslint-disable-next-line no-console
			if (typeof line === 'object')				console.dir(line);
			else if (line.startsWith(CSS_MAINHEADER)) 	Debugger._printFormatted(line, CSS_MAINHEADER);
			else if (line.startsWith(CSS_SUBHEADER))	Debugger._printFormatted(line, CSS_SUBHEADER);
			else if (line.startsWith(CSS_HIGHLIGHT))	Debugger._printFormatted(line, CSS_HIGHLIGHT);
			// eslint-disable-next-line no-console
			else										console.log(line);
		});
	}

	/**
	 * @private
	 * @since 8.5.3
	 *
	 * Takes an array whose elements are a combination of strings, two element string arrays, and objects
	 * and processes it into an array ready for printing to the console by `Debugger#_printToConsole`.
	 * String and object input array elements are passed through unaltered.
	 * String array input array elements have their elements concatenated with padding to create columns.
	 * Newlines are added at the beginning and the end.
	 *
	 * @param 	{Array} rawTexts	An array of string, two element string arrays, and/or objects.
	 * @return 	{Array}				An array of strings and/or objects tidied and padded for printing.
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
		getActiveTabInfo: 'ghostery.getActiveTabInfo()',
		getConfData: 'ghostery.getConfData()',
		getGlobals: 'ghostery.getGlobals()',
		getUserData: 'ghostery.getUserData()',
		openIntroHub: 'ghostery.openIntroHub()',
		openPanel: 'ghostery.openPanel()',
		showPromoModal: 'ghostery.showPromoModal()',
		settingsShow: 'ghostery.settings.show()',
		settingsToggleLogging: 'ghostery.settings.toggleLogging()',
		settingsToggleOutputStyle: 'ghostery.settings.toggleOutputStyle()',
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
	 * Brief descriptions of the debugger API main methods. Displayed in the main help menu.
	 */
	static _helpAvailableFunctions = [
		[`${this._helpFunctionNames.fetchABTestsWithIr}`, 'Hit the A/B server endpoint with the supplied install random number'],
		[`${this._helpFunctionNames.getABTests}`, 'Display what A/B tests have been fetched from the A/B test server'],
		[`${this._helpFunctionNames.getActiveTabInfo}`, 'Shows TabInfo and FoundBugs data for any active tabs'],
		[`${this._helpFunctionNames.getConfData}`, 'Show the current value of a config property or properties'],
		[`${this._helpFunctionNames.getGlobals}`, 'Show the current value of a global property or properties'],
		[`${this._helpFunctionNames.getUserData}`, 'Show account data for the logged in user and account event history'],
		[`${this._helpFunctionNames.openIntroHub}`, 'Open the Ghostery Intro Hub in a new tab for automation testing'],
		[`${this._helpFunctionNames.openPanel}`, 'Open the Ghostery panel window in a new tab for automation testing'],
		[`${this._helpFunctionNames.showPromoModal}`, 'Show specified promo modal at the next opportunity'],
	]

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * Brief descriptions of the debugger API settings methods. Displayed in the main help menu.
	 */
	static _helpAvailableSettingsFunctions = [
		[`${this._helpFunctionNames.settingsShow}`, 'Show the current debugger settings'],
		[`${this._helpFunctionNames.settingsToggleLogging}`, 'Toggle all other debug logging on/off'],
		[`${this._helpFunctionNames.settingsToggleOutputStyle}`, 'Change debugger method return value formatting'],
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
		'',
		`${CSS_SUBHEADER}Available settings functions:`,
		...this._helpAvailableSettingsFunctions,
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
	 * The help text for the public `getActiveTabInfo()` method.
	 * Displayed after calling ghostery.help('getActiveTabInfo').
	 */
	static helpGetActiveTabInfo = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.getActiveTabInfo}`,
		'Display the current value(s) of an active tab property or properties',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Returns...'],
		['No argument', 'The whole ActiveTabInfo object'],
		['A property key string', 'An object with just that property'],
		['', "Example: ghostery.getActiveTabInfo('activeTabIds | foundBugs | tabInfo')"],
		['Anything else', 'The whole ActiveTabInfo object. Also returned if there are no matching results'],
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
	 * The help text for the public `getUserData()` method.
	 * Displayed after calling ghostery.help('getUserData').
	 */
	static helpGetUserData = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.getUserData}`,
		'Display account details for the logged-in user, or an error message if no user is logged in.',
		`Also display up to ${ACCOUNT_EVENTS_CAP} of the most recent account events`,
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Returns...'],
		['No/any argument(s)', "Account event history and the user's account details,"],
		['', 'subscription details, synced settings, and cookies'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `openIntroHub()` method.
	 * Displayed after calling ghostery.help('openIntroHub').
	 */
	static helpOpenIntroHub = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.openIntroHub}`,
		'Open the Ghostery Intro Hub in a new tab for automation testing.',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Opens...'],
		['No argument', 'The hub on the default route'],
		['modal', 'The hub with any promo modals displayed'],
	];

	/**
	 * @access private
	 * @since 8.5.3
	 *
	 * The help text for the public `openPanel()` method.
	 * Displayed after calling ghostery.help('openPanel').
	 */
	static helpOpenPanel = [
		`${CSS_MAINHEADER}${this._helpFunctionNames.openPanel}`,
		'Open the Ghostery panel window in a new tab for automation testing.',
		'Uses the current active tabID to populate panel data.',
		'',
		[`${CSS_SUBHEADER}When called with...`, 'Opens...'],
		['No argument', 'The standard panel for desktop'],
		['mobile', 'The mobile panel for Android'],
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
	 * @param 	{String} fnName		The name of the function for which help output was requested.
	 * @return 	{Array} 			Returns the help strings array for the requested function, or an error strings array if the argument is missing or not supported.
	 */
	static _assembleHelpStringArr(fnName) {
		const {
			_helpMainMenu,
			_helpAvailableFunctions,
			helpFetchABTestsWithIr,
			helpGetABTests,
			helpGetActiveTabInfo,
			helpGetConfData,
			helpGetGlobals,
			helpGetUserData,
			helpOpenIntroHub,
			helpOpenPanel,
			helpShowPromoModal,
			helpSettingsShow,
			helpSettingsToggleLogging,
			helpSettingsToggleOutputStyle,
		} = Debugger;

		const invalidArgumentError = [
			`${CSS_MAINHEADER}'${fnName}' is not a GED function. Here are the valid ones:`,
			'',
			..._helpAvailableFunctions,
		];

		const helpStringArr = [];
		const eeFnName = (fnName && typeof fnName === 'string' && fnName.toLowerCase()) || undefined;
		if 		(fnName === undefined) 				helpStringArr.push(..._helpMainMenu);
		else if (eeFnName === 'fetchabtestswithir')	helpStringArr.push(...helpFetchABTestsWithIr);
		else if (eeFnName === 'getabtests') 		helpStringArr.push(...helpGetABTests);
		else if (eeFnName === 'getactivetabinfo')	helpStringArr.push(...helpGetActiveTabInfo);
		else if (eeFnName === 'getconfdata')		helpStringArr.push(...helpGetConfData);
		else if (eeFnName === 'getglobals')			helpStringArr.push(...helpGetGlobals);
		else if (eeFnName === 'getuserdata')		helpStringArr.push(...helpGetUserData);
		else if (eeFnName === 'openintrohub')		helpStringArr.push(...helpOpenIntroHub);
		else if (eeFnName === 'openpanel')			helpStringArr.push(...helpOpenPanel);
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
	 * @param	{String} [fnName]	The name of the function for which help output was requested, if any.
	 * @return 	{String} 			An ad or thank you message (printed to the console as the last line of output).
	 */
	help = (fnName) => {
		const {
			_assembleHelpStringArr,
			_helpPromoMessages,
			_printToConsole,
			_typeset
		} = Debugger;

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
	/**
	 * @since 8.5.3
	 *
	 * Hits the A/B server with a user-supplied `ir` value and prints the return value to the console,
	 * or an error if the call did not work, or no argument was supplied, or an invalid argument was supplied.
	 * Part of the public CLI.
	 *
	 * @param 	{Number} ir			The ir value to use. Should be an integer between 1 and 100 inclusive.
	 * @return 	{Promise|String}	Returns a tip string if the argument was missing or invalid. Otherwise, returns the Promise for the call to the A/B server. This Promise, once it resolves or rejects, returns a thank you message.
	 */
	fetchABTestsWithIr = (ir) => {
		if (ir === undefined) {
			Debugger._printToConsole(Debugger._typeset([
				`${CSS_SUBHEADER}Oops: required argument missing`,
				'You must provide an integer number argument between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		if (typeof ir !== 'number') {
			Debugger._printToConsole(Debugger._typeset([
				`${CSS_SUBHEADER}Oops: invalid argument type`,
				'The argument must be an integer between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		if ((ir < 1) || (ir > 100)) {
			Debugger._printToConsole(Debugger._typeset([
				`${CSS_SUBHEADER}Oops: invalid argument value`,
				'The argument must be an integer >between 1 and 100 inclusive<',
			]));
			return UP_REMINDER;
		}

		if (Math.floor(ir) !== ir) {
			Debugger._printToConsole(Debugger._typeset([
				`${CSS_SUBHEADER}Oops: invalid argument value`,
				'The argument must be an >integer< between 1 and 100 inclusive',
			]));
			return UP_REMINDER;
		}

		Debugger._printToConsole(Debugger._typeset([
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
				Debugger._printToConsole(Debugger._typeset(output));

				return THANKS;
			})
			.catch(() => {
				const output = [];
				output.push(`${CSS_HIGHLIGHT}Something went wrong with the call to the A/B server`);
				output.push('If this keeps happening, we would greatly appreciate hearing about it at support@ghostery.com');
				output.push('The tests in memory were not updated, but here they are anyway just in case:');
				this._push(abtest.getTests(), output);
				Debugger._printToConsole(Debugger._typeset(output));

				return THANKS;
			}));
	}

	/**
	 * @since 8.5.3
	 *
	 * Make a request to the CMP server for the most up-to-date campaigns info and print the result to the console,
	 * or an error if something went wrong with the request. Part of the public API.
	 *
	 * @return {Promise|String}		The Promise for the call to the CMP server. Once the Promise resolves or rejects, it returns a thank you message.
	 */
	fetchCMPCampaigns = () => {
		Debugger._printToConsole(Debugger._typeset([
			'We are about to make an async call to the CMP server. Results should appear below shortly:'
		]));

		return (cmp.debugFetch()
			.then((result) => {
				const output = [];

				if (result.ok) {
					output.push(`${CSS_HIGHLIGHT}The call to the CMP server succeeded`);
					if (result.testsUpdated) {
						output.push('New campaigns were found. The updated campaigns are:');
					} else {
						output.push('No new campaigns were found. Here are the (unupdated) campaigns now in memory:');
					}
					this._push((getObjectSlice(globals, 'SESSION').val.CMP_DATA), output);
				} else {
					output.push(`${CSS_HIGHLIGHT}Something went wrong with the call to the CMP server`);
					output.push('If this keeps happening, we would greatly appreciate hearing about it at support@ghostery.com');
					output.push('The campaigns in memory were not updated, but here they are anyway just in case:');
					this._push((getObjectSlice(globals, 'SESSION').val.CMP_DATA), output);
				}

				Debugger._printToConsole(Debugger._typeset(output));

				return THANKS;
			})
			.catch(() => {
				const output = [];
				output.push(`${CSS_HIGHLIGHT}Something went wrong with the call to the CMP server`);
				output.push('If this keeps happening, we would greatly appreciate hearing about it at support@ghostery.com');
				output.push('The campaigns in memory were not updated, but here they are anyway just in case:');
				this._push((getObjectSlice(globals, 'SESSION').val.CMP_DATA), output);

				Debugger._printToConsole(Debugger._typeset(output));

				return THANKS;
			})
		);
	}

	/**
	 * @since 8.5.3
	 *
	 * Print the AB tests currently in memory.
	 *
	 * @return {String}		A thank you message.
	 */
	getABTests = () => {
		const output = [];
		const tests = abtest.getTests();

		output.push(`${CSS_SUBHEADER}These are all the A/B tests currently in memory:`);
		this._push(tests, output);
		Debugger._printToConsole(Debugger._typeset(output));

		return (THANKS);
	}

	/**
	 * @since 8.5.3
	 *
	 * Print the requested conf value or values (from ConfData).
	 *
	 * @param	{String|RegExp} [slice]		A string property key or a regexp literal intended to match a subset of properties.
	 * @return 	{String}					A thank you message.
	 */
	getConfData = slice => this._printObjectSlice(confData, slice, 'config');

	/**
	 * @since 8.5.3
	 *
	 * Print the requested global value or values (from Globals).
	 *
	 * @param	{String|RegExp} [slice]		A string property key or a regexp literal intended to match a subset of properties.
	 * @return 	{String}					A thank you message.
	 */
	getGlobals = slice => this._printObjectSlice(globals, slice, 'globals');

	/**
	 * @since 8.5.3
	 *
	 * Open the Ghostery panel window in a new tab for automation testing. Uses
	 * the current active tabID to populate panel data.
	 *
	 * @param 	{String} [mobile]		Open the Android panel if value is 'mobile'.
	 * @return 	{String}				A thank you message.
	 */
	openPanel = (mobile) => {
		chrome.tabs.query({
			active: true
		}, (tabs) => {
			if (chrome.runtime.lastError) {
				Debugger._printToConsole(Debugger._typeset([
					`${CSS_SUBHEADER}Error fetching active tab:`,
					`${chrome.runtime.lastError.message}`,
				]));
			} else if (tabs.length === 0) {
				Debugger._printToConsole(Debugger._typeset([
					`${CSS_SUBHEADER}Error fetching active tab:`,
					'Active tab not found',
				]));
			} else {
				const android = (mobile && mobile.toLowerCase() === 'mobile') ? '_android' : '';
				chrome.tabs.create({
					url: chrome.runtime.getURL(`app/templates/panel${android}.html?tabId=${tabs[0].id}`),
					active: true
				});
			}
		});
		return THANKS;
	}

	/**
	 * @since 8.5.3
	 *
	 * Open the Ghostery Intro Hub in a new tab for automation testing.
	 *
	 * @param  	{String} [modal=''] 	Trigger upgrade modal(s) in addition to opening the hub if the value is 'modal'.
	 * @return 	{String}				A thank you message.
	 */
	openIntroHub = (modal = '') => {
		const showModal = modal.toLowerCase() === 'modal';
		chrome.tabs.create({
			url: chrome.runtime.getURL(`./app/templates/hub.html?justInstalled=true&pm=${showModal}`),
			active: true
		});
		return THANKS;
	}

	/**
	 * @since 8.5.3
	 *
	 * Get all info for the active tab(s), including TabInfo, FoundBugs and active tab IDs.
	 *
	 * @param  	{String|RegExp} [slice]		Limit the debugger output to a particular slice of the activeTabInfo object.
	 * @return 	{String}					A thank you message.
	 */
	getActiveTabInfo = (slice) => {
		chrome.tabs.query({
			active: true,
		}, (tabs) => {
			if (chrome.runtime.lastError) {
				Debugger._printToConsole(Debugger._typeset([
					`${CSS_SUBHEADER}Error fetching active tab:`,
					`${chrome.runtime.lastError.message}`,
				]));
			} else if (tabs.length === 0) {
				Debugger._printToConsole(Debugger._typeset([
					`${CSS_SUBHEADER}Error fetching active tab:`,
					'Active tab not found',
				]));
			} else {
				const tabIds = tabs.map(tab => tab.id);
				this._printObjectSlice({
					activeTabIds: tabIds,
					tabInfo: { ...tabInfo._tabInfo },
					foundBugs: {
						foundApps: { ...foundBugs._foundApps },
						foundBugs: { ...foundBugs._foundBugs },
					},
				}, slice, 'ActiveTabInfo');
			}
		});
		return THANKS;
	}

	/**
	 * @since 8.5.3
	 *
	 * Print the logged in user's account information, settings, and subscription data to the console
	 * (or an error message if no user is logged in). Also print a log of account events.
	 *
	 * @return {Promise}		The Promise for the calls to the account server. When the Promise fulfills, it returns a thank you message.
	 */
	getUserData = () => {
		function _getUserCookies() {
			return new Promise((resolve) => {
				chrome.cookies.getAll({
					url: globals.COOKIE_URL,
				}, resolve);
			});
		}

		const _getUserSettings = () => new Promise(r => account.getUserSettings().catch(r).then(r));

		const _getUserSubscriptionData = () => new Promise(r => account.getUserSubscriptionData().catch(r).then(r));

		const _printError = (error) => {
			const output = [];

			output.push(`${CSS_HIGHLIGHT}There was an error getting the user data:`);
			this._push(error, output);

			Debugger._printToConsole(Debugger._typeset(output));

			return THANKS;
		};

		const _printUserData = ([userCookies, userData, syncedUserSettings, userSubscriptionData]) => {
			this._printObjectSlice({
				userCookies,
				userData,
				syncedUserSettings,
				userSubscriptionData,
			}, undefined, 'UserData');

			return THANKS;
		};

		const _printAccountEvents = () => {
			const output = [];
			const accountEvents = this._accountEvents.map(([timestamp, details]) => [JSON.stringify(timestamp), details]);

			output.push("Here are the account events we've recorded during this session:");
			this._push(Object.fromEntries(accountEvents), output);

			Debugger._printToConsole(Debugger._typeset(output));

			return THANKS;
		};

		return Promise.all([
			_getUserCookies(),
			account.getUser(),
			_getUserSettings(),
			_getUserSubscriptionData(),
		])
			.then(data => _printUserData(data))
			.catch(error => _printError(error))
			.finally(() => _printAccountEvents());
	}

	/**
	 * @since 8.5.3
	 *
	 * Force the specified promo modal to trigger once, at the next opportunity.
	 *
	 * @param 	{String} modalType		The modal to trigger. The help output for this function shows currently valid values, which may vary over time as modals are added and removed. Valid values are also printed if an invalid one is supplied.
	 * @return 	{String}				A thank you message.
	 */
	showPromoModal = (modalType) => {
		const result = PromoModals.showOnce(modalType);

		if (result === 'success') {
			const { val: cappedModalType } = capitalize(modalType.toLowerCase());
			Debugger._printToConsole(
				Debugger._typeset([
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
				...Debugger._assembleHelpStringArr('showPromoModal')
			];
			Debugger._printToConsole(Debugger._typeset(noDice));

			return (THANKS);
		}

		Debugger._printToConsole(Debugger._typeset([
			'The function neither succeeded nor failed. If you have a minute to spare, we would greatly appreciate hearing about this likely bug at support@ghostery.com.',
		]));

		return ('Welcome to the Twilight Zone');
	}

	// [[Main Actions]] public wrt to other background code, but intentionally not fully exposed to the console
	/**
	 * @since 8.5.3
	 *
	 * Adds an entry to the account event log maintained by the Debugger instance,
	 * adding a timestamp to the provided event details.
	 * Not intended for use from the command line.
	 *
	 * @param {String}	type		The event type. For example, 'migrate'. User defined - any value is valid.
	 * @param {String}	event		What happened. For example, 'migrate start'. User defined.
	 * @param {*}		details		Additional details. For example, a cookie object associated with a cookie change event.
	 */
	addAccountEvent(type, event, details) {
		const timestamp = new Date();
		const pushObj = { type, event };
		if (details) {
			pushObj.details = details;
		}

		this._accountEvents.push([timestamp, pushObj]);

		if (this._accountEvents.length > ACCOUNT_EVENTS_CAP) {
			// Performance should be ok even for a somewhat large array:
			// https://medium.com/@erictongs/the-best-way-to-remove-the-first-element-of-an-array-in-javascript-shift-vs-splice-694378a7b416
			this._accountEvents.shift();
		}
	}

	// [[Main Actions]] private helpers
	/**
	 * @private
	 * @since 8.5.3
	 *
	 * Gets and prints the requested slice of the supplied object.
	 *
	 * @param 	{Object} obj			The object to print a slice from.
	 * @param 	{String|RegExp}	slice	The specific property (if string) or property subset (if regex) slice to print.
	 * @param 	{String} objStr			The name to use for the object in the output.
	 * @return 	{String}				A thank you message.
	 */
	_printObjectSlice(obj, slice, objStr) {
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

		Debugger._printToConsole(Debugger._typeset(output));

		return (THANKS);
	}

	/**
	 * @private
	 * @since 8.5.3
	 *
	 * Pushes the supplied object to the supplied array unaltered or JSON stringified depending on
	 * the Debugger instance's current object output style setting. Part of the output formatting pipeline.
	 *
	 * @param {Object} obj		The object to push to the array.
	 * @param {Array} arr		The array to push the object to.
	 */
	_push(obj, arr) {
		if (this.settings._objectOutputStyle === OBJECT_OUTPUT_STYLE) {
			arr.push(obj);
		} else if (this.settings._objectOutputStyle === STRING_OUTPUT_STYLE) {
			arr.push(JSON.stringify(obj));
		}
	}
	// END [[Main Actions]] SECTION

	// START [[Settings Actions]] SECTION
	/**
	 * @since 8.5.3
	 *
	 * Public CLI methods relating to debugger settings.
	 *
	 * @namespace
	 * @property {Function} show				- Print the current debugger settings.
	 * @property {Function} toggleLogging		- Toggle logging on and off. Overrides manifest debug setting.
	 * @property {Function} toggleOutputStyle	- Toggle object output style between 'object' and 'string'.
	 *
	 * @type {{toggleLogging: function(*=): string, show: function(*): string, toggleOutputStyle: function(*=): string}}
	 */
	// The closure tricks JSDoc into documenting the inner functions as expected.
	// eslint-disable-next-line arrow-body-style
	settings = (() => {
		return ({
			/**
			 * @since 8.5.3
			 *
			 * Prints the current debugger settings.
			 *
			 * @param 	{String} [_updated]		A setting to highlight because it was just updated. Used internally by the methods that update settings and not intended for use in the public CLI.
			 * @return 	{String}				A thank you message.
			 */
			show: (_updated) => {
				const _updatedOrCurrent = (_updated === 'logging' || _updated === 'outputStyle') ? 'Updated' : 'Current';
				const potentialLoggingHighlight = (_updated === 'logging') ? CSS_HIGHLIGHT : '';
				const potentialOutputStyleHighlight = (_updated === 'outputStyle') ? CSS_HIGHLIGHT : '';

				const currentSettings = [
					`${CSS_MAINHEADER}${_updatedOrCurrent} Settings`,
					[
						`${potentialLoggingHighlight}Logging`,
						`${this.settings._isLog ? 'On' : 'Off'}`
					],
					[
						`${potentialOutputStyleHighlight}Object Output Style`,
						`${this.settings._objectOutputStyle === OBJECT_OUTPUT_STYLE ? 'Object' : 'String'}`
					],
				];

				Debugger._printToConsole(Debugger._typeset(currentSettings));

				return (THANKS);
			},

			/**
			 * @since 8.5.3
			 *
			 * Toggle the logging setting, or set to optional specific value.
			 * Prints all settings with the updated logging setting highlighted.
			 *
			 * @param 	{String} [newValue]		Explicitly turns logging 'on' or 'off', if provided.
			 * @return 	{String}				A thank you message.
			 */
			toggleLogging: (newValue) => {
				this._toggleSetting('on', 'off', '_isLog', newValue);
				activateLog(this.settings._isLog);
				return (this.settings.show('logging'));
			},

			/**
			 * @since 8.5.3
			 *
			 * Toggle the output style setting, or set to optional specific value.
			 * Prints all settings with the updated output style setting highlighted.
			 *
			 * @param 	{String} [newValue]		Explicitly sets output style to 'object' or 'string', if provided.
			 * @return 	{String}				A thank you message.
			 */
			toggleOutputStyle: (newValue) => {
				this._toggleSetting('object', 'string', '_objectOutputStyle', newValue);
				return (this.settings.show('outputStyle'));
			},
		});
	})()

	/**
	 * @private
	 * @since 8.5.3
	 *
	 * Toggle the requested debugger setting, or set it to the optional specific requested value.
	 * Helper abstraction used by the public CLI's settings toggle methods.
	 *
	 * @param 	{String} optOn			The 'activate option' string.
	 * @param	{String} optOff			The 'deactivate option' string.
	 * @param	{String} setting		The debugger setting to adjust.
	 * @param	{String} [requested]	A specific value to set the option to. Used if it matches either the optOn or the optOff value.
	 */
	_toggleSetting(optOn, optOff, setting, requested) {
		if 		(typeof requested !== 'string')			this.settings[setting] = !this.settings[setting];
		else if (requested.toLowerCase() === optOn) 	this.settings[setting] = true;
		else if (requested.toLowerCase() === optOff) 	this.settings[setting] = false;
		else 											this.settings[setting] = !this.settings[setting];
	}
	// END [[Settings Actions]] SECTION
}

export default new Debugger();
