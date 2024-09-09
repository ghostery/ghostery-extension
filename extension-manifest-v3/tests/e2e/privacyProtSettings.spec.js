import { test, expect } from '../src/fixtures.js';
import getExtensionUrl from '../src/helpers.js';

test.describe('Test', () => {
  let extensionPage = null;
  let extensionUrl = null;

  test.beforeEach(async ({ page, context }) => {
    await page.waitForTimeout(2000);

    let pages = context.pages();
    console.info('INFO: Ghostery onboarding opened.');

    extensionUrl = getExtensionUrl(pages, extensionPage, extensionUrl);

    await expect(
      extensionPage.getByText('Enable Ghostery to get started'),
    ).toBeVisible();
    const button = await extensionPage.waitForSelector('ui-button');
    await button.click();

    await expect(extensionPage.getByText('Setup Successful')).toBeVisible();
    console.info('INFO: Onboarding done.');
  });
  // test(
  //   'checks Pause Ghostery module',
  //   {
  //     tag: '@pauseGhostery',
  //   },
  //   async ({ page }) => {
  //     extensionUrl = getExtensionUrl + '/settings/index.html';
  //     console.info(extensionUrl);
  //     await page.goto(extensionUrl);
  //     await expect(extensionPage.getByText('Ghostery settings')).toBeVisible();
  //     await page.waitForTimeout(12000);
  //   },
  // );
  // test(
  //   'checks Ad-Blocking module',
  //   {
  //     tag: '@checksAdBlocking',
  //   },
  //   () => {},
  // );
  // test(
  //   'checks Anti-Tracking module',
  //   {
  //     tag: '@checksAntiTracking',
  //   },
  //   () => {},
  // );
  // test(
  //   'checks Never-Consent module',
  //   {
  //     tag: '@checksNeverConsent',
  //   },
  //   () => {},
  // );
  // test(
  //   'checks Regional Filters module',
  //   {
  //     tag: '@checksRegionalFilters',
  //   },
  //   () => {},
  // );
});
