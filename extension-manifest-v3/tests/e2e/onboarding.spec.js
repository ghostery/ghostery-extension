import { test, expect } from '../src/fixtures.js';
import getExtensionUrl from '../src/helpers.js';

test.describe('Install the extension', () => {
  let extensionPage = null;
  let extensionUrl = null;
  test(
    'and do the Onboarding (Chrome only)',
    {
      tag: '@doTheOnboarding',
    },
    async ({ page, context }) => {
      await page.waitForTimeout(2000);
  
      let pages = context.pages();
      console.info('INFO: Ghostery onboarding opened.');
  
      extensionUrl = getExtensionUrl(pages, extensionPage, extensionUrl);
  
      await expect(
        extensionPage.getByText('Enable Ghostery to get started'),
      ).toBeVisible();
      const button = await extensionPage.waitForSelector('ui-button');
      await button.click();
  
      console.info('INFO: "ENABLE GHOSTERY" button clicked.');

      expect(await extensionPage.isVisible('text="Setup Successful"')).toBe(
        true,
      );
    },
  );
  test(
    'and skip the Onboarding',
    {
      tag: '@skipTheOnboarding',
    },
    () => {},
  );
});
