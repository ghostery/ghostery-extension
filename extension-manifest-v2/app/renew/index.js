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
import { setupIframe, closeIframe } from '@ghostery/ui/iframe';

const timestamp = new URLSearchParams(window.location.search).get('timestamp');
setupIframe();

function revoke() {
	chrome.runtime.sendMessage({ action: 'renew:revoke' });
	closeIframe();
}

mount(document.body, {
	content: () => html`
		<ui-onboarding-renew
			timestamp="${timestamp}"
			onrenew="${revoke}"
		  onignore="${() => closeIframe()}"
		></ui-onboarding-renew>
	`,
});
