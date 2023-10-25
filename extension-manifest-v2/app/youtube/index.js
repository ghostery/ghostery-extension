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

function openPrivateWindow() {
	chrome.runtime.sendMessage({
		name: 'openNewPrivateTab',
		message: {
			url,
		},
	});
}

function openBlog(slug) {
	chrome.runtime.sendMessage({
		name: 'openNewTab',
		message: {
			url: `https://www.ghostery.com/blog/${slug}?utm_source=gbe&utm_campaign=youtube`,
			become_active: true,
		},
	});
}

function dontAsk() {
	chrome.storage.local.set({
		youtube_dont_show_again: true,
	});
	closeIframe();
}

mount(document.body, {
	content: () => html`
		<youtube-message
			onclose="${() => closeIframe()}"
			ondontask="${() => dontAsk()}"
			onopenblog1="${() => openBlog('enable-extensions-in-incognito')}"
			onopenblog2="${() => openBlog('whats-happening-with-youtube-ads')}"
			onopenprivatewindow="${() => openPrivateWindow()}"
		></youtube-message>
	`,
});
