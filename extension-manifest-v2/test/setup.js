/**
 * Setup File for Jest
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

// Set stubs for all chrome.* methods and properties
import chrome from 'sinon-chrome';
// Mock fetch calls
import { enableFetchMocks } from 'jest-fetch-mock';
// Set up Enzyme for React Snapshot testing
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Fix libs/browser-info
// https://github.com/acvetkov/sinon-chrome/issues/111
delete chrome.runtime.getPlatformInfo;

// Disable logging
jest.mock('../src/utils/common', () => {
	const commonActual = jest.requireActual('../src/utils/common');
	return {
		...commonActual,
		log: () => false,
	};
});

enableFetchMocks();
Enzyme.configure({ adapter: new Adapter() });

// Fake the translation function to only return the translation key
global.t = function(str) {
	return str;
};

// Helper function to fake Fetch response
global.mockFetchResponse = function(responseCode, responseData) {
	fetch.mockReturnValue(Promise.resolve(new Response(responseData, {
		status: responseCode,
		headers: {
			'Content-type': 'application/json'
		}
	})));
};

// Create global stubs
global.chrome = chrome;
chrome.runtime.getManifest.returns({
	version: '8.5.0',
	debug: true
});

// Create Mock for Common modules
jest.mock('../src/classes/Common', () => ({
	modules: {
		adblocker: {
			background: {
				actions: {
					getAdBlockInfoForTab: jest.fn()
				}
			}
		},
		antitracking: {
			background: {
				actions: {
					aggregatedBlockingStats: jest.fn()
				}
			}
		}
	}
}));

// Create Mock for the Common dependencies
jest.mock('ghostery-common', () => ({ App: class App {} }));

// Initialization for Globals.js
Object.defineProperty(navigator, 'userAgent', {
	value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
	writable: false
});
