import { test } from '../src/fixtures.js';

test.describe('After the installation ', () => {
  test.beforeEach(async () => {
    // Do the onboarding
  });
  test(
    'trust site for 1 hour',
    {
      tag: '@trustSite1hour',
    },
    () => {},
  );
  test(
    'check Simple View details',
    {
      tag: '@checkSimpleViewDetails',
    },
    () => {},
  );
  test(
    'check Detailed View details',
    {
      tag: '@checkDetailedViewDetails',
    },
    () => {},
  );
  test(
    'check Selective Blocking',
    {
      tag: '@checkSelectiveBlocking',
    },
    () => {},
  );
});
