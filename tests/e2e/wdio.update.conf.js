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

import {
  readFileSync,
  rmSync,
  mkdirSync,
  cpSync,
  renameSync,
  existsSync,
} from 'node:fs';
import { execSync } from 'node:child_process';
import { $, expect } from '@wdio/globals';

import { getExtensionPageURL, waitForBackgroundIdle } from './utils.js';
import * as wdio from './wdio.conf.js';

/*
 * This configuration file is used to update the extension in the browser
 * before running the tests. It uses the original configuration file as a base,
 * and it reuses the same setup and teardown functions.
 */
export const config = {
  ...wdio.config,
  specs: [['**/*.spec.js']],
  exclude: ['spec/_onboarding.spec.js'],
  onPrepare: async (config, capabilities) => {
    if (wdio.argv.clean) {
      rmSync(wdio.WEB_EXT_PATH, { recursive: true, force: true });
      mkdirSync(wdio.WEB_EXT_PATH, { recursive: true });
    }

    try {
      let version = wdio.argv.version;

      if (!version) {
        execSync('git fetch --tags --quiet');
        version = execSync(
          'git describe --tags $(git rev-list --tags --max-count=1)',
        )
          .toString()
          .trim()
          .slice(1);
      }

      for (const capability of capabilities) {
        const target =
          capability.browserName === 'chrome' ? 'chromium' : 'firefox';

        const extUrl = `https://github.com/ghostery/ghostery-extension/releases/download/v${version}/ghostery-${target}-${version}.zip`;

        if (target === 'firefox') {
          const path = wdio.FIREFOX_PATH;
          const sourcePath = `${path.replace('.zip', '')}-source.zip`;

          if (!existsSync(sourcePath)) {
            wdio.buildForFirefox();
            cpSync(wdio.FIREFOX_PATH, sourcePath);
          }

          console.log(`Downloading Ghostery extension from ${extUrl}`);
          execSync(`curl -L -o ${path} "${extUrl}"`);
        }

        if (target === 'chromium') {
          const path = wdio.CHROME_PATH;
          const sourcePath = `${path}-source`;

          wdio.buildForChrome();

          rmSync(sourcePath, { recursive: true, force: true });
          cpSync(path, sourcePath, { recursive: true });
          rmSync(path, { recursive: true, force: true });

          console.log(`Downloading Ghostery extension from ${extUrl}`);
          execSync(`curl -L -o ${path}.zip "${extUrl}"`);

          console.log(`Unzipping Ghostery extension to ${path}`);
          execSync(`unzip ${path}.zip -d ${path}`);
        }
      }

      wdio.setupTestPage();
    } catch (e) {
      console.error('Error while preparing test environment', e);
      process.exit(1);
    }
  },
  before: async (capabilities, specs, browser) => {
    await wdio.config.before(capabilities, specs, browser);

    const onboardingUrl = await getExtensionPageURL('onboarding');
    const currentUrl = await browser.getUrl();

    await browser.newWindow(onboardingUrl);

    // Get element by common selector, as the `data-qa` attribute was introduced in v10.4.9
    await $('ui-button[type=success]').click();
    await expect($('ui-button[type=success]')).not.toBeDisplayed();

    // Reload extension with the source
    switch (capabilities.browserName) {
      case 'chrome': {
        renameSync(wdio.CHROME_PATH, `${wdio.CHROME_PATH}-old`);
        cpSync(`${wdio.CHROME_PATH}-source`, wdio.CHROME_PATH, {
          recursive: true,
        });
        rmSync(`${wdio.CHROME_PATH}-old`, { recursive: true, force: true });

        browser.execute('chrome.runtime.reload()');

        await browser.switchWindow(currentUrl);
        await expect($('extensions-review-panel')).toBeDisplayed();
        break;
      }
      case 'firefox': {
        const extension = readFileSync(
          `${wdio.FIREFOX_PATH.replace('.zip', '')}-source.zip`,
        );
        browser.installAddOn(extension.toString('base64'), true);

        await browser.switchWindow(currentUrl);

        await expect(
          $('.extension-backgroundscript__status'),
        ).toHaveElementClass(
          expect.stringContaining(
            'extension-backgroundscript__status--running',
          ),
        );

        // Ensure extension reloaded the source, so we can open the settings page
        await browser.pause(2000);

        break;
      }
    }

    await browser.url(await getExtensionPageURL('settings'));
    await waitForBackgroundIdle();

    console.log('Extension reloaded...');
  },
};
