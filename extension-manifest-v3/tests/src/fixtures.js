import { test as base } from '@playwright/test';
import { downloadAddon } from '../src/helpers';
import { loadChromiumBrowserWithExtension } from './loaders/chromium';
import { loadFirefoxBrowserWithExtension } from './loaders/firefox';

const extensionUrls = {
  firefox:
    'https://github.com/ghostery/ghostery-extension/releases/download/v10.4.2/ghostery-firefox-10.4.2.zip',
  chromium:
    'https://github.com/ghostery/ghostery-extension/releases/download/v10.4.2/ghostery-chrome-10.4.2.zip',
};

const test = base.extend({
  context: async ({ browserName }, use) => {
    const extensionPath = await downloadAddon(extensionUrls[browserName]);

    if (browserName === 'chromium') {
      const context = await loadChromiumBrowserWithExtension(extensionPath);
      await use(context);
      await context.close();
    } else if (browserName === 'firefox') {
      const context = await loadFirefoxBrowserWithExtension(extensionPath);
      await use(context);
      await context.close();
    }
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

const { expect } = test;

module.exports = { test, expect };
