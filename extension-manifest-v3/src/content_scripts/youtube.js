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

import { showIframe, closeIframe } from '@ghostery/ui/iframe';
import detectWall from '@ghostery/ui/youtube/wall';
import { isPaused } from '/store/options';

async function isFeatureDisabled() {
  const { options, youtubeDontAsk } = await chrome.storage.local.get([
    'options',
    'youtubeDontAsk',
  ]);

  if (
    // User's choice to not show the wall
    youtubeDontAsk ||
    // Terms not accepted or paused
    !options ||
    !options.terms ||
    isPaused(options, 'youtube.com')
  ) {
    return true;
  }

  return false;
}

// INFO: Safari always returns false for `inIncognitoContext`
if (!chrome.extension.inIncognitoContext) {
  (async () => {
    if (await isFeatureDisabled()) return;

    window.addEventListener('yt-navigate-start', () => closeIframe(), true);

    detectWall(async () => {
      if (await isFeatureDisabled()) return;

      showIframe(
        chrome.runtime.getURL(
          `/pages/youtube/index.html?url=${encodeURIComponent(
            window.location.href,
          )}`,
        ),
        '460px',
      );
    });
  })();
}
