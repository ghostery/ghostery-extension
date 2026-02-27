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

import { browser, expect, $ } from '@wdio/globals';
import { FLAG_MODES, FLAG_NOTIFICATION_REVIEW } from '@ghostery/config';

import { argv, PAGE_URL } from './wdio.conf.js';

export const ADBLOCKING_GLOBAL_SELECTOR = 'ad-slot';
export const ADBLOCKING_URL_SELECTOR = '[data-ad-name]';

export const TRACKER_IDS = ['facebook_connect', 'pinterest_conversion_tracker'];

let BASE_URL = '';
export function setExtensionBaseUrl(url) {
  BASE_URL = url;
}

export function getExtensionPageURL(page, file = 'index.html') {
  if (!BASE_URL) {
    throw new Error('Base URL is not set');
  }

  return `${BASE_URL}/${page}/${file}`;
}

export function getExtensionElement(id, query) {
  return $(`>>>[data-qa="${id}"]` + (query ? ` ${query}` : ''));
}

export async function sendMessage(msg) {
  if ((await browser.getUrl()).startsWith('http')) {
    throw new Error('Message can only be sent from the extension context');
  }

  // Wait for a short time to ensure that the background process is ready
  // to receive messages after the extension page is loaded or reloaded.
  await browser.pause(100);

  const result = await browser.execute(
    browser.isChromium
      ? function (msg) {
          return chrome.runtime.sendMessage(JSON.parse(msg));
        }
      : function (msg) {
          return browser.runtime.sendMessage(JSON.parse(msg));
        },
    JSON.stringify(msg),
  );

  if (result !== 'done') {
    throw new Error(`Background tasks did not respond with "done": ${result}`);
  }
}

export async function waitForIdleBackgroundTasks() {
  await sendMessage({ action: 'e2e:idleOptionsObservers' });
}

export async function reloadExtension() {
  await browser.url('about:blank');

  await browser[browser.isFirefox ? 'newWindow' : 'url'](getExtensionPageURL('panel'));

  await sendMessage({ action: 'e2e:reloadExtension' });

  if (browser.isFirefox) {
    await browser.switchWindow('about:blank');
  }

  await browser.pause(3000);

  await browser.waitUntil(
    async () => {
      const title = await browser.getTitle();
      if (title !== 'Ghostery panel') {
        await browser.url(getExtensionPageURL('panel'));
        return false;
      }

      return true;
    },
    { timeout: 10000, timeoutMsg: 'Panel did not load' },
  );

  await waitForIdleBackgroundTasks();
  await browser.url('about:blank');
}

export async function setToggle(name, value) {
  const toggle = await getExtensionElement(`toggle:${name}`);

  if ((await toggle.getProperty('value')) !== value) {
    await toggle.click();

    // Allow background process to update the settings
    await waitForIdleBackgroundTasks();
  }

  await expect(toggle).toHaveElementProperty('value', value);
}

export async function setPrivacyToggle(name, value) {
  await browser.url(getExtensionPageURL('settings'));

  await setToggle(name, value);
}

export async function setWhoTracksMeToggle(name, value) {
  await browser.url(getExtensionPageURL('settings'));
  await getExtensionElement('button:whotracksme').click();

  await setToggle(name, value);
}

export async function openPanel() {
  await browser.url(getExtensionPageURL('panel'));

  // The panel has a bugfix for closing the panel when links are clicked.
  // Source: /pages/panel/index.js - L52
  // In test environment it must be disabled to allow the test to switch back to the panel
  await browser.execute(function () {
    Object.defineProperty(window, 'close', { value: function () {} });
  });
}

export async function setConfigFlags(flags) {
  console.log('Setting config flags:', flags.join(', '));

  await browser.url(getExtensionPageURL('panel'));
  await sendMessage({ action: 'e2e:setConfigFlags', flags });

  // Reload the extension to apply the new config flags
  await reloadExtension();
}

export async function expectAdsBlocked() {
  const adSlot = await $(ADBLOCKING_GLOBAL_SELECTOR);
  const dataAd = await $(ADBLOCKING_URL_SELECTOR);

  await expect(adSlot).toExist();
  await expect(dataAd).toExist();

  await expect(adSlot).not.toBeDisplayed();
  await expect(dataAd).not.toBeDisplayed();
}

export async function setCustomFilters(filters) {
  await setPrivacyToggle('custom-filters', true);
  await getExtensionElement('button:custom-filters').click();

  const checkbox = await getExtensionElement('checkbox:custom-filters:trusted-scriptlets');

  if (!(await checkbox.getProperty('checked'))) {
    await checkbox.click();
    await expect(checkbox).toHaveElementProperty('checked', true);
  }

  const input = await getExtensionElement('input:custom-filters');
  await input.setValue(filters.join('\n'));

  await getExtensionElement('button:custom-filters:save').click();
  await waitForIdleBackgroundTasks();

  await expect(getExtensionElement('component:custom-filters:result')).toBeDisplayed();
}

export async function disableCustomFilters() {
  await setCustomFilters([]);
  await setPrivacyToggle('custom-filters', false);
}

export async function switchFrame(frameElement) {
  await browser.switchFrame(null);

  // Using `el.waitForExist()` when targeting iframes in Shadow DOM
  // throws an error about not found context after using this function
  if (!(await frameElement.isExisting())) {
    await frameElement.waitForExist({ timeout: 5000 });
  }

  await browser.switchFrame(frameElement);
}

export async function setCookieInBrowserContext(url, name, value = '') {
  await browser.url(url);

  await browser.execute(
    function (name, value) {
      document.cookie = `${name}=${value}`;
    },
    name,
    value,
  );
}

function getNotificationIframe(id) {
  return $(`>>>iframe#ghostery-notification-iframe[src*="notifications/${id}.html"]`);
}

export async function expectPageNotification(url, notificationId) {
  await browser.url(url);

  await browser.waitUntil(async () => await getNotificationIframe(notificationId).isExisting(), {
    timeout: 5000,
    timeoutMsg: `Notification iframe for ${notificationId} did not appear on ${url}`,
  });

  return getNotificationIframe(notificationId);
}

export async function expectNoPageNotification(url, notificationId) {
  await browser.url(url);

  await browser.waitUntil(async () => !(await getNotificationIframe(notificationId).isExisting()), {
    timeout: 5000,
    timeoutMsg: `Notification iframe for ${notificationId} appeared on ${url}`,
  });
}

export async function dismissPageNotification(page, id, action = 'button:dismiss') {
  const iframe = await expectPageNotification(page, id);

  await switchFrame(iframe);

  await browser.waitUntil(async () => await getExtensionElement(action).isExisting(), {
    timeout: 5000,
    timeoutMsg: `Dismiss button for ${id} notification did not appear`,
  });

  // FYI: Firefox has a bug where clicking a button in an iframe
  // that is inside a Shadow DOM does not work by using `el.click()`,
  // but works when using `browser.execute()` to click the button.
  // For the consistency and to avoid switching between different
  // methods of clicking, we use `browser.execute()` in both browsers.
  await browser.execute(function (action) {
    document.querySelector(`[data-qa="${action}"]`).click();
  }, action);

  // Allow to complete the dismiss action in the background process and remove the iframe
  await browser.pause(1000);

  await browser.switchFrame(null);

  await browser.waitUntil(async () => !(await getNotificationIframe(id).isExisting()), {
    timeout: 5000,
    timeoutMsg: `Notification iframe for ${id} still exists after dismissing`,
  });
}

async function dismissNotifications() {
  // The "pin-it" notification is only available in Chromium-based browsers
  // and it is displayed just after enabling the extension on the first visited page.
  if (browser.isChromium) {
    await expectPageNotification(PAGE_URL, 'pin-it');
  }

  // The "review" notification is displayed after 30 days of usage,
  // but in debug mode it is shown immediately. As the code in background
  // runs after the "pin-it" notification, it will be shown after it.
  if (argv.flags.includes(FLAG_NOTIFICATION_REVIEW)) {
    await expectPageNotification(PAGE_URL, 'review');
  }

  // After pin-it and review notifications have been displayed,
  // no further notification should be shown
  await expectNoPageNotification(PAGE_URL, 'pin-it');
  await expectNoPageNotification(PAGE_URL, 'review');
}

export async function enableExtension() {
  await browser.url(getExtensionPageURL('onboarding'));

  if (await getExtensionElement('view:success').isDisplayed()) {
    return;
  }

  const enableButton = await getExtensionElement('button:enable');
  await enableButton.click();

  if (argv.flags.includes(FLAG_MODES)) {
    await expect(getExtensionElement('view:filtering-mode')).toBeDisplayed();
    await getExtensionElement('button:filtering-mode:ghostery').click();
  }

  await expect(getExtensionElement('view:success')).toBeDisplayed();
  await waitForIdleBackgroundTasks();

  await dismissNotifications();
}
