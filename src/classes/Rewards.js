/**
 * Rewards Class
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
 * Class for handling Ghostery Rewards Box overlay.
 * @memberOf  BackgroundClasses
 * @todo  make it a Singelton
 */
class Rewards {
	constructor() {
		this.rewardsData = {
			rewardName: 'test-reward'
		};
		this.ports = new Map();
	}

	showCircle(tab_id) {
		/* @TODO get any initial data from cmp event and add to this.rewardsData */

		const tab = tabInfo.getTabInfo(tab_id);

		// If the tab is prefetched, we can't add purplebox to it.
		if (!conf.enable_offers ||
			!tab || tab.rewards) {
			return Promise.resolve(false);
		}

		// Inject script cannot handle errors properly, but we call createBox after verifying that the tab is OK
		// So update hotdog status for this tab
		tabInfo.setTabInfo(tab_id, 'rewards', true);

		chrome.runtime.onConnect.addListener((port) => {
			if (port && port.name === 'rewardsPort' && port.sender && port.sender.tab && port.sender.tab.id) {
				const tabId = port.sender.tab.id;
				if (!this.ports.has(tabId)) {
					this.ports.set(tabId, port);
					this.ports.get(tabId).onMessage.addListener((message) => {
						if (message.name === 'rewardsLoaded') {
							setInterval(() => {
								this.ports.get(tabId).postMessage({ name: 'showCircle', message: this.rewardsData });
							}, 5000);
						}
						// else if (message.name === 'onCreateBox') {
						// 	this.updateBox(tabId);
						// } else if (message.name === 'onDestroyBox') {
						// 	this.destroyBox(tabId);
						// } else if (message.name === 'updateAlertConf') {
						// 	conf.alert_expanded = message.message.alert_expanded;
						// 	conf.alert_bubble_pos = message.message.alert_bubble_pos;
						// 	conf.alert_bubble_timeout = message.message.alert_bubble_timeout;
						// 	// push new settings to API
						// 	accounts.pushUserSettings({ conf: accounts.buildUserSettings() });
						// }
					});
				}
			}
		});

		// console.log('INJECT REWARDS');
		return injectScript(tab_id, 'dist/rewards.js', 'dist/css/purplebox_styles.css', 'document_start').then(() => {
			// console.log('REWARDS INJECTED');
		}).catch((err) => {
			log('rewards injectScript error', err);
			return false;
		});
	}
}

export default Rewards;
