/**
 * Setup File for Jest
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

//Set stubs for all chrome.* methods and properties
import chrome from 'sinon-chrome';

// Create global stubs
global.chrome = chrome;
chrome.runtime.getManifest.returns({
	version: '7.0.0',
	debug: true
});

// Initialization for Globals.js
Object.defineProperty(navigator, 'userAgent', {
	value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
	writable: false
});
