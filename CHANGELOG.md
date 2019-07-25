### GHOSTERY 8.4.1 (UNRELEASED)

+ Add new Data Points tracker category in detail view with anti-tracking whitelist (#417)
+ Fixes error `Uncaught TypeError: c.querySelectorAll` (#406)
+ Show ad-blocking icons in detail view tracker list (#411)
+ Add new terms and conditions acknowledgment to account creation(#414)
+ Implement new Cliqz url parser (#410)
+ Fix donut tooltip (#409)
+ Fix bug in collapsed Summary view on un-scanned pages (#404)
+ Improved broken page metrics (#418)
+ Update all project dependencies to satisfy security alerts (#405)
+ Updated translations (#402)

### GHOSTERY 8.4.0 (June 26, 2019)

+ Add new counter for Requests Modified by Anti-Tracking (#392)
+ Show fingerprint, cookie and advertisement icons in Detail View tracker list (#394)
+ Improved Anti-Tracking integration (#377)
+ Integrate Click2Play into SmartBlocking (#388)
+ Respect pause state before displaying CMP and Rewards windows (Fixes #389)
+ Performance improvements (Fixes #12)
+ Improved Ad-Blocker filter rule injection (Fixes #381)
+ Updated translations (#397, #400)

### GHOSTERY 8.3.4 (May 8, 2019)

+ Fixes bug in Click2Play redirect blocking

### GHOSTERY 8.3.3 (April 24, 2019)

+ Fixes bug where Ad-Blocker/Anti-Tracking modules did not respect whitelist settings
+ Fixes bug in category description names

### GHOSTERY 8.3.2 (April 22, 2019)

+ Ghostery tracker panel now updates dynamically in real time!
+ Remove unsupported file types for Opera automated-review
+ Removed unnecessary files for slimmer production build
+ Sync account creation UI between intro hub, panel and auth-web
+ Performance improvements when browsing certain Google sites (gmail, maps)
+ Feature parity for Edge browser (Human Web, Rewards)
+ Clean up various errors thrown by content scripts and message handlers
+ Updated Readme (team members and open-source projects)
+ Minor UI tweaks

### GHOSTERY 8.3.1 (January 31, 2019)

+ Add `options_ui` support for Intro Hub
+ Add Ghostery Plus support for Opera and Edge
+ Fixes issue where page load speed value could be negative
+ Fixes "Report a Broken Page" link
+ Multiple translation fixes
+ Minor bug fixes

### GHOSTERY 8.3.0 (January 16, 2019)

+ New Ghostery Plus features - Historical Stats, Midnight Theme
+ New intro hub with streamlined setup and tutorial
+ Improved UI for Firefox Android
+ Integration with Ghostery Tab extension for Chrome
+ Improved anti-tracking whitelist logic
+ Improved anti-ad-blocker circumvention
+ Bug fixes and updated translations

### GHOSTERY 8.2.6 (December 4, 2018)

+ Remove WebSocket permissions and filter support for Firefox
+ Minor UI tweaks

### GHOSTERY 8.2.5 (November 27, 2018)

+ Multiple UI fixes for Rewards panel
+ Bump minimum Chrome version to 58+, Opera to 45+
+ Added support for web socket request filtering
+ Minor UI tweaks and bug fixes

### GHOSTERY 8.2.4 (August 22, 2018)

+ Fixes Firefox account logout issues
+ Fixes several UI-related Rewards bugs
+ Fixes broken settings export feature from panel
+ Delay tracker database update to 1 hour
+ Improved AUTH error messaging

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
