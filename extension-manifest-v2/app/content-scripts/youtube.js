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

function isFeatureDisabled() {
	return new Promise((resolve) => {
		chrome.storage.local.get(['youtube_dont_show_again'], (storage) => {
			resolve(storage.youtube_dont_show_again);
		});
	});
}

if (!chrome.extension.inIncognitoContext) {
	(async () => {
		if (await isFeatureDisabled()) return;

		window.addEventListener('yt-navigate-start', () => {
			closeIframe();
		}, true);

		detectWall(async () => {
			if (await isFeatureDisabled()) return;

			showIframe(
				chrome.runtime.getURL(`app/templates/youtube.html?url=${encodeURIComponent(window.location.href)}`),
				'460px',
			);
		});
	})();
}
