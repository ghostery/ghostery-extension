---
layout: post
title:  "Release tests."
---

[TOC]
    ## Test 01 - Installation
    ## Test 02 - Disabled extension on the Onboarding
    ## Test 03 - Enabled extension on the Onboarding
    ## Test 04 - Check if Ad-Blocking is working
    ## Test 05 - Check if Anti-tracking is working
    ## Test 06 - Check if Never-Consent is working
    ## Test 07 - Check if Regional Filters are working
    ## Test 08 - Check if Custom Filters are working
    ## Test 09 - Check Protection Status / Exceptions
    ## Test 10 - Check Website Pause
    ## Test 11 - Check Global Pause
    ## Test 12 - Check Trackers Preview on SERP
    ## Test 13 - Check Ghostery Account synchronization
    ## Test 14 - Check other language than ENG ??


DESCRIPTION


Dictionary:
    - TEST PAGE
    - REGIONAL TEST PAGE
    - TRACKER NAME
    - CUSTOM FILTER

---

## Test 01 - Installation 
Desc: Install the extension from GitHub/ ZIP/ Store.
  
1. Install the extension from GitHub/ ZIP/ Store.
2. Check if the Onboarding tab is open.
  
Outcome: The Onbarding tab is open.


## Test 02 - Disabled extension on the Onboarding
Desc: On the Onboarding tab, keep Ghostery disabled.

1. Check if the Onboarding tab is open.
2. Click the "Keep Disabled" button.
3. Check if the "Ghostery is installed with limited functionality" text is visible. 

Outcome: Ghostery is installed but kept disabled. 


## Test 03 - Enabled extension on the Onboarding 
Desc: On the Onboarding tab, enable Ghostery to give all necessary permissions.
 
1. Open Ghostery panel.
2. Click "Enable Ghostery" button on the Ghostery panel.
3. Check if the Onboarding tab is open.
4. Click "Enable Ghostery" button.
5. Check if the "Setup Successful" text is visible. 

Outcome: Ghostery is installed and enabled. 
 

## Test 04 - Check if Ad-Blocking is working
Desc: Ads on the test site must disappear when the Ad-Blocking module is activated.

1. Open Ghostery Settings and turn OFF Ad-Blocking.
2. Open website TEST PAGE (https://edition.cnn.com/).
3. Ad is visible.
4. Open Ghostery Settings.
5. Turn ON Ad-Blocking
6. Reload website TEST PAGE (https://edition.cnn.com/).
7. Ad is hidden. 

Outcome: Ads on the test site are not visible


## Test 05 - Check if Anti-tracking is working
Desc: When Anti-Tracking is enabled on a test site, URLs for the selected tracker should be blocked.

1. Open Ghostery Settings and turn OFF Anti-tracking.
2. Open website TEST PAGE (https://www.aarp.org/).
3. Open Ghostery Panel on Detailed View.
4. Open Tracker TRACKER NAME (DoubleClick) details.
5. URLs are not blocked.
6. Open Ghostery Settings.
7. Turn ON Anti-tracking.
8. Reload website TEST PAGE (https://www.aarp.org/).
9. Open Ghostery Panel on Detailed View.
10. Open Tracker TRACKER NAME (DoubleClick) details.
11. URLs are blocked. 

Outcome: URLs for the selected tracker are blocked.
 

## Test 06 - Check if Never-Consent is working
Desc: When Never-Consent is run on a test page, cookie pop-ups should be blocked.

1. Open Ghostery Settings and turn OFF Never-Consent.
2. Open website TEST PAGE (https://www.espn.com/).
3. Cookie pop-up is visible.
4. Open Ghostery Settings.
5. Turn ON Never-Consent.
6. Reload website TEST PAGE (https://www.espn.com/).
7. Cookie pop-up is hidden. 

Outcome: The cookie pop-up is hidden.
 

## Test 07 - Check if Regional Filters are working
Desc: Regional filters should work on a selected region. In this test, I am using a Polish region and a Polish website to test this functionality.

1. Open Ghostery Settings and turn OFF Regional Filters.
2. Open website REGIONAL TEST PAGE (https://www.cowwilanowie.pl/).
3. Ad is visible.
4. Open Ghostery Settings.
5. Turn ON Regional Filters.
6. Tick the desired region - Polish (pl).
7. Reload website REGIONAL TEST PAGE (https://www.cowwilanowie.pl/).
8. Ad is hidden. 

Outcome: Ad on the regional test site is blocked.


## Test 08 - Check if Custom Filters are working
Desc: Check whether it is possible to add a simple cumstom filter.

1. Open website TEST PAGE (https://example.com/).
2. Text `Example Domain` is visible.
3. Open Ghostery Settings and turn ON Custom Filters.
4. Add CUSTOM FILTER `http://example.com/##+js(rpnt, h1, Example Domain, "hello world")` and Save it.
5. Reload website TEST PAGE (https://example.com/).
9. Text `Example Domain` is changed to `hello world`. 

Outcome: On the test page, the text has been modified.


## Test 09 - Check Protection Status / Exceptions
Desc: All trackers in all categories in the Tracker Database are blocked by default. It is possible to add an exception to a tracker - global and/or selected page.

1. Open website TEST PAGE (https://www.aarp.org/).
2. Open Ghostery Panel on Detailed View.
3. Open Tracker TRACKER NAME (DoubleClick) details.
4. URLs are blocked.
5. Click "Blocked on all websites" button.
6. Protection Status should be visible.
7. Tick on "Trust on all websites. Add exception.".
8. Reload website TEST PAGE (https://www.aarp.org/).
9. Open Ghostery Panel on Detailed View.
10. Open Tracker TRACKER NAME (DoubleClick) details.
11. URLs are observed.

Outcome: An exception is added to the tracker. URLs are not blocked or modified, only observed.

## Test 10 - Check Website Pause
Desc: When Website Pause is enabled, the entire extension should turn off its activity only on the test page. On the Ghostery panel, only detected activity should be shown, while nothing should be blocked or modified.

1. Open website TEST PAGE (https://www.espn.com/).
2. Open Ghostery Panel.
3. Click "Pause on this site [1 hour]" button.
4. Reload website TEST PAGE (https://www.espn.com/).
5. Open Ghostery Panel. There should be "Ghostery is paused [59m left]".
6. Trackers are not blocked and not modified. 
7. Ads are visible.

Outcome: On the test page, trackers are not blocked or modified, ads are visible.


## Test 11 - Check Global Pause
Desc: When Global Pause is enabled, the entire extension should turn off its activity on all pages. On the Ghostery panel, only detected activity should be shown, while nothing should be blocked or modified.

1. Open website TEST PAGE (https://www.espn.com/).
2. Open Ghostery Settings.
3. Click "Pause Ghostery" button.
4. Reload website: TEST PAGE (https://www.espn.com/).
5. Open Ghostery Panel. There should be "Ghostery is paused [23h 59m left]".
6. Trackers are not blocked and not modified. 
7. Ads are visible.
8. Open website TEST PAGE (https://www.aarp.org/).
9. Open Ghostery Panel. There should be "Ghostery is paused [23h 59m left]".
10. Trackers are not blocked and not modified. 
11. Ads are visible.

Outcome: On the test pages, trackers are not blocked or modified, ads are visible.


## Test 12 - Check Trackers Preview on SERP
Desc: Tracker preview on SERPs shows the information gathered for a specific website on the WTM.

1. Open website TEST PAGE (https://www.google.com/).
2. Put query "shop". Search result should be visible.
3. Tracker Preview near the search result is visible.
4. Click the Trackers Preview wheel icon.
5. Pop-up with information from WTM is visible.

Outcome: Tracker Preview is working. Gathered information for a specific website are visible.


## Test 13 - Check Ghostery Account synchronization
Desc: Check if Ghostery Account settings synchronization between browsers is working. 

1. Open Firefox browser and Chrome browser.
2. In both browsers, login into Ghostery Account.
3. In both browsers, open Ghostery Settings.
4. In Firefox browser turn OFF Ad-Blocking. Reload Ghostery Settings.
5. In Chrome browser reload Ghostery Settings.
6. Ad-Blocking should be turned OFF. 
7. Turn ON Ad-Blocking and turn OFF Anti-tracking. Reload Ghostery Settings.
8. In Firefox browser reload Ghostery Settings.
9. Ad-Blocking should be turned ON. Anti-tracking should be OFF. 

Outcome: Synchronization between browsers is working. In Firefox Ad-Blocking is enabled and Anti-tracking disabled.


## Test 14 - Check other language than default
Desc: After the installation, the default extension' language is set by the browser. Check if changing that will change the extension' language.

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

Outcome: The language of the extension has been changed from the default.