/**
 * Rewards Class
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import cliqz from './Cliqz';
import conf from './Conf';
import { log } from '../utils/common';

/**
 * Class for handling Ghostery Rewards Box overlay.
 * @memberOf  BackgroundClasses
 */
class Rewards {
	constructor() {
		this.panelHubClosedListener = this.panelHubClosedListener.bind(this);
	}

  // used in Background
	sendSignal(message) { // TODO double check if need it
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

  // used in PanelData
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
