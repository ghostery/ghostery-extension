## How to start?

E2E tests path: ./extension-manidest-v3/tests/e2e/

Start e2e tests
```
npx playwright test
```

To start specific test
```
playwright test --grep @doTheOnboarding
```

TODO: create a TEST PAGE

Avaiable scenarios:

    Scenario: Install the extension and do the Onboarding (Chrome only)
    @doTheOnboarding
        Prerequeriemnts:
        Acceptance criteria:
            Step 1: Install the extension
                2: Wait for the Onboarding
                3: Enable Ghostery
    
    Scenario: Install the extension and skip the Onboardingg (Chrome only)
    @skipTheOnboarding
        Prerequeriemnts:
        Acceptance criteria:
            Step 1: Install the extension
                2: Wait for the Onboarding
                3: Keep Ghostery disabled
                4: Open a TEST PAGE - nothing should be blocked
        
    Scenario: Check Pause Ghostery module
    @pauseGhostery
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                2: Open Ghostery Settings on Privacy Settings
                3: Click on "Pause Ghostery" button
                4: Open a TEST PAGE
                5: Nothing should be blocked

    Scenario: Check Ad-Blocking module
    @checksAdBlocking
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                2: Open Ghostery Settings on Privacy Settings
                3: Click on "Ad-Blocking" button
                4: Open a TEST PAGE
                5: Ads should not be blocked
 
    Scenario: Check Anti-Tracking module
    @checksAntiTracking
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                2: Open Ghostery Settings on Privacy Settings
                3: Click on "Anti-Tracking" button
                4: Open a TEST PAGE
                5: Trackers should not be blocked
 
    Scenario: Check Never-Consent module
    @checksNeverConsent
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                2: Open Ghostery Settings on Privacy Settings
                3: Click on "Never-Consent" button
                4: Open a TEST PAGE
                5: Cookie pop-up should not be blocked 
 
    Scenario: Check Regional Filters module
    @checksRegionalFilters
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                2: Open Ghostery Settings on Privacy Settings
                3: Enable Regional Filters
                4: Open a TEST PAGE
                5: Regional item/s should not be blocked
 
    Scenario: Trust site for {1 hour}
    @trustSite1hour
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                2: Open Ghostery panel
                3: Click "Trust this site"
                4: Nothing should be blocked
 
    Scenario: Check Simple View details
    @checksSimpleViewDetails
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                2: Open Ghostery panel on {Simple View}
                3: Categories are displayed (on test page categories are fixed)
                4: Blocked tracker are displayed (on test page there are fixed number of trackers)
 
    Scenario: Checks Detailed View details
    @checksDetailedViewDetails
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                2: Open Ghostery panel on {Detailed View}
                3: Categories are displayed (on test page categories are fixed)
                4: Trackers are displayed (on test page there are fixed names of trackers)
                5: Blocked tracker are displayed (on test page there are fixed number of trackers)
 
    Scenario: Check Selective Blocking
    @checksSelectiveBlocking
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open a TEST PAGE - all should be blocked
                 2: Open Ghostery panel on {Detailed View}
                 3: Open Tracker details (select one from the list)
                 4: Check the URL status (it should be blocked)
                 5: Open Protection status
                 6: Change Protection status to "Trust on all websites"
                 7: Open Ghostery panel on {Detailed View}
                 8: Open Tracker details (select the same from the list)
                 9: Check the URL status (it should be observed)
 
    Scenario: Login into Ghostery account
    @loginIntoGhosteryAccount
        Prerequeriemnts: Install the extension
        Acceptance criteria:
            Step 1: Open Ghostery Settings on My Account
                 2: Click on "Sign In" button
                 3: https://www.ghostery.com/signin should be opened
                 4: Sign in
                 5: Open Ghostery Settings on Me Account and check if the user is signed in