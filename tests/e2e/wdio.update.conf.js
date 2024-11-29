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
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { $, expect } from '@wdio/globals';

import {
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
  waitForIdleBackgroundTasks,
} from './utils.js';
import * as wdio from './wdio.conf.js';

/*
 * This configuration file is used to update the extension in the browser
 * before running the tests. It uses the original configuration file as a base,
 * and it reuses the same setup and teardown functions.
 */
export const config = {
  ...wdio.config,
  specs: [wdio.config.specs[0].slice(1)],
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

        const fileName = `ghostery-${target}-${version}.zip`;
        const url = `https://github.com/ghostery/ghostery-extension/releases/download/v${version}/`;

        const buildPath = resolve(wdio.WEB_EXT_PATH, fileName);

        // Download build artifacts
        if (!existsSync(resolve(buildPath))) {
          console.log(`Downloading Ghostery extension from ${url}${fileName}`);
          execSync(`curl -L -o ${buildPath} "${url}${fileName}"`);
        }

        switch (target) {
          case 'firefox': {
            wdio.buildForFirefox();

            cpSync(
              wdio.FIREFOX_PATH,
              `${wdio.FIREFOX_PATH.replace('.zip', '')}-source.zip`,
            );

            cpSync(buildPath, wdio.FIREFOX_PATH);
            break;
          }
          case 'chromium': {
            const sourcePath = `${wdio.CHROME_PATH}-source`;

            wdio.buildForChrome();

            rmSync(sourcePath, { recursive: true, force: true });
            cpSync(wdio.CHROME_PATH, sourcePath, { recursive: true });
            rmSync(wdio.CHROME_PATH, { recursive: true, force: true });

            console.log(`Unzipping Ghostery extension...`);
            execSync(`unzip ${buildPath} -d ${wdio.CHROME_PATH}`);
            break;
          }
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

    try {
      const url = await browser.getUrl();

      await enableExtension();
      await browser.url(url);

      await browser.newWindow(getExtensionPageURL('settings'));

      // Reload extension with the source
      switch (capabilities.browserName) {
        case 'chrome': {
          renameSync(wdio.CHROME_PATH, `${wdio.CHROME_PATH}-old`);
          cpSync(`${wdio.CHROME_PATH}-source`, wdio.CHROME_PATH, {
            recursive: true,
          });
          rmSync(`${wdio.CHROME_PATH}-old`, { recursive: true, force: true });

          await browser.execute(() => chrome.runtime.reload());

          await browser.closeWindow();
          await browser.switchWindow(url);

          await browser.url('chrome://extensions');
          await expect($('extensions-review-panel')).toBeDisplayed();

          break;
        }
        case 'firefox': {
          const extension = readFileSync(
            `${wdio.FIREFOX_PATH.replace('.zip', '')}-source.zip`,
          );
          browser.installAddOn(extension.toString('base64'), true);

          await browser.url('about:debugging#/runtime/this-firefox');

          await expect(
            $('.extension-backgroundscript__status'),
          ).toHaveElementClass(
            expect.stringContaining(
              'extension-backgroundscript__status--running',
            ),
          );

          await browser.closeWindow();
          await browser.switchWindow(url);

          // Without the pause, Firefox throws sometimes web-driver exceptions
          // It must be related to the extension reloading process.
          // As there is no way to wait for the extension to be reloaded
          // better than above check, we just wait for a few seconds.
          browser.pause(5000);

          break;
        }
      }

      await browser.url(getExtensionPageURL('settings'));
      await expect(getExtensionElement('page:settings')).toBeDisplayed();
      await waitForIdleBackgroundTasks();

      console.log('Extension reloaded...');
    } catch (e) {
      console.error('Error while updating extension', e);

      // close the browser session
      await browser.deleteSession();

      // send a signal to the parent process to stop the tests
      process.kill(process.pid, 'SIGTERM');
    }
  },
};
