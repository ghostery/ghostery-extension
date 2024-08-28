import { test, expect } from '../src/fixtures.js';

test.describe('Install the extension', () => {
  test(' and do the Onboarding (Chrome only)', async ({ page, context }) => {
    await page.waitForTimeout(2000);

    let pages = context.pages();
    console.info('INFO: Ghostery onboarding opened.');

    let extensionPage;
    for (const p of pages) {
      if (p.url().startsWith('chrome-extension://')) {
        extensionPage = p;
        await p.bringToFront();
        console.info(`INFO: Focused on tab with URL: ${p.url()}`);
        break;
      }
    }

    expect(
      await extensionPage.isVisible('text="Enable Ghostery to get started"'),
    ).toBe(true);

    const button = await extensionPage.waitForSelector('ui-button');
    await button.click();
    console.info('INFO: "ENABLE GHOSTERY" button clicked.');

    expect(await extensionPage.isVisible('text="Setup Successful"')).toBe(true);
  });
});
