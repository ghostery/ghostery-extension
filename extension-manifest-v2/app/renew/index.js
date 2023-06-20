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

import { mount, html } from 'hybrids';

import '@ghostery/ui/onboarding';
import { setupIframeSize, closeIframe } from '@ghostery/ui/iframe';

const timestamp = new URLSearchParams(window.location.search).get('timestamp');
setupIframeSize();

function renew() {
	chrome.runtime.sendMessage({ action: 'renew:clear' });
	closeIframe();
}

mount(document.body, {
	content: () => html`
		<ui-onboarding-renew
			timestamp="${timestamp}"
			onrenew="${renew}"
		  onignore="${() => closeIframe()}"
		></ui-onboarding-renew>
	`,
});

// Update lastSeen
chrome.storage.local.set({
	renew_setup: { timestamp, lastSeen: Date.now() },
});
