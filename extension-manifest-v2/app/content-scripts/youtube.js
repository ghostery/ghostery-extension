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

import detectWall from '@ghostery/ui/youtube/wall';
import { showIframe, closeIframe } from '@ghostery/ui/iframe';

chrome.storage.local.get(['youtube_dont_show_again'], (storage) => {
	if (storage.youtube_dont_show_again || chrome.extension.inIncognitoContext) {
		return;
	}

	window.addEventListener('yt-navigate-start', () => {
		closeIframe();
	}, true);

	detectWall(() => {
		showIframe(
			chrome.runtime.getURL(`app/templates/youtube.html?url=${encodeURIComponent(window.location.href)}`),
			'460px',
		);
	});
});
