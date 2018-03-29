/**
 * Ghostery HotDog
 *
 * This file injects the Ghostery HotDog into
 * all pages except for ExtensionWeb and Platform pages
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
/**
 * @namespace HotDogContentScript
 */
/* eslint no-use-before-define: 0 */

import msgModule from './utils/msg';
import { log } from '../../src/utils/common';
// import closeIconImage from '../data-images/purple_box/closeIconImage';

const msg = msgModule('hotdog');
const { sendMessage } = msg;
const { onMessage } = chrome.runtime;

class HotDog {
	constructor() {
		console.log('hot dog constructor');
	}
}

const hotDog = new HotDog(window, document);
