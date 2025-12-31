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

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { browser, expect, $ } from '@wdio/globals';

import { enableExtension } from '../utils.js';

async function loadURL(url, delay = 5000) {
  await browser.url(url, { wait: 'complete', timeout: 60000 });
  // Allow the page to reload after closing consent dialogs
  await browser.pause(delay);
}

describe.only('YouTube', function () {
  before(enableExtension);
  before(() => loadURL('https://www.youtube.com'));

  // duration in seconds (floored to avoid float precision issues)
  const DURATION_TOLERANCE = 5; // seconds

  const VIDEOS = [
    {
      url: 'https://www.youtube.com/watch?v=ZFoNBxpXen4',
      duration: 2245,
    },
    // {
    //   url: 'https://www.youtube.com/watch?v=8bMh8azh3CY&t=1005s',
    //   duration: 1725,
    // },
    // {
    //   url: 'https://www.youtube.com/watch?v=dsrsFGRw-hk&t=1783s',
    //   duration: 7200,
    // },
  ];

  for (const video of VIDEOS) {
    it(`should play video correctly: ${video.url}`, async function () {
      await loadURL(video.url);

      const videoElement = await $('video');
      await expect(videoElement)
        .toBeDisplayed()
        .catch(async () => {
          const screenshotPath = 'screenshots/youtube-error.png';
          mkdirSync(dirname(screenshotPath), { recursive: true });
          await browser.saveScreenshot(screenshotPath);

          throw new Error('Video element not found on the page');
        });

      // Play the video if it's paused (some videos autoplay, some don't)
      if ((await videoElement.getProperty('paused')) === true) {
        const playButton = await $('button.ytp-large-play-button');
        await playButton.click();
      }

      // Wait for a few seconds to ensure playback starts and continues
      await browser.pause(5000);

      // Check the video duration +- 1 seconds
      const duration = Math.floor(await videoElement.getProperty('duration'));

      expect(duration).toBeGreaterThanOrEqual(
        video.duration - DURATION_TOLERANCE,
      );
      expect(duration).toBeLessThanOrEqual(video.duration + DURATION_TOLERANCE);

      await expect(await videoElement.getProperty('paused')).toBe(false);
    });
  }
});
