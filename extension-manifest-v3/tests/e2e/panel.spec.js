import { test } from '../src/fixtures.js';

test.describe('After the installation ', () => {
  test.beforeEach(async () => {
    // Do the onboarding
  });
  test('trust site for 1 hour', () => {
    // 1. Open a TEST PAGE - all should be blocked
    // 2. Open Ghostery panel
    // 4. Click "Trust this site"
    // 5. Nothing should be blocked
  });
  test('check Simple View details', () => {
    // 1. Open a TEST PAGE - all should be blocked
    // 2. Open Ghostery panel on {Simple View}
    // 3. Categories are displayed (on test page categories are fixed)
    // 4. Blocked tracker are displayed (on test page there are fixed number of trackers)
  });
  test('check Detailed View details', () => {
    // 1. Open a TEST PAGE - all should be blocked
    // 2. Open Ghostery panel on {Detailed View}
    // 3. Categories are displayed (on test page categories are fixed)
    // 4. Trackers are displayed (on test page there are fixed names of trackers)
    // 5. Blocked tracker are displayed (on test page there are fixed number of trackers)
  });
  test('check Selective Blocking', () => {
    // 1. Open a TEST PAGE - all should be blocked
    // 2. Open Ghostery panel on {Detailed View}
    // 3. Open Tracker details (select one from the list)
    // 4. Check the URL status (it should be blocked)
    // 5. Open Protection status
    // 6. Change Protection status to "Trust on all websites"
    // 7. Open Ghostery panel on {Detailed View}
    // 8. Open Tracker details (select the same from the list)
    // 9. Check the URL status (it should be observed)
  });
});
