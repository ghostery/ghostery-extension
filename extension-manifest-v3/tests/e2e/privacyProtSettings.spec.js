import { test, expect } from '../src/fixtures.js';

let extensionUrl;
let extensionPage;

test.describe('After the installation ', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.waitForTimeout(2000);

    let pages = context.pages();
    console.info('INFO: Ghostery onboarding opened.');

    for (const p of pages) {
      if (p.url().startsWith('chrome-extension://')) {
        extensionPage = p;
        await p.bringToFront();
        console.info(`INFO: Focused on tab with URL: ${p.url()}`);
        extensionUrl = p.url();
        break;
      }
    }

    expect(
      await extensionPage.isVisible('text="Enable Ghostery to get started"'),
    ).toBe(true);

    const button = await extensionPage.waitForSelector('ui-button');
    await button.click();

    expect(await extensionPage.isVisible('text="Setup Successful"')).toBe(true);
    console.info('INFO: Onboarding done.');
  });
  test('check Pause Ghostery', async ({ page }) => {
    // 1. Open a TEST PAGE (TODO: add a test page) - all should be blocked
    // 2. Open Ghostery Settings on Privacy Settings
    // 3. Click on "Pause Ghostery" button
    // 4. Open a TEST PAGE
    // 5. Nothing should be blocked
    const modifiedUrl =
      extensionUrl.split('/').slice(0, 4).join('/') + '/settings/index.html';
    console.info(modifiedUrl);
    await page.goto(modifiedUrl);
    expect(await extensionPage.isVisible('text="Ghostery settings"')).toBe(
      true,
    );
    await page.waitForTimeout(12000);
  });
  test('check Ad-Blocking', () => {
    // 1. Open a TEST PAGE (TODO: add a test page) - all should be blocked
    // 2. Open Ghostery Settings on Privacy Settings
    // 3. Click on "Ad-Blocking" button
    // 4. Open a TEST PAGE
    // 5. Ads should not be blocked
  });
  test('check Anti-Tracking', () => {
    // 1. Open a TEST PAGE - all should be blocked
    // 2. Open Ghostery Settings on Privacy Settings
    // 3. Click on "Anti-Tracking" button
    // 4. Open a TEST PAGE
    // 5. Trackers should not be blocked
  });
  test('check Never-Consent', () => {
    // 1. Open a TEST PAGE - all should be blocked
    // 2. Open Ghostery Settings on Privacy Settings
    // 3. Click on "Never-Consent" button
    // 4. Open a TEST PAGE
    // 5. Cookie pop-up should not be blocked
  });
  test('check Regional Filters', () => {
    // 1. Open a TEST PAGE - all should be blocked
    // 2. Open Ghostery Settings on Privacy Settings
    // 3. Click on "Anti-Tracking" button
    // 4. Open a TEST PAGE
    // 5. Regional item/s should not be blocked
  });
});
