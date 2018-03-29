/**
 * HotDog Class
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

/* eslint consistent-return: 0 */

import conf from './Conf';
import tabInfo from './TabInfo';
import Policy from './Policy';
import globals from './Globals';
import { log } from '../utils/common';
import { sendMessage, injectScript } from '../utils/utils';
import * as accounts from '../utils/accounts';

const t = chrome.i18n.getMessage;
/**
 * Class for handling Ghostery HotDog Box overlay.
 * @memberOf  BackgroundClasses
 * @todo  make it a Singelton
 */
class HotDog {
	constructor() {

	}

	/**
	 * Build the hotdog.  Called from webNavigation.onCommitted handler
	 *
	 * @param  {number} tab_id		tab id
	 * @return {Promise}		resolves to true or false (success/failure)
	 */
	showCircle(tab_id) {
		console.log('showCircle HOT DOG');
		const tab = tabInfo.getTabInfo(tab_id);
		console.log(tab)
		// If the tab is prefetched, we can't add purplebox to it.
		if (!conf.enable_offers ||
			!tab || tab.hotDog) {
			return Promise.resolve(false);
		}

		/* @TODO continue rewrite of purplebox after here: */

		// Inject script cannot handle errors properly, but we call createBox after verifying that the tab is OK
		// So update hotdog status for this tab
		tabInfo.setTabInfo(tab_id, 'hotDog', true);

		console.log('INJECT THE DOG');
		return injectScript(tab_id, 'dist/hotdog.js', 'dist/css/purplebox_styles.css', 'document_start').then(() => {
			console.log('DOG INJECTED');
			// this.hotdog.createBox(tab_id).then((result) => {
			// 	foundBugs.update(tab_id);
			// 	button.update(tab_id);
			// }).catch((err) => {
			// 	log('HotDog creation failed:', err);
			// });

			// if (!this.channelsSupported) {
			// 	sendMessage(tab_id, 'createBox', this.createBoxParams, (response) => {
			// 		if (chrome.runtime.lastError) {
			// 			log('createBox sendMessage error', chrome.runtime.lastError);
			// 			return false;
			// 		}
			// 		// Run updateBox in case apps loaded before creating the box
			// 		this.updateBox(tab_id);
			// 		return true;
			// 	});
			// }
		}).catch((err) => {
			log('HotDog injectScript error', err);
			return false;
		});
	}

	/**
	 * Update the purple box with new bugs. Called from 'processBug'
	 * @param  {number} 	tab_id		tab id
	 * @param  {number} 	app_id		tracker id
	 */
	updateBox(tab_id, app_id) {
		// const tab = tabInfo.getTabInfo(tab_id);
		// const apps = foundBugs.getApps(tab_id, true, tab.url, app_id);
		// // prefetching and purplebox are already checked in background.js
		// if (!apps || apps.length === 0 || globals.EXCLUDES.includes(tab.host)) {
		// 	return false;
		// }
		//
		// if (this.channelsSupported) {
		// 	if (this.ports.has(tab_id)) {
		// 		console.log('update box.....???? what are apps...', apps);
		// 		this.ports.get(tab_id).postMessage({
		// 			name: 'updateBox',
		// 			message: { apps }
		// 		});
		// 		return true;
		// 	}
		// 	log('updateBox failed. Port is null');
		// 	return false;
		// }
		// sendMessage(tab_id, 'updateBox', {
		// 	apps
		// }, (response) => {
		// 	if (chrome.runtime.lastError) {
		// 		log('updateBox sendMessage failed', chrome.runtime.lastError, tab);
		// 	}
		// });
	}

	/**
	 * hotdog destructor
	 * @param  {number} tab_id 	tab id
	 */
	destroyBox(tab_id) {
		// const tab = tabInfo.getTabInfo(tab_id);
		// if (!tab || globals.EXCLUDES.includes(tab.host)) {
		// 	return;
		// }
		// if (this.channelsSupported) {
		// 	if (this.ports.has(tab_id)) {
		// 		this.ports.get(tab_id).disconnect();
		// 		this.ports.delete(tab_id);
		// 	}
		// }
		// tabInfo.setTabInfo(tab_id, 'purplebox', false);
		//
		//
		// return true;
	}
}

export default HotDog;
