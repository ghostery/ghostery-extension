/**
 * Debug Information
 *
 * This file asks the background for Ghostery Debug information
 * and writes the returned JSON to the body innerText.
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

chrome.runtime.sendMessage({ name: 'debug_information' }, (response) => {
	document.body.innerText = response;
});
