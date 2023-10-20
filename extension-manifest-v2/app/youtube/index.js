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
import './components/message';
import { setupIframe, closeIframe } from '@ghostery/ui/iframe';

setupIframe();

const url = new URLSearchParams(window.location.search).get('url');

function open() {
	chrome.windows.create({
		url,
		incognito: true,
	});
}

mount(document.body, {
	content: () => html`
		<youtube-message
			onopen="${() => open()}"
			onclose="${() => closeIframe()}"
		></youtube-message>
	`,
});
