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

---

DESCRIPTION

---

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

---

## Test 02 - Disabled extension on the Onboarding

Desc: On the Onboarding tab, keep Ghostery disabled.

1. Check if the Onboarding tab is open.
2. Click the "Keep Disabled" button.
3. Check if the "Ghostery is installed with limited functionality" text is visible.

Outcome: Ghostery is installed but kept disabled.

---

## Test 03 - Enabled extension on the Onboarding

Desc: On the Onboarding tab, enable Ghostery to give all necessary permissions.

1. Open Ghostery panel.
2. Click "Enable Ghostery" button on the Ghostery panel.
3. Check if the Onboarding tab is open.
4. Click "Enable Ghostery" button.
5. Check if the "Setup Successful" text is visible.

Outcome: Ghostery is installed and enabled.

---

## Test 00 - Check if Ad-Blocking is working

Desc: 

1. Open Ghostery Settings and turn OFF Ad-Blocking.
2. Open website: TEST PAGE
3. Ad is visible.
4. Open Ghostery Settings.
5. Turn ON Ad-Blocking
6. Reload website: TEST PAGE
7. Ad is hidden.

Outcome: 

---

## Test 00 - Check if Anti-tracking is working

Desc: 

1. Open Ghostery Settings and turn OFF Anti-tracking.
2. Open website: TEST PAGE.
3. Open Ghostery Panel on Detailed View.
4. Open Tracker TRACKER NAME details.
5. URLs are not blocked.
6. Open Ghostery Settings.
7. Turn ON Anti-tracking.
8. Reload website: TEST PAGE.
9. Open Ghostery Panel on Detailed View.
10. Open Tracker TRACKER NAME details.
11. URLs are blocked. 

Outcome: 

---

## Test 00 - Check if Never-Consent is working

Desc: 

1. Open Ghostery Settings and turn OFF Never-Consent.
2. Open website: TEST PAGE (https://www.espn.com/).
3. Cookie pop-up is visible.
4. Open Ghostery Settings.
5. Turn ON Never-Consent.
6. Reload website: TEST PAGE (https://www.espn.com/).
7. Cookie pop-up is hidden.

Outcome: 

---

## Test 00 - Check if Regional Filters are working

Desc: 

1. Open Ghostery Settings and turn OFF Regional Filters.
2. Open website: REGIONAL TEST PAGE.
3. Ad is visible.
4. Open Ghostery Settings.
5. Turn ON Regional Filters.
6. Reload website: REGIONAL TEST PAGE.
7. Ad is hidden.

Outcome: 

---

## Test 00 - Check if Custom Filters are working

Desc: 

1. Open website: TEST PAGE
2. SOMETHING is visible.
3. Open Ghostery Settings and turn ON Custom Filters.
4. Add CUSTOM FILTER and Save it.
5. Reload website: TEST PAGE
9. SOMETHING is hidden (changed).

Outcome: 

---

## Test 00 - Check Protection Status / Exceptions

Desc: 

1. 

Outcome: 

---

## Test 00 - Check Website Pause

Desc: 

1. 

Outcome: 

---

## Test 00 - Check Global Pause

Desc: 

1. 

Outcome: 

---

## Test 00 - Check Trackers Preview on SERP

Desc: 

1. 

Outcome: 

---

## Test 00 - Check Ghostery Account synchronization

Desc: 

1. 

Outcome: 

---

## Test 00 - Check other language than ENG ??

Desc: 

1. 

Outcome: 