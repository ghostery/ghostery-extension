import { test } from '../src/fixtures.js';

test.describe('After the installation ', () => {
  // This could be also done without installation the extension
  test.beforeEach(async () => {
    // Do the onboarding
  });
  test(
    'and login into Ghostery account',
    {
      tag: '@loginIntoGhosteryAccount',
    },
    () => {},
  );
});
