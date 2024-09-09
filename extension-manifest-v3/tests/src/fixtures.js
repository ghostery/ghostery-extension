import { test as base, chromium } from '@playwright/test';
import { downloadAddon } from '../src/helpers';

const extensionUrls = {
  chromium:
    'https://github.com/ghostery/ghostery-extension/releases/download/v10.4.2/ghostery-chrome-10.4.2.zip',
};

const test = base.extend({
  context: async ({ browserName }, use) => {
    const extensionPath = await downloadAddon(extensionUrls[browserName]);
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

const { expect } = test;

export { test, expect };
