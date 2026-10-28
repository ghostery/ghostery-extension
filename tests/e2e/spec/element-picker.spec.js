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

import { browser, expect, $, $$ } from '@wdio/globals';

import { setupExtension, getExtensionPageURL, reloadUntilActive, PAGE_URL } from '../utils.js';

// Match by prefix, since the tag name is randomized
const POPUP_SELECTOR = () =>
  Array.from(document.documentElement.children).filter((el) =>
    el.localName.startsWith('gh-element-picker-popup-'),
  );
const POPUP_URL = 'pages/element-picker/index.html';

// Runs a function in a new extension page tab, then returns to the current tab
async function runInExtensionPage(fn, ...args) {
  const origin = await browser.getWindowHandle();
  const { handle } = await browser.createWindow('tab');
  await browser.switchToWindow(handle);
  await browser.url(getExtensionPageURL('settings'));

  const result = await browser.execute(fn, ...args);

  await browser.closeWindow();
  await browser.switchToWindow(origin);

  return result;
}

// Opens the picker on the test page, like the panel does
async function openElementPicker() {
  await runInExtensionPage(async function (pageUrl) {
    const api = window.chrome || window.browser;
    const tabs = await api.tabs.query({});
    const tab = tabs.find((t) => t.url?.startsWith(pageUrl));

    await api.runtime.sendMessage({ action: 'openElementPicker', tabId: tab.id });
  }, PAGE_URL);

  // The selected element is sent to the popup only once, so it must be loaded before
  await waitForPopupButton('button:close');
}

function getStoredHostnames() {
  return runInExtensionPage(async function () {
    const api = window.chrome || window.browser;
    const { elementPickerSelectors } = await api.storage.local.get('elementPickerSelectors');

    return elementPickerSelectors?.hostnames ?? {};
  });
}

function setStoredHostnames(hostnames) {
  return runInExtensionPage(async function (hostnames) {
    const api = window.chrome || window.browser;
    await api.storage.local.set({ elementPickerSelectors: { hostnames } });
  }, hostnames);
}

// The popup iframe sits in a closed shadow root, out of reach of WebDriver
// frame switching, so run scripts in its browsing context over BiDi
async function runInPopup(fn, ...args) {
  const flatten = (contexts) => contexts.flatMap((c) => [c, ...flatten(c.children ?? [])]);
  const { contexts } = await browser.browsingContextGetTree({});
  const popup = flatten(contexts).find((c) => c.url.includes(POPUP_URL));

  const { result } = await browser.scriptCallFunction({
    functionDeclaration: String(fn),
    arguments: args.map((value) => ({ type: 'string', value })),
    target: { context: popup.context },
    awaitPromise: false,
  });

  return result?.value;
}

function waitForPopupButton(id) {
  return browser.waitUntil(
    () =>
      runInPopup(function (id) {
        return document.querySelector(`[data-qa="${id}"] button`) !== null;
      }, id),
    { timeoutMsg: `Popup button "${id}" not found` },
  );
}

async function clickPopupButton(id) {
  await waitForPopupButton(id);
  await runInPopup(function (id) {
    document.querySelector(`[data-qa="${id}"] button`).click();
  }, id);
}

// Waits for the hide animation to end, so Back or Done cannot race it
async function hideElement(selector) {
  await $(selector).click();

  await clickPopupButton('button:hide');
  await waitForPopupButton('button:done');
  await browser.waitUntil(
    async () => (await $(selector).getCSSProperty('display')).value === 'none',
  );
}

describe('Element Picker', function () {
  before(setupExtension);

  // Rules reach the engine asynchronously, so start each test from a clean page
  beforeEach(async function () {
    await browser.url(PAGE_URL);
    await setStoredHostnames({});
    await reloadUntilActive(() => $('h1').isDisplayed(), 'h1 stayed hidden after clearing rules');
  });

  after(() => setStoredHostnames({}));

  it('keeps the popup out of reach of the page', async function () {
    await openElementPicker();
    await openElementPicker();

    await expect($$(POPUP_SELECTOR)).toBeElementsArrayOfSize(1);

    // The page sees neither the iframe nor its window
    const exposed = await browser.execute(function () {
      const canReach = (frame) => {
        try {
          return Boolean(frame.location.href);
        } catch {
          return false;
        }
      };

      return {
        iframe: document.querySelector('iframe[src*="element-picker"]') !== null,
        frames: Array.from(window.frames).filter((frame) => !canReach(frame)).length,
      };
    });
    expect(exposed).toEqual({ iframe: false, frames: 0 });

    await browser.keys('Escape');
    await expect($(POPUP_SELECTOR)).not.toExist();
  });

  it('hides the selected element and keeps it hidden after reload', async function () {
    await openElementPicker();
    await hideElement('h1');

    await clickPopupButton('button:done');

    await expect($('h1')).not.toBeDisplayed();
    await expect($(POPUP_SELECTOR)).not.toExist();
    expect(await getStoredHostnames()).toEqual({ 'page.localhost': ['h1'] });

    await reloadUntilActive(
      async () => !(await $('h1').isDisplayed()),
      'h1 was not hidden after reload',
    );
  });

  it('removes the rule with the back button', async function () {
    await openElementPicker();
    await hideElement('#rpnt-a');

    await clickPopupButton('button:back');
    await waitForPopupButton('button:hide');

    await expect($('#rpnt-a')).toBeDisplayed();
    expect(await getStoredHostnames()).toEqual({});
  });
});
