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

export const PAGE_PORT = 6789;
export const PAGE_DOMAIN = `page.localhost`;
export const SUBPAGE_DOMAIN = `subpage.localhost`;
export const REDIRECT_PAGE_DOMAIN = `redirect.localhost`;
export const PAGE_URL = `http://${PAGE_DOMAIN}:${PAGE_PORT}/`;
export const SUBPAGE_URL = `http://${SUBPAGE_DOMAIN}:${PAGE_PORT}/`;
export const REDIRECT_PAGE_URL = `http://${REDIRECT_PAGE_DOMAIN}:${PAGE_PORT}/`;

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

  await browser.execute(async function (msg) {
    console.log('[e2e] Sending message to background:', msg);
    const result = await (window.chrome || window.browser).runtime.sendMessage(JSON.parse(msg));
    console.log('[e2e] Received response from background:', result);

    if (result !== 'done') {
      throw new Error(`Background tasks did not respond with "done": ${result}`);
    }
  }, JSON.stringify(msg));
}

export async function waitForIdleBackgroundTasks() {
  await sendMessage({ action: 'e2e:idleOptionsObservers' });
}

export async function reloadExtension() {
  if (browser.isChromium) {
    await browser.url('chrome://extensions');

    const reloadButton = await $('>>>#dev-reload-button');
    await reloadButton.click();

    // After clicking reload, the extension toggle loses its checked state
    // and regains it once the extension is fully reloaded.
    const enableToggle = await $('>>>#enableToggle');

    await browser.waitUntil(async () => !(await enableToggle.getProperty('checked')), {
      timeout: 5000,
      timeoutMsg: 'Extension did not start reloading',
    });

    await browser.waitUntil(async () => await enableToggle.getProperty('checked'), {
      timeout: 10000,
      timeoutMsg: 'Extension did not finish reloading in chrome://extensions',
    });
  } else if (browser.isFirefox) {
    await browser.url('about:debugging#/runtime/this-firefox');

    const reloadButton = await $('.qa-temporary-extension-reload-button');
    await reloadButton.click();

    await expect($('.extension-backgroundscript__status')).toHaveElementClass(
      expect.stringContaining('extension-backgroundscript__status--stopped'),
      { wait: 5000 },
    );

    // Wait until the background script status shows it is running again
    await expect($('.extension-backgroundscript__status')).toHaveElementClass(
      expect.stringContaining('extension-backgroundscript__status--running'),
      { wait: 10000 },
    );
  }

  await browser.url('ghostery:panel');
  await waitForIdleBackgroundTasks();
}

export async function setToggle(name, value) {
  const toggle = await getExtensionElement(`toggle:${name}`);

  if ((await toggle.getProperty('value')) !== value) {
    const desc = await toggle.$('span');

    if (await desc.isExisting()) {
      await desc.click();
    } else {
      await toggle.click();
    }

    // Allow background process to update the settings
    await waitForIdleBackgroundTasks();
  }

  await expect(toggle).toHaveElementProperty('value', value);
}

export async function setPrivacyToggle(name, value) {
  await browser.url('ghostery:settings');

  await setToggle(name, value);
}

export async function setAdditionalFiltersToggle(name, value) {
  await browser.url('ghostery:settings');
  await getExtensionElement('button:additional-filters').click();

  await setToggle(name, value);
}

export async function setWhoTracksMeToggle(name, value) {
  await browser.url('ghostery:settings');
  await getExtensionElement('button:whotracksme').click();

  await setToggle(name, value);
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
  await setAdditionalFiltersToggle('custom-filters', true);

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
  await setAdditionalFiltersToggle('custom-filters', false);
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
}

export async function expectNoPageNotification(url, notificationId) {
  await browser.url(url);

  await browser.waitUntil(async () => !(await getNotificationIframe(notificationId).isExisting()), {
    timeout: 5000,
    timeoutMsg: `Notification iframe for ${notificationId} appeared on ${url}`,
  });
}

export async function dismissPageNotification(page, id, action = 'button:dismiss') {
  await expectPageNotification(page, id);
  const iframe = await getNotificationIframe(id);

  await switchFrame(iframe);

  // FYI: Firefox has a bug where clicking a button in an iframe
  // that is inside a Shadow DOM does not work by using `el.click()`,
  // but works when using `browser.execute()` to click the button.
  // For the consistency and to avoid switching between different
  // methods of clicking, we use `browser.execute()` in both browsers.
  if (action === 'dialog:close') {
    await browser.execute(function () {
      const dialog = document.querySelector('ui-notification-dialog');
      dialog.shadowRoot.querySelector('button').click();
    });
  } else {
    await browser.waitUntil(async () => await getExtensionElement(action).isExisting(), {
      timeout: 5000,
      timeoutMsg: `Dismiss button for ${id} notification did not appear`,
    });

    await browser.execute(function (action) {
      document.querySelector(`[data-qa="${action}"]`).click();
    }, action);
  }

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
    await dismissPageNotification(PAGE_URL, 'pin-it', 'dialog:close');
  }

  // The "review" notification is displayed after 30 days of usage,
  // but in debug mode it is shown immediately. As the code in background
  // runs after the "pin-it" notification, it will be shown after it.
  await dismissPageNotification(PAGE_URL, 'review', 'dialog:close');

  // After pin-it and review notifications have been displayed,
  // no further notification should be shown
  await expectNoPageNotification(PAGE_URL, 'pin-it');
  await expectNoPageNotification(PAGE_URL, 'review');
}

export async function enableExtension() {
  if (enableExtension.done) return;

  await browser.url('ghostery:onboarding');

  if (await getExtensionElement('view:success').isDisplayed()) {
    return;
  }

  await getExtensionElement('button:enable').click();
  await getExtensionElement('button:filtering-mode:ghostery').click();

  await expect(getExtensionElement('view:success')).toBeDisplayed();
  await waitForIdleBackgroundTasks();

  await dismissNotifications();

  enableExtension.done = true;
}
