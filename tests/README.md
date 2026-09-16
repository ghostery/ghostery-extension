# Tests

After passing all the following tests, it can be assumed with a high level of confidence that the basic features of the extension are working correctly.

## Prerequisites

* The tests must be performed in the order given below - some of the tests depend on the results of the previous ones
* The browser must have cleared cookies and cache before starting the tests
* The file has two parts: Part 1 - Ghostery and Part 2 - Ghostery Zap. Passing the whole file means passing all smoke tests
* Settings and filters changed during a test must be restored after it, unless the next test says otherwise

### Dictionary

* `TEST PAGE` - The test pages can be adjusted. The examples mentioned in the steps below are those on which the functionality you want to test can be quickly checked.
* `REGIONAL TEST PAGE` - The regional test page can be changed to a different one. Likewise, the region itself can be changed to any other region.
* `TRACKER NAME` - The tracker can be changed to any other tracker observed on the test page.
* `CUSTOM FILTER` - The custom filter can be changed in any way according to the instruction 'Learn more on supported syntax'.
* 🤖 - Tests added to end-to-end automation

# Part 1 - Ghostery

## Onboarding

### Disable extension 🤖

> On the Onboarding tab, keep Ghostery disabled

Firefox only. On Chromium browsers there is no "Keep Disabled" option.

1. Install the extension from ZIP.
2. Check if the Onboarding tab is open.
3. Click the "Keep Disabled" button.
4. Check if the "Ghostery is installed with limited functionality" text is visible.
5. Close the Onboarding tab.

Ghostery is installed but kept disabled.

### Enable extension - Ghostery mode 🤖

> On the Onboarding tab, enable Ghostery and select the Ghostery filtering mode

1. Open Ghostery panel.
2. Click "Enable Ghostery" button on the Ghostery panel.
3. Check if the Onboarding tab is open.
4. Click "Enable Ghostery" button (Firefox) or "Continue" button (Chromium).
5. Check if the "Select filtering mode" text is visible.
6. Click the Ghostery option.
7. Check if the "Setup Successful" text is visible.
8. Open Ghostery panel.
9. Check if the "Ghostery has nothing to do on this page. Navigate to a website to see Ghostery in action." is visible.

Ghostery is installed and enabled in the Ghostery filtering mode.

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

### Never-Consent - Global Privacy Control

> When Global Privacy Control is enabled, the browser should send the GPC signal to websites

Use Chrome. Brave and Firefox can send the GPC signal on their own, so the OFF part of the test is not reliable there. GPC works only when Never-Consent is ON and Ghostery is not paused.

1. Open Ghostery Settings, go to "Privacy protection" and turn ON Never-Consent.
2. Click "Extended settings" and turn OFF Global Privacy Control.
3. Open website `TEST PAGE` (https://example.com/).
4. Open Developer Tools > Console, type `navigator.globalPrivacyControl` and press Enter.
5. The result is `undefined` or `false`.
6. Go back to "Extended settings" and turn ON Global Privacy Control.
7. Reload website `TEST PAGE` (https://example.com/).
8. In Console, type `navigator.globalPrivacyControl` and press Enter.
9. The result is `true`.
10. Open Developer Tools > Network, reload the page and click the first request (example.com).
11. In "Request Headers" the header `Sec-GPC: 1` is visible.

The GPC signal is sent to the test page.

#### Additional points to test in process

1. With Global Privacy Control ON, turn OFF Never-Consent and repeat steps 7-9. The result is `undefined` or `false`.
2. With Global Privacy Control ON, click "Pause Ghostery" and repeat steps 7-9. The result is `undefined` or `false`.

### Never-Consent - Automatic Action Type

> The Automatic Action Type should decide how Ghostery answers cookie consent pop-ups

Every option below is a separate test. Clear cookies of `TEST PAGE` before each test, otherwise the website remembers the previous choice.

1. Open Ghostery Settings, go to "Privacy protection" and turn ON Never-Consent.
2. Click "Extended settings" and set "Automatic Action Type" to `Opt out`.
3. Open website `TEST PAGE` (https://www.espn.com/).
4. Cookie pop-up is hidden. Consent is rejected.
5. Clear cookies of `TEST PAGE` (Ghostery Panel > site menu > "Clear browsing data").
6. Set "Automatic Action Type" to `Opt in`.
7. Open website `TEST PAGE` (https://www.espn.com/).
8. Cookie pop-up is hidden. Consent is accepted.
9. Clear cookies of `TEST PAGE`.
10. Set "Automatic Action Type" to `None`.
11. Open website `TEST PAGE` (https://www.espn.com/).
12. Cookie pop-up is visible.
13. Set "Automatic Action Type" back to `Opt out`.

Ghostery answers cookie pop-ups according to the selected action type.

#### Additional points to test in process

1. After `Opt out` and `Opt in`, open the cookie settings of `TEST PAGE` (usually a link in the page footer) and check if the saved choice matches the selected action type.

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

### Global Pause 🤖

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

### Custom Filters 🤖

> Check whether it is possible to add a simple custom filter

1. Open website `TEST PAGE` (https://example.com/).
2. Text `Example Domain` is visible.
3. Open Ghostery Settings and turn ON Custom Filters.
4. Add CUSTOM FILTER `example.com##+js(rpnt, h1, Example Domain, "hello world")`
5. Tick the checkbox for "Allow trusted scriplets" and Save it.
6. Reload website `TEST PAGE` (https://example.com/).
7. Text `Example Domain` is changed to `hello world`.

On the test page, the text has been modified.

### Browser Redirect Protection

> When Browser Redirect Protection is enabled, the browser should stop before loading a page blocked by Ghostery and show an alert

Not available in Zap mode. The test uses a CUSTOM FILTER that marks `TEST PAGE` as a blocked page (the same method as in the e2e tests).

1. Open Ghostery Settings, go to "Privacy protection" > "Additional Filters" and turn ON Custom Filters.
2. Add CUSTOM FILTER `||example.com^$document` and Save it.
3. Go to "Privacy protection" > "Redirect Protection" and turn OFF Browser Redirect Protection.
4. Open website `TEST PAGE` (https://example.com/).
5. The "Security Alert" page is not shown.
6. Go back to "Redirect Protection" and turn ON Browser Redirect Protection.
7. Open website `TEST PAGE` (https://example.com/).
8. The "Security Alert" page is visible with the text "This page was prevented from loading because it may be malicious." and the URL https://example.com/.
9. Click "Back" button.
10. The previous page is open.

The page is blocked and the Security Alert is shown.

#### Additional points to test in process

1. Repeat steps 7-8 and click "Proceed" button instead of "Back". `TEST PAGE` (https://example.com/) is open.

### Browser Redirect Protection - Real tracker

> Browser Redirect Protection should stop navigation to a known tracker domain without any custom filter

An example of the test on a real tracker. `TEST PAGE` can be changed to any other known tracker domain.

1. Open Ghostery Settings, go to "Privacy protection" > "Redirect Protection" and turn ON Browser Redirect Protection.
2. Open website `TEST PAGE` (https://ad.doubleclick.net/).
3. The "Redirect Alert" page is visible with the text "This page was prevented from loading due to a known tracking redirect to:" and the URL https://ad.doubleclick.net/.
4. Hover over the info icon next to the URL. The tooltip "Learn more about `TRACKER NAME` (DoubleClick) on WhoTracks.Me" is visible.
5. Click "Back" button.
6. The previous page is open.

The redirect to the known tracker is blocked and the Redirect Alert is shown.

### Browser Redirect Protection - Exceptions

> A website added to Exceptions should open without the alert

Run after "Browser Redirect Protection" - the CUSTOM FILTER `||example.com^$document` must be saved.

1. Open website `TEST PAGE` (https://example.com/).
2. The "Security Alert" page is visible.
3. Tick the checkbox "I understand the risk, don't warn me again about this site".
4. Click "Proceed" button.
5. `TEST PAGE` (https://example.com/) is open.
6. Open Ghostery Settings and go to "Privacy protection" > "Redirect Protection".
7. example.com is visible on the Exceptions list.
8. Open website `TEST PAGE` (https://example.com/). The page opens without the alert.
9. Go back to "Redirect Protection" and remove example.com from the Exceptions list.
10. The list shows "No exceptions added yet".
11. Open website `TEST PAGE` (https://example.com/). The "Security Alert" page is visible again.
12. Go back to "Redirect Protection", click "Add", type `example.com` and Save it.
13. example.com is visible on the Exceptions list.
14. Open website `TEST PAGE` (https://example.com/). The page opens without the alert.
15. Remove example.com from the Exceptions list.
16. Open Ghostery Settings > "Additional Filters" and remove CUSTOM FILTER `||example.com^$document`.

Exceptions can be added from the alert page and from Settings, and removed from Settings.

### Search Engine Redirect Protection

> When Search Engine Redirect Protection is enabled, search result links should lead directly to the pages

Not available in Zap mode.

1. Open Ghostery Settings, go to "Privacy protection" > "Redirect Protection" and turn OFF Search Engine Redirect Protection.
2. Open website `TEST PAGE` (https://www.google.com/).
3. Put query "shop". Search result should be visible.
4. Hover over the first search result link.
5. The link address starts with `google.com/url?`.
6. Go back to "Redirect Protection" and turn ON Search Engine Redirect Protection.
7. Reload website `TEST PAGE` and search for "shop" again.
8. Hover over the first search result link.
9. The link address leads directly to the page.
10. Repeat steps 1-9 on `TEST PAGE` (https://www.bing.com/). The link address with protection OFF starts with `bing.com/ck/`.

Search result links lead directly to the pages.

### Distractions

> Each Distractions rule should hide its element only when turned ON

Not available in Zap mode. Every rule below is a separate test. All rules are OFF by default.

#### Sign in with Google

1. Sign in to a Google account in the browser.
2. Open website `TEST PAGE` (https://stackoverflow.com/).
3. The "Sign in with Google" prompt is visible.
4. Open Ghostery Settings, go to "Privacy protection" > "Distractions" and turn ON "Sign in with Google".
5. Reload website `TEST PAGE`.
6. The "Sign in with Google" prompt is hidden.

The Google sign-in prompt is hidden.

#### Social media clutter

1. Open website `TEST PAGE` (https://www.linkedin.com/).
2. Social widgets and sharing panels are visible.
3. Open Ghostery Settings, go to "Privacy protection" > "Distractions" and turn ON "Social media clutter".
4. Reload website `TEST PAGE`.
5. Social widgets and sharing panels are hidden.

Social media clutter is hidden.

#### Short video feeds

1. Open website `TEST PAGE` (https://www.youtube.com/).
2. The Shorts section is visible on the home page.
3. Open Ghostery Settings, go to "Privacy protection" > "Distractions" and turn ON "Short video feeds".
4. Reload website `TEST PAGE`.
5. The Shorts section is hidden.

Short video feeds are hidden.

#### Browser promotions

Use a browser other than Chrome (e.g. Firefox).

1. Open website `TEST PAGE` (https://www.google.com/).
2. The browser promotion (e.g. "Try Chrome") is visible.
3. Open Ghostery Settings, go to "Privacy protection" > "Distractions" and turn ON "Browser promotions".
4. Reload website `TEST PAGE`.
5. The browser promotion is hidden.

Browser promotions are hidden.

#### Additional points to test in process

1. After testing each rule, turn it OFF again and confirm that the element is visible after reload.
2. Use the search field on the Distractions page to find a rule by website name (e.g. "youtube.com").

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

### Websites - Add exception

> A website added in Ghostery Settings becomes an exception - Ghostery is paused on it for the selected time frame

1. Open Ghostery Settings and go to "Websites".
2. Click "Add" button.
3. Type `TEST PAGE` (www.espn.com) in "Website".
4. Leave the default time frame `1 hour` in "Select time frame".
5. Click "Save" button.
6. `TEST PAGE` (www.espn.com) is on the list with "Paused" protection status.
7. Open website `TEST PAGE` (https://www.espn.com/).
8. Open Ghostery Panel. There should be "Ghostery is paused [59m left]".
9. Ads are visible.
10. Go back to "Websites" and click the trash can button next to `TEST PAGE`.
11. The list is empty.
12. Reload website `TEST PAGE`. Ads are not visible.

The website is an exception - Ghostery is paused on it until the exception is removed.

#### Additional points to test in process

1. Repeat the test with time frame `1 day` and `Always`.
2. Use the search field on the Websites page to find a website on the list.

### Element Picker - Single element

> Pick a piece of content, and observe on the lists of blocked items in settings.

1. Open any website.
2. Open Ghostery Panel.
3. Open the site menu and click "Hide content block".
4. Click a single element.
5. Click "HIDE" button.
6. Open Ghostery Settings, go to Websites.
7. Notice on the list a placeholder (name of your site) and "Active" and number of Exceptions — it should be 1.
8. Click on placeholder on the list. Check the script list.
9. Click "Clear", "Save" and go back to the previous screen.
10. List should be empty.

The element is hidden and the exception can be cleared.

### Element Picker - More than one element

> Pick several pieces of content with the slider and check the list of blocked items in settings.

1. Open any website.
2. Open Ghostery Panel.
3. Open the site menu and click "Hide content block".
4. Click 1 element and use slider to hide more elements.
5. Click "HIDE" button.
6. Open Ghostery Settings, go to Websites.
7. Notice on the list a placeholder (name of your site) and "Active" and number of Exceptions — it should show the number of hidden elements.
8. Click on placeholder on the list. Check the script list.
9. Click "Clear", "Save" and go back to the previous screen.
10. List should be empty.

The elements are hidden and the exceptions can be cleared.

#### Additional points to add while testing Element Picker

1. Adding one of the points below creates a separate, full testing scenario.
2. Use VPN and check abroad websites for Germany, UK and USA. Repeat both scenarios.
3. Go with scenario 2. Change "Step 4" to: Check "Block similar Elements" instead of using a slider to get more elements picked.
4. In both scenarios, test the "Trash Can" button on the list of websites to clear the list. Change step 8 into: "click trash can button to clear the list".

### BOB

> Confirm that system works and can be triggered manually.

1. Trigger Developer Tools Settings in Ghostery Settings / Privacy Protection by clicking 5 times on the version number.
2. Click "Test Flag" — the default script is already available.
3. Click "Test Domain" — pick up yours, or use the default one.
 3b. Add more than one website to the list if possible.
4. Go to the domain you picked. Observe popup stating that Ghostery has been paused.
5. Go to the "Websites" tab in "Ghostery settings" and confirm that the website you are testing is there. Do not clear the list.
6. Now go back to the "Developer Tools" and click "Force sync", then "Test Flag" to trigger popup stating that "users report that adblockers no longer breaking this site..." and click OK.
7. Go to Websites to confirm that the list is empty.

#### Additional points to test in process

Adding one of the points below creates a separate, full testing scenario.

1. Add more than one website to the test domain list (see step 3b) and confirm correct behavior.
2. Change step 5 to: Go to the "Websites" tab in "Ghostery settings" and confirm that the website you are testing is there. Clear the list manually. Start the testing process from STEP 1. Confirm that BOB triggers with popup stating that Ghostery is Paused.
3. Repeat the testing process for Germany, UK and USA using VPN.
4. Check if the link to the blog shown in the BOB popup is active.

BOB is working and pop-ups are triggering.

## Additional features

### Trackers Preview on SERP

> Tracker preview on SERPs shows the information gathered for a specific website on the WTM

1. Open website `TEST PAGE` (https://www.google.com/).
2. Put query "shop". Search result should be visible.
3. Tracker Preview near the search result is visible.
4. Click the Trackers Preview wheel icon.
5. Pop-up with information from WTM is visible.

Tracker Preview is working. Gathered information for a specific website are visible.

### WhoTracks.Me Wheel and Trackers Count

> The Ghostery icon in the browser toolbar should show the tracker wheel and the tracker count according to the settings

1. Open Ghostery Settings, go to "WhoTracks.Me" and turn ON "WhoTracks.Me Wheel" and "Trackers Count".
2. Open website `TEST PAGE` (https://www.espn.com/).
3. The Ghostery icon in the toolbar shows the tracker wheel with the tracker count.
4. Turn OFF "WhoTracks.Me Wheel".
5. Reload website `TEST PAGE`.
6. The Ghostery icon shows the ghost with the tracker count.
7. Turn OFF "Trackers Count".
8. Reload website `TEST PAGE`.
9. The Ghostery icon shows the ghost without the tracker count.
10. Turn ON both options again.

The toolbar icon follows the WhoTracks.Me settings.

### Browser Privacy Report

> The privacy report should open and show the data collected in the browser

1. Open a few websites, e.g. `TEST PAGE` (https://www.espn.com/) and `TEST PAGE` (https://www.aarp.org/).
2. Open Ghostery Settings, go to "WhoTracks.Me" and click "View Report" in "Your Browser Privacy Report".
3. The WhoTracks.Me report page is open.
4. "Facts" show numbers higher than 0 (Pages visited, Trackers blocked).
5. "Observed activities" and "Trends" show data.
6. Change the time range (e.g. "Last Month") - the data is updated.
7. Click "Print to PDF" - the print dialog is open.

The privacy report shows the browser data.

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

## Settings

### Settings Sync

> Custom settings should be synchronized between devices using the same browser profile

The test requires the same browser profile (e.g. a Chrome account) signed in on two devices with Ghostery installed.

1. On device A open Ghostery Settings, go to "My Ghostery" and turn ON "Settings Sync".
2. On device B open Ghostery Settings, go to "My Ghostery" and turn ON "Settings Sync".
3. On device A change a setting, e.g. turn ON the "Short video feeds" rule in "Distractions".
4. On device B open Ghostery Settings and go to the same setting.
5. The setting has the same value as on device A.

Settings are synchronized between devices.

### Settings Backup

> Custom settings should be saved to a file and restored from it

1. Open Ghostery Settings, go to "My Ghostery" and click "Export to file" in "Settings Backup".
2. The settings file is downloaded.
3. Change a setting, e.g. turn OFF Ad-Blocking.
4. Go back to "My Ghostery" and click "Import from file".
5. Select the downloaded settings file.
6. Go to "Privacy protection". Ad-Blocking is ON again.

Settings are restored from the backup file.

### Quick Actions

> Every Ghostery option in the browser right-click menu should work

Every option below is a separate test. Quick Actions must be turned ON in Ghostery Settings > "My Ghostery".

#### Pause on this site

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Right-click on the page and go to "Ghostery" > "Pause on this site" > "1 hour".
3. The website reloads. Ads are visible.
4. Open Ghostery Panel. There should be "Ghostery is paused [59m left]".
5. Right-click on the page and click "Ghostery" > "Resume".
6. The website reloads. Ads are not visible.
7. Repeat steps 2-6 with "1 day" and "Always".

The website is paused and resumed from the right-click menu.

#### Hide content block

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Right-click on the page and click "Ghostery" > "Hide content block...".
3. The element picker is open. Continue with the steps from "Element Picker - Single element" (step 4).

The element picker opens from the right-click menu.

#### Open website settings

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Right-click on the page and click "Ghostery" > "Open website settings...".
3. Ghostery Settings are open on the settings of `TEST PAGE`.

#### Open settings

1. Right-click on any website and click "Ghostery" > "Open settings...".
2. Ghostery Settings are open.

#### Disable context menu

1. Right-click on any website and click "Ghostery" > "Disable context menu".
2. Right-click on the page again. The "Ghostery" option is not visible.
3. Open Ghostery Settings, go to "My Ghostery". "Quick Actions" is OFF.
4. Turn ON "Quick Actions".
5. Right-click on the page. The "Ghostery" option is visible again.

The right-click menu can be disabled and enabled again.

## Panel

### Panel - Report an issue

> The issue report form should open from the Ghostery panel

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Open Ghostery Panel and click the website name to open the site menu.
3. Click "Report an issue".
4. The report form is open with `TEST PAGE` filled in.
5. Close the form without sending.

The issue report form is available from the panel.

### Panel - Clear browsing data

> Browsing data of the website should be cleared from the Ghostery panel

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Open Ghostery Panel, open the site menu and click "Clear browsing data".
3. The "Clear browsing data" dialog is open with "This website" selected.
4. Keep the default options ("Close this tab", "Clear cache", "Delete cookies and site data") and click "Clear".
5. The tab is closed.
6. Open website `TEST PAGE` (https://www.espn.com/) again with Never-Consent turned OFF.
7. Cookie pop-up is visible - cookies of the website are deleted.

Browsing data of the website is cleared.

#### Additional points to test in process

1. Repeat the test with "All websites" selected.
2. Click "Cancel" - the dialog is closed and nothing is cleared.

### Panel - View detailed logs

> Detailed logs of the website should open from the Ghostery panel

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Open Ghostery Panel, open the site menu and click "View detailed logs".
3. The logs view is open and lists the requests of `TEST PAGE`.

Detailed logs are available from the panel.

### Panel - Open website settings

> Settings of the current website should open from the Ghostery panel

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Open Ghostery Panel, open the site menu and click "Open website settings".
3. Ghostery Settings are open in a new tab on the settings of `TEST PAGE`.

Website settings are available from the panel.

### Panel - Menu links

> Links in the Ghostery panel menu should open the correct pages

1. Open Ghostery Panel and click the menu button.
2. Click each link below and check if the correct page is open:
   * "Become a Contributor"
   * "Submit a new tracker"
   * "Contact support"
   * "Website"
   * "Privacy Policy"
3. Click each settings link ("Privacy protection", "Websites", "Trackers", "WhoTracks.Me", "My Ghostery") - the correct Ghostery Settings page is open.

All links in the panel menu work.

# Part 2 - Ghostery Zap

Ghostery Zap is the second filtering mode of the extension. In Zap mode all features are inactive on every website until the user clicks the "ZAP ADS!" button in the Ghostery panel on that website. Once a website is zapped, all features work there the same way as in the Ghostery mode. Redirect Protection and Distractions are not available in Zap mode.

## Onboarding

### Zap - Enable extension in Zap mode

> On the Onboarding tab, select the Zap filtering mode

1. Install the extension from ZIP (or reinstall it after Part 1).
2. Check if the Onboarding tab is open.
3. Click "Enable Ghostery" button (Firefox) or "Continue" button (Chromium).
4. Check if the "Select filtering mode" text is visible.
5. Click the ZAP! option.
6. Check if the "You're ready to block ads" text is visible.
7. Open website `TEST PAGE` (https://www.espn.com/) and open Ghostery Panel. The "ZAP ADS!" button is visible.

Ghostery is installed and enabled in the Zap filtering mode.

#### Additional points to test in process

1. Instead of reinstalling, switch the mode in Ghostery Settings (see "Zap - Switch Filtering Mode").

### Zap - Switch Filtering Mode

> The Filtering Mode can be changed between Ghostery and Zap in Ghostery Settings

1. Open Ghostery Settings and go to "My Ghostery".
2. In "Filtering Mode" select ZAP!.
3. Go to "Privacy protection".
4. Check if "Redirect Protection" and "Distractions" are not visible.
5. Open Ghostery Panel. The "ZAP ADS!" button is visible.

Ghostery works in Zap mode.

## Zap features

### Zap - Website not zapped

> Before zapping, Ghostery should only observe the test page, without blocking anything

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Cookie pop-up is visible.
3. Ad is visible.
4. Open Ghostery Panel.
5. Check if the "ZAP ADS!" button is visible.
6. Trackers are listed in "Observed activities".

On the test page, ads and cookie pop-ups are visible. Trackers are only observed.

### Zap - Zap a website

> Clicking the "ZAP ADS!" button should enable all Ghostery features on the test page

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Open Ghostery Panel.
3. Click "ZAP ADS!" button.
4. The website reloads.
5. Ad is not visible.
6. Cookie pop-up is hidden.
7. Open Ghostery Panel. The "Show ads" button is visible.
8. Open Ghostery Settings and go to "Websites".
9. `TEST PAGE` (www.espn.com) is on the list with "Active" protection status.

Ghostery is active on the test page. Ads and cookie pop-ups are blocked.

### Zap - Other websites stay inactive

> Zapping one website should not enable Ghostery on other websites

1. Open website `TEST PAGE` (https://www.reuters.com/).
2. Ad is visible.
3. Open Ghostery Panel.
4. Check if the "ZAP ADS!" button is visible.

Ghostery is active only on the zapped website.

### Zap - Settings on a website not zapped

> Features turned ON in Ghostery Settings should have no effect on a website that is not zapped

1. Open Ghostery Settings and turn ON Never-Consent and Ad-Blocking.
2. Open website `TEST PAGE` (https://www.reuters.com/).
3. Cookie pop-up is visible.
4. Ad is visible.

Settings are applied only after the website is zapped.

### Zap - Show ads

> Clicking the "Show ads" button should disable Ghostery on the zapped test page

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Open Ghostery Panel.
3. Click "Show ads" button.
4. The website reloads.
5. Ad is visible.
6. Open Ghostery Panel. The "ZAP ADS!" button is visible.
7. Open Ghostery Settings and go to "Websites".
8. `TEST PAGE` (www.espn.com) is not on the list.

Ghostery is inactive on the test page again.

### Zap - Websites - Add website

> A website added in Ghostery Settings in Zap mode should be zapped

1. Open Ghostery Settings and go to "Websites".
2. Click "Add" button. There is no "Select time frame" option in Zap mode.
3. Type `TEST PAGE` (www.espn.com) in "Website" and click "Save" button.
4. `TEST PAGE` (www.espn.com) is on the list with "Active" protection status.
5. Open website `TEST PAGE` (https://www.espn.com/). Ads are not visible.
6. Go back to "Websites" and click the trash can button next to `TEST PAGE`.
7. Reload website `TEST PAGE`. Ads are visible.

The website is zapped after adding it in Settings and inactive again after removing it.

### Zap - Quick Actions

> Ghostery options in the browser right-click menu should zap and unzap the website

1. Open website `TEST PAGE` (https://www.espn.com/).
2. Right-click on the page and click "Ghostery" > "Block ads".
3. The website reloads. Ads are not visible.
4. Right-click on the page and click "Ghostery" > "Show ads".
5. The website reloads. Ads are visible.
6. Check if other options ("Hide content block...", "Open website settings...", "Open settings...", "Disable context menu") work the same way as in "Quick Actions" in Part 1.

The website is zapped and unzapped from the right-click menu.

### Zap - Share Ghostery Zap

> The share link in the Ghostery panel should open the Ghostery Zap page

1. Open Ghostery Panel.
2. Click "Share Ghostery Zap" link.
3. Check if the page https://www.ghostery.com/zap?utm_source=gbe&utm_campaign=panel-zap is open.

The Ghostery Zap page is open.

## Part 1 features in Zap mode

### Zap - Part 1 features on a zapped website

> After zapping, all features should work the same way as in the Ghostery mode

1. Zap every `TEST PAGE` and `REGIONAL TEST PAGE` used in Part 1 (see "Zap - Zap a website").
2. Run all tests from Part 1 "Main features", "Advanced features", "Additional features", "Settings" and "Panel" on the zapped websites. Skip "Browser Redirect Protection", "Search Engine Redirect Protection" and "Distractions" - they are not available in Zap mode.
3. All results are the same as in the Ghostery mode.

All features work on zapped websites.

# Release-specific tests

New features, e.g. in-panel notifications, get their own test scenarios in the Pull Request of the release. They are tested once, as part of that release, and are not added to the smoke tests.
