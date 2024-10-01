import { browser, expect } from '@wdio/globals';

import { navigateToPage, getQAElement } from '../utils.js';

describe('Onboarding', () => {
  it('should keep ghostery disabled', async () => {
    await navigateToPage('onboarding');
    await expect(browser).toHaveTitle('Welcome to Ghostery');

    await getQAElement('skip').click();

    await navigateToPage('panel');
    await expect(getQAElement('enable')).toBeDisplayed();
  });

  it('should enable ghostery', async () => {
    await navigateToPage('onboarding');
    await expect(browser).toHaveTitle('Welcome to Ghostery');

    await getQAElement('enable').click();

    await navigateToPage('panel');
    await expect(getQAElement('enable')).not.toBeDisplayed();
  });
});
