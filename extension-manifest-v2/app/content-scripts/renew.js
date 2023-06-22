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
import { showIframe } from '@ghostery/ui/iframe';

const HOUR_IN_MS = 1000 * 60 * 60;

chrome.runtime.sendMessage({ action: 'renew:setup' }).then((renew_setup) => {
	const now = Date.now();

	if (
		renew_setup &&
		renew_setup.timestamp > now &&
		renew_setup.lastSeen + HOUR_IN_MS < now
	) {
		showIframe(chrome.runtime.getURL(`app/templates/renew.html?timestamp=${renew_setup.timestamp}`), '360px');
	}
});
