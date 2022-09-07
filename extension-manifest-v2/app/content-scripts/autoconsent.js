/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import AutoConsent from '@duckduckgo/autoconsent';
import { showIframe } from '@ghostery/ui/autoconsent/iframe';

let watchMode = false;

const consent = new AutoConsent((msg) => {
	if (watchMode && msg.type === 'popupFound') {
		watchMode = false;
		showIframe(chrome.runtime.getURL('app/templates/autoconsent.html'));
	}

	return chrome.runtime.sendMessage(
		{ ...msg, action: 'autoconsent' },
	);
});

chrome.runtime.onMessage.addListener((msg) => {
	if (msg.action === 'autoconsent') {
		if (msg.type === 'initResp') {
			watchMode = !msg.config.autoAction;
		}

		return Promise.resolve(consent.receiveMessageCallback(msg));
	}

	return false;
});
