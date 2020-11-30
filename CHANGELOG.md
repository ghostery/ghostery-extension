### GHOSTERY 8.5.4 (November 20, 2020)

+ Adds support for Ghostery Browser (#621, #622)
+ Remove Ghostery Rewards (#630)
+ Updated feature names (#613, #626, #627)
+ Shortened metrics uninstall URL (#615)
+ Fixes bug with initial account settings sync (#629)
+ Bug fixes (#617, #624, #625, #628)
+ Updated translations

See the complete GitHub [milestone](https://github.com/ghostery/ghostery-extension/milestone/15?closed=1)

### GHOSTERY 8.5.3 (October 8, 2020)

+ Updated Firefox Android extension panel UI and mobile optimizations (#587)
+ New console debugging interface for user troubleshooting (#568)
+ Display error message after too many failed login attempts (#577)
+ Add opt-out for AB Tests (#608)
+ Added product id parameter to extension pings (#574)
+ Detect Ghostery Desktop Browser (#602)
+ Remove broken page pings (#609)
+ On-boarding AB Tests (#603)
+ Updated translations

See the complete GitHub [milestone](https://github.com/ghostery/ghostery-extension/milestone/14?closed=1)

### GHOSTERY 8.5.2 (July 30, 2020)

+ Fixes bug where Ghostery icon could be grayed out on restricted sites (#564)
+ Clean up lint suppression rules. Remove React UNSAFE events. (#559, #566)
+ Fixes bug where themes were not unlocked on upgrade (#555)
+ Add upgrade promotion to Intro Hub (#551)
+ Adds options for yearly subscription plans (#567)
+ Rate limit password reset attempts (#548)
+ Add A/B testing support to promo modals (#583)
+ Updates to account creation panel messaging (#541)
+ Slimmer Human Web modules for Android browsers (#569)
+ Remove Spring promo modal (#571)
+ Search for missing language tokens (#563)
+ Updated campaign metrics (#576)
+ Update dependencies
+ Bump minimum versions for Firefox, Chrome and Opera

### GHOSTERY 8.5.1 (June 1, 2020)

+ Unlock Plus features for Ghostery Midnight users (#546)
+ Update Ghostery Plus feature list in subscription panel (#540)
+ Remove hard-coded subscription pricing (#547)

### GHOSTERY 8.5.0 (May 7, 2020)

+ New Spring themes for Plus subscribers (#525)
+ New settings option to select Ad-Blocker lists (#527)
+ Add password reset link to Intro Hub (#507)
+ Updated in-app promo modals (#509)
+ Fixes bug in site-specific tracker white-listing (#522, Fixes #519)
+ Improved Click2Play Script Injection (#528)
+ Standardize all Ghostery staging and production global URLs (#511)
+ Updated Rewards UI (#521)
+ Update legacy unit tests (#526)
+ Updated translations

### GHOSTERY 8.4.9 (April 9, 2020)

+ Better handling of semantic version comparison (#524)
+ Updates to AMO build script (#524)

### GHOSTERY 8.4.8 (March 30, 2020)

+ Fixes issue that could intermittently cause some cookies to be reset (Fixes #514)
+ Handle legacy opt-in settings for Firefox (#518)

### GHOSTERY 8.4.7 (March 16, 2020)

+ Migrate to the new Chromium-based Edge browser (#492)
+ Disable Purplebox on Firefox Android (#494)
+ Allow white-listing of wildcard domains (#501)
+ Allow site-specific white-listing of Unknown Trackers caught by Ad-Blocker (#503)
+ Fixes issue when adding localhost to Trusted Sites with port value (Fixes #470)
+ Add locale-appropriate formatting to historical stats numbers (#498)
+ Remove email opt-in from account creation in panel and hub (#495)
+ More aggressive cookie-blocking via Anti-Tracking (#490)

### GHOSTERY 8.4.6 (December 24, 2019)

+ Modularize Rewards code (#462)
+ Updated promo modals for Ghostery Midnight (#485, #486)
+ Disabled Rewards for Edge (#483)
+ Updated translations

### GHOSTERY 8.4.5 (November 20, 2019)

+ Remove unused telemetry from promo modals (#474)
+ Update Rewards opt-in setting for Firefox

### GHOSTERY 8.4.4 (November 12, 2019)

+ New upgrade modals for Ghostery Plus & Ghostery Insights (#458,#460,#463,#464,#467,#468)
+ Improves context-detection of WebRequests, particularly for pages using service workers (#461)
+ Fixes some cases where cookies were blocked for first parties because anti-tracking thought they were third (#461)
+ Updates Ad Blocker version. We now support HTML filters on Firefox (#461)
+ Human Web cleanup and refactor (#461)
+ Updated telemetry (#466)
+ Updated translations
+ Language string cleanup

### GHOSTERY 8.4.3 (October 1, 2019)

+ Fixes issue where Detail View is blank when there are only Unknown trackers found (#446)
+ New opt-in flow for Ghostery Rewards (#444)
+ Uncheck email promotions options for create account view (#446)
+ Revert Rewards opt-in setting for Firefox (#446)
+ Compatibility fixes for Cliqz browser (#450, #452, #455)
+ Fixes issue where Ghostery on-boarding Hub appeared on each browser launch (Fixes #456)
+ Fixes issue where site-specific blocking settings did not persist for some users
+ Fixes for AMO build script
+ Update project dependencies
+ Updated translations

### GHOSTERY 8.4.2 (August 28, 2019)

+ Fix slow memory leak in Firefox (#434)
+ Fix error message on Forgot Password panel (#440)
+ Update Intro Hub copy for Firefox (#436)
+ Change Rewards opt-in setting for Firefox (#437)
+ Adds Cliqz anti-ad-blocker circumvention rules (#443)
+ Package build script for AMO review (#441)
+ Updated translations

### GHOSTERY 8.4.1 (August 6, 2019)

+ Add new Unknown tracker category in detail view with anti-tracking whitelist (#417, #433)
+ Fixes broken `target=_blank` links in Opera (#426)
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
