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

import cliqz from './cliqz';
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
		this.storedOffers = {};
		this.unreadOfferIds = [];
		this.currentOffer = null;
		this.ports = new Map();
		this.channelsSupported = (typeof chrome.runtime.onConnect === 'object');
	}

	deleteReward(offerId) {
		this.storedOffers.delete(offerId);
		this.markRewardRead(offerId);
		// @TODO send signal?
	}

	markRewardRead(offerId) {
		const rewardIdx = this.unreadOfferIds.indexOf(offerId);
		this.unreadOfferIds.splice(rewardIdx, 1);
	}

	handleSignal(offerId, actionId) {
		console.log('handleSignal from Rewards.js');

		if (actionId === 'offer_shown') {
			this.markRewardRead(offerId);
		}

		const signal = {
			origin: 'ghostery',
			type: 'action-signal',
			data: {
				action_id: 'offer_shown',
				offer_id: offerId
			}
		};
		console.log(signal);
		cliqz.modules['offers-v2'].background.actions.processRealEstateMessage(signal);
	}

	showHotDog(tab_id, offer) {
		console.log('CHECK NEW OFFER ID', offer.offer_id);
		this.currentOffer = offer;
		const tab = tabInfo.getTabInfo(tab_id);

		// If the tab is prefetched, we can't add purplebox to it.
		if (!conf.enable_offers ||
			!tab || tab.rewards) {
			return Promise.resolve(false);
		}

		// Inject script cannot handle errors properly, but we call createBox after verifying that the tab is OK
		// So update hotdog status for this tab
		// tabInfo.setTabInfo(tab_id, 'rewards', true);
		if (this.channelsSupported) {
			if (this.ports.has(tab_id)) {
				this.ports.get(tab_id).disconnect();
				this.ports.delete(tab_id);
			}
			if (!this.connectListenerAdded) {
				this.connectListenerAdded = true;
				chrome.runtime.onConnect.addListener((port) => {
					if (port && port.name === 'rewardsPort' && port.sender && port.sender.tab && port.sender.tab.id) {
						const tabId = port.sender.tab.id;
						if (!this.ports.has(tabId)) {
							this.ports.set(tabId, port);
							this.ports.get(tabId).onMessage.addListener((message) => {
								if (message.name === 'rewardsLoaded') {
									this.ports.get(tabId).postMessage({ name: 'showHotDog', reward: this.currentOffer });
								} else if (message.name === 'rewardSignal') {
									this.handleSignal(message.rewardId);
								}
							});
						}
					}
				});
			}
		}

		// console.log('INJECT REWARDS');
		return injectScript(tab_id, 'dist/rewards.js', 'dist/css/rewards_styles.css', 'document_start').then(() => {
			// console.log('REWARDS INJECTED');
		}).catch((err) => {
			log('rewards injectScript error', err);
			return false;
		});
	}
}

export default new Rewards();
