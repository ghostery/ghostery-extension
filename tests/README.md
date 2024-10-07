# Tests

After passing all the following tests, it can be assumed with a high level of confidence that the basic features of the extension are working correctly.

## Prerequisites

* The tests must be performed in the order given below - some of the tests depend on the results of the previous ones
* The browser must have cleared cookies and cache before starting the tests

### Dictionary

* `TEST PAGE` - The test pages can be adjusted. The examples mentioned in the steps below are those on which the functionality you want to test can be quickly checked.
* `REGIONAL TEST PAGE` - The regional test page can be changed to a different one. Likewise, the region itself can be changed to any other region.
* `CUSTOM FILTER` - The custom filter can be changed in any way according to the instruction 'Learn more on supported syntax'.
* 🤖 - Tests added to end-to-end automation

## Onboarding

### Disable extension 🤖

> On the Onboarding tab, keep Ghostery disabled

1. Install the extension from ZIP.
2. Check if the Onboarding tab is open.
3. Click the "Keep Disabled" button.
4. Check if the "Ghostery is installed with limited functionality" text is visible.
5. Close the Onboarding tab.

Ghostery is installed but kept disabled.

### Enable extension 🤖

> On the Onboarding tab, enable Ghostery to give all necessary permissions

1. Open Ghostery panel.
2. Click "Enable Ghostery" button on the Ghostery panel.
3. Check if the Onboarding tab is open.
4. Click "Enable Ghostery" button.
5. Check if the "Setup Successful" text is visible.
6. Open Ghostery panel
7. Check if the "Ghostery has nothing to do on this page. Navigate to a website to see Ghostery in action." is visible.

Ghostery is installed and enabled.

## Main features

### Never-Consent 🤖

> When Never-Consent is run on a test page, cookie pop-ups should be blocked

1. Open Ghostery Settings and turn OFF Never-Consent.
2. Open website `TEST PAGE` (https://www.espn.com/).
3. Cookie pop-up is visible.
4. Open Ghostery Settings.
5. Turn ON Never-Consent.
6. Reload website `TEST PAGE` (https://www.espn.com/).
7. Cookie pop-up is hidden.

The cookie pop-up is hidden.

### Ad-Blocking 🤖

> Ads on the test site must disappear when the Ad-Blocking module is activated

1. Open Ghostery Settings and turn OFF Ad-Blocking.
2. Open website `TEST PAGE` (https://www.espn.com/).
3. Ad is visible.
4. Open Ghostery Settings.
5. Turn ON Ad-Blocking
6. Reload website `TEST PAGE` (https://www.espn.com/).
7. Ad is not visible.

Ads on the test site are not visible

### Anti-tracking 🤖

> When Anti-Tracking is enabled on a test site, URLs for the selected tracker should be blocked

On Safari all of the DNR rules are provided by one combined list (ads), so the test is not applicable for this browser.

1. Open Ghostery Settings and turn OFF Anti-tracking.
2. Open website `TEST PAGE` (https://www.aarp.org/).
3. Open Ghostery Panel on Detailed View.
4. Open Tracker `TRACKER NAME` (iSpot.tv) details.
5. URLs are not blocked.
6. Open Ghostery Settings.
7. Turn ON Anti-tracking.
8. Reload website `TEST PAGE` (https://www.aarp.org/).
9. Open Ghostery Panel on Detailed View.
10. Open Tracker `TRACKER NAME` (iSpot.tv) details.
11. URLs are blocked.

URLs for the selected tracker are blocked.

### Regional Filters 🤖

> Regional filters should work on a selected region - the test uses Polish region and a Polish website to test this functionality

1. Open Ghostery Settings and turn OFF Regional Filters.
2. Open website `REGIONAL TEST PAGE` (https://www.cowwilanowie.pl/).
3. Ad is visible.
4. Open Ghostery Settings.
5. Turn ON Regional Filters.
6. Tick the desired region - Polish (pl).
7. Reload website `REGIONAL TEST PAGE` (https://www.cowwilanowie.pl/).
8. Ad is hidden.

Ad on the regional test site is blocked.

### Pause Website 🤖

> When Website Pause is enabled, the entire extension should turn off its activity only on the test page

On Safari reloading the DNR rules may take up to a few minutes, so after pausing the website, the rules may not be applied immediately.

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Open Ghostery Panel.
3. Click "Pause on this site [1 hour]" button.
4. Open Ghostery Panel. There should be "Ghostery is paused [59m left]".
5. Trackers are not blocked and not modified.
6. Ads are visible.
7. Click "Undo" button.

On the test page, trackers are not blocked or modified, ads are visible.

### Global Pause  🤖

> When Global Pause is enabled, the entire extension should turn off its blocking activity on all pages

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Open Ghostery Settings.
3. Click "Pause Ghostery" button.
4. Reload website: `TEST PAGE` (https://www.espn.com/).
5. Open Ghostery Panel. There should be "Ghostery is paused [23h 59m left]".
6. Trackers are not blocked and not modified.
7. Ads are visible.
8. Open website `TEST PAGE` (https://www.aarp.org/).
9. Open Ghostery Panel. There should be "Ghostery is paused [23h 59m left]".
10. Trackers are not blocked and not modified.
11. Ads are visible.

On the test pages, trackers are not blocked or modified, ads are visible.

## Advanced features

### Custom Filters

> Check whether it is possible to add a simple custom filter

1. Open website `TEST PAGE` (https://example.com/).
2. Text `Example Domain` is visible.
3. Open Ghostery Settings and turn ON Custom Filters.
4. Add CUSTOM FILTER `example.com##+js(rpnt, h1, Example Domain, "hello world")`
5. Tick the checkbox for "Allow trusted scriplets" and Save it.
6. Reload website `TEST PAGE` (https://example.com/).
7. Text `Example Domain` is changed to `hello world`.

On the test page, the text has been modified.

### Protection Status / Exceptions

> Add an exception to a tracker - global and/or selected page

1. Open website `TEST PAGE` (https://www.aarp.org/).
2. Open Ghostery Panel on Detailed View.
3. Open Tracker `TRACKER NAME` (DoubleClick) details.
4. URLs are blocked.
5. Click "Blocked on all websites" button.
6. Protection Status should be visible.
7. Tick on "Trust on all websites. Add exception".
8. Reload website `TEST PAGE` (https://www.aarp.org/).
9. Open Ghostery Panel on Detailed View.
10. Open Tracker `TRACKER NAME` (DoubleClick) details.
11. URLs are observed.

An exception is added to the tracker. URLs are not blocked or modified, only observed.

## Additional features

### Trackers Preview on SERP

> Tracker preview on SERPs shows the information gathered for a specific website on the WTM

1. Open website `TEST PAGE` (https://www.google.com/).
2. Put query "shop". Search result should be visible.
3. Tracker Preview near the search result is visible.
4. Click the Trackers Preview wheel icon.
5. Pop-up with information from WTM is visible.

Tracker Preview is working. Gathered information for a specific website are visible.

### Ghostery Account synchronization

> Ghostery Account settings synchronization between browsers

1. Open Firefox browser and Chrome browser.
2. In both browsers, login into Ghostery Account.
3. In both browsers, open Ghostery Settings.
4. In Firefox browser turn OFF Ad-Blocking. Reload Ghostery Settings.
5. In Chrome browser reload Ghostery Settings.
6. Ad-Blocking should be turned OFF.
7. Turn ON Ad-Blocking and turn OFF Anti-tracking. Reload Ghostery Settings.
8. In Firefox browser reload Ghostery Settings.
9. Ad-Blocking should be turned ON. Anti-tracking should be OFF.

Synchronization between browsers is working. In Firefox Ad-Blocking is enabled and Anti-tracking disabled.

### Other language support

> The default extension' language is set by the browser -check if changing that will change the extension' language

Use Firefox, as it allows changing the language of the browser without changing the system language.

1. Open Ghostery panel.
2. All the text should be in LANGUAGE (english).
3. Open Ghostery Settings.
4. All the text should be in LANGUAGE (english).
5. Open browser settings and change the LANGUAGE from (english) to (french).
6. Restart the browser.
7. Open Ghostery panel.
8. All the text should be in LANGUAGE (french).
9. Open Ghostery Settings.
10. All the text should be in LANGUAGE (french).

The language of the extension has been changed from the default.
