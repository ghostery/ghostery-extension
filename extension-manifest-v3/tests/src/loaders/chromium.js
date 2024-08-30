import { chromium } from '@playwright/test';

/**
 * @param {string} extensionPath
 */
export async function loadChromiumBrowserWithExtension(extensionPath) {
  return chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
}
