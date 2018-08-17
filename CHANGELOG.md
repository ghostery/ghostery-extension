### GHOSTERY 8.2.4 (August 20, 2018)

+ Fixes Firefox account logout issues
+ Fixes several UI-related Rewards bugs
+ Fixes broken settings export feature from panel
+ Delay tracker database update to 1 hour
+ Improved AUTH error messaging
+ New UI and experieince for Firefox Android

### GHOSTERY 8.2.3 (August 7, 2018)

+ Fix Rewards campaign names that include a '%' issue, which caused a blank panel
+ Fix login and register forms on setup page being called twice on submit, which triggered misleading callout messages
+ Fix several login/logout issues for existing users on startup

### GHOSTERY 8.2.2 (August 6, 2018)

+ Complete rewrite of account logic to support v2 AUTH API
+ Fixes issue where some users did not remain logged in after browser restart
+ Improved error messaging related to user accounts
+ Login state now syncs between extension and account.ghostery.com
+ Rewards UI improvements
+ Fixes Anti-tracking login issue with microsoft.com and salesforce.com
+ Fixes issue where Ghostery was breaking web requests from other extensions

### GHOSTERY 8.2.1 (July 16, 2018)

+ Ghostery tracker counter and badge icon now includes block counts from Anti-Tracking and Ad-Blocker
+ Fixes issue where settings menu does not close
+ Remove redundant opt-in for Rewards
+ Improved translations for German and Russian languages
+ Styling adjustments and improvements for Edge
+ Various bug fixes and improvements for Rewards

### GHOSTERY 8.2.0 (July 2, 2018)

+ Improved simple-view and detail-view UI
+ Ghostery Rewards integration
+ Fixes for Ad-Blocker cosmetic filters on Chrome
+ Move dependency manager to Yarn
+ Performance improvements and bug fixes

### GHOSTERY 8.1.3 (May 31, 2018)

+ Fix for 100% CPU on Chrome 67 from synchronous XHR

### GHOSTERY 8.1.2 (April 19, 2018)

+ Remove WebSocket filter scheme support for older versions of Chrome and FF
+ Fix Human Web endpoint URLs

### GHOSTERY 8.1.1 (April 13, 2018)

+ New surrogate for 'NetRatings SiteCensus' tracker that locks up Chrome when blocked (Issue #11)
+ Site-specific tracker allow now bypasses Anti-Tracking
+ Adds Cliqz browser compatibility
+ Improved German language translations for better UI
+ Fixes inconsistency in install_complete metric
+ Removed scroll bar in Simple View
+ Updated CONTRIBUTING (Issue #6)

### GHOSTERY 8.1.0 (March 8, 2017)

+ Ghostery is now open source!!
+ Changed license to MPL-2.0
+ Updated README, CONTRIBUTING, CODE-OF-CONDUCT
+ All files now support JSDoc. Build docs with `npm run docs`
+ Fixed issue when selecting Block All/None in setup flow custom blocking
+ Updated language translations
