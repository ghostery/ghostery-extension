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

import { clone } from 'underscore';
import button from './BrowserButton';
import cliqz from './Cliqz';
import conf from './Conf';
import tabInfo from './TabInfo';
import { log, prefsGet, prefsSet } from '../utils/common';
import { injectScript } from '../utils/utils';

/**
 * Class for handling Ghostery Rewards Box overlay.
 * @memberOf  BackgroundClasses
 * @todo  make it a Singelton
 */
class Rewards {
	constructor() {
		this.getStoredOffers();
		this.currentOffer = null;
		this.panelPort = null;
		this.ports = new Map();
		this.channelsSupported = (typeof chrome.runtime.onConnect === 'object');
		this.panelHubClosedListener = this.panelHubClosedListener.bind(this);
	}

	deleteReward(offerId) {
		delete this.storedOffers[offerId];
		// @TODO send signal?
		this.updateStoredOffers();
	}

	markRewardRead(offerId) {
		const rewardIdx = this.unreadOfferIds.indexOf(offerId);
		if (rewardIdx !== -1) {
			this.unreadOfferIds.splice(rewardIdx, 1);
			this.updateStoredOffers();
		}
	}

	sendSignal(message) {
		const {
			offerId, actionId, origin, type
		} = message;
		const signal = {
			type,
			origin: origin ? `ghostery-${origin}` : 'ghostery',
			data: {
				action_id: actionId,
			}
		};
		if (type === 'offer-action-signal') {
			signal.data.offer_id = offerId;
		}
		log('sendSignal: ', signal);
		cliqz.modules['offers-v2'].background.actions.processRealEstateMessage(signal);
	}

	async filterOffersByRemote() {
		await cliqz.modules['offers-v2'].isReady();
		const args = { filters: { by_rs_dest: 'ghostery' } };
		const offers = cliqz.modules['offers-v2'].background.actions.getStoredOffers(args);
		const newStoredOffers = {};
		(offers || []).forEach(({ offer_id: offerId, attrs = {}, offer_info: offerInfo }) => {
			const offer = (this.storedOffers || {})[offerId];
			if (offer) {
				const newOffer = clone(offer);
				newOffer.attrs = attrs;
				newOffer.offer_data = offerInfo;
				newStoredOffers[offerId] = newOffer;
			}
		});
		this.storedOffers = newStoredOffers;
		this.unreadOfferIds = this.unreadOfferIds.filter(id => newStoredOffers[id]);
	}

	async getStoredOffers() {
		const {
			storedOffers,
			unreadOfferIds,
			totalOffersSeen,
		} = await prefsGet('storedOffers', 'unreadOfferIds', 'totalOffersSeen');
		this.storedOffers = storedOffers || {};
		this.unreadOfferIds = unreadOfferIds || [];
		this.totalOffersSeen = totalOffersSeen || 0;
	}

	updateStoredOffers() {
		prefsSet({ storedOffers: this.storedOffers });
		prefsSet({ unreadOfferIds: this.unreadOfferIds }).then(() => { button.update(); });
	}

	showHotDogOrOffer(tab_id, offer) {
		this.updateStoredOffers();
		this.totalOffersSeen++;
		prefsSet({ totalOffersSeen: this.totalOffersSeen });
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
								const responseMessage = conf.rewards_opted_in ? 'showOffer' : 'showHotDog';
								switch (message.name) {
									case 'rewardsLoaded':
										this.ports.get(tabId).postMessage({
											name: responseMessage,
											reward: this.currentOffer,
											conf: {
												rewardsPromptAccepted: conf.rewards_accepted
											}
										});
										break;
									case 'rewardSignal':
										this.sendSignal(message.message);
										break;
									case 'rewardSeen':
										this.markRewardRead(message.offerId);
										button.update();
										break;
									default:
										break;
								}
							});
						}
					}
				});
			}
		}

		return injectScript(tab_id, 'dist/rewards.js', 'dist/css/rewards_styles.css', 'document_start').catch((err) => {
			log('rewards injectScript error', err);
			return false;
		});
	}

	panelHubClosedListener() {
		this.sendSignal({
			offerId: null,
			actionId: 'hub_closed',
			origin: 'rewards-hub',
			type: 'action-signal'
		});
	}
}

export default new Rewards();
