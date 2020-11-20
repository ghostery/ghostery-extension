/**
 * Project Constants
 *
 * Sets project-specific globals to span ES6 modules
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import parser from 'ua-parser-js';

const manifest = chrome.runtime.getManifest();
const isCliqzBrowser = !!(chrome.runtime.isCliqz);

/**
 * Structure which holds parameters to be used throughout the code, a.k.a. global values.
 * Most of them (but not all) are constants.
 * @memberOf  BackgroundClasses
 */
class Globals {
	constructor() {
		// environment variables
		this.DEBUG = manifest.debug || false;
		this.EXTENSION_NAME = manifest.name || 'Ghostery';
		this.EXTENSION_VERSION = manifest.version_name || manifest.version; // Firefox does not support "version_name"
		this.BROWSER_INFO = {
			displayName: '', name: '', token: '', version: '', os: 'other'
		};
		this.BROWSER_INFO_READY = this.buildBrowserInfo();
		this.IS_CLIQZ = !!((manifest.applications && manifest.applications.gecko && manifest.applications.gecko.update_url) || isCliqzBrowser);

		// flags
		this.JUST_INSTALLED = false;
		this.JUST_UPGRADED = false;
		this.JUST_UPGRADED_FROM_7 = false;
		this.REQUIRE_LEGACY_OPT_IN = false;
		this.HOTFIX = false;
		this.LET_REDIRECTS_THROUGH = false;
		this.NOTIFICATIONS_LOADED = false;
		this.upgrade_alert_shown = false;

		// init
		this.INIT_COMPLETE = false;
		this.initProps = {};

		// domains
		this.GHOSTERY_ROOT_DOMAIN = `${this.DEBUG ? 'ghosterystage' : 'ghostery'}.com`;
		this.GHOSTERY_BASE_URL = `https://${this.GHOSTERY_ROOT_DOMAIN}`;
		this.ACCOUNT_BASE_URL = `https://account.${this.GHOSTERY_ROOT_DOMAIN}`;
		this.CHECKOUT_BASE_URL = `https://checkout.${this.GHOSTERY_ROOT_DOMAIN}`;
		this.METRICS_BASE_URL = `https://${this.DEBUG ? 'staging-d' : 'd'}.ghostery.com`;
		this.CMP_BASE_URL = `https://${this.DEBUG ? 'staging-cmp-cdn' : 'cmp-cdn'}.ghostery.com`;
		this.CDN_BASE_URL = `https://${this.DEBUG ? 'staging-cdn' : 'cdn'}.ghostery.com`;
		this.APPS_BASE_URL = `https://${this.DEBUG ? 'staging-apps' : 'apps'}.ghostery.com`;
		this.GCACHE_BASE_URL = `https://${this.DEBUG ? 'staging-gcache' : 'gcache'}.ghostery.com`;
		this.AUTH_SERVER = `https://consumerapi.${this.GHOSTERY_ROOT_DOMAIN}`;
		this.ACCOUNT_SERVER = `https://accountapi.${this.GHOSTERY_ROOT_DOMAIN}`;
		this.COOKIE_DOMAIN = `.${this.GHOSTERY_ROOT_DOMAIN}`;
		this.COOKIE_URL = this.GHOSTERY_BASE_URL;

		// extension IDs
		this.GHOSTERY_TAB_CHROME_PRODUCTION_ID = 'plmapebanmikcofllaaddgeocahboejc';
		this.GHOSTERY_TAB_CHROME_PRERELEASE_ID = 'fenghpkndeggbbpjeojffgbmdmnaelmf';
		this.GHOSTERY_TAB_CHROME_TEST_ID = 'ifnpgdmcliingpambkkihjlhikmbbjid';
		this.GHOSTERY_TAB_FIREFOX_PRODUCTION_ID = 'firefoxtab@ghostery.com';
		this.GHOSTERY_TAB_FIREFOX_TEST_ID = '{0ea88bc4-03bd-4baa-8153-acc861589c1c}';

		// Site Policy named constants
		this.BLACKLISTED = 1;
		this.WHITELISTED = 2;

		// data stores
		this.REDIRECT_MAP = new Map();
		this.BLOCKED_REDIRECT_DATA = {};
		this.EXCLUDES = [
			'extension.ghostery.com',
			'extension.ghosterystage.com',
			'extension.ghosterydev.com',
			'signon.ghostery.com',
			'signon.ghosterystage.com',
			'account.ghostery.com',
			'account.ghosterystage.com'
		];

		// Full list of synchronized settings
		this.SYNC_ARRAY = [
			'alert_bubble_pos',
			'alert_bubble_timeout',
			'alert_expanded',
			'block_by_default',
			'cliqz_adb_mode',
			'cliqz_module_whitelist',
			'current_theme',
			'enable_ad_block',
			'enable_anti_tracking',
			'enable_autoupdate',
			'enable_click2play',
			'enable_click2play_social',
			'enable_human_web',
			'enable_metrics',
			'enable_abtests',
			'enable_smart_block',
			'expand_all_trackers',
			'hide_alert_trusted',
			'ignore_first_party',
			'import_callout_dismissed',
			'is_expanded',
			'is_expert',
			'notify_library_updates',
			'notify_promotions',
			'notify_upgrade_updates',
			'reload_banner_status',
			'selected_app_ids',
			'show_alert',
			'show_badge',
			'show_cmp',
			'show_tracker_urls',
			'site_specific_blocks',
			'site_specific_unblocks',
			'toggle_individual_trackers',
			'trackers_banner_status',
		];

		this.SESSION = {
			paused_blocking: false,
			paused_blocking_timeout: 0,
			abtests: {},
			cmp_data: {}
		};
	}

	/**
	 * Gets UA and Platform strings for current browser
	 * @return {Promise}
	 */
	buildBrowserInfo() {
		const ua = parser(navigator.userAgent);
		const browser = ua.browser.name.toLowerCase();
		const version = parseInt(ua.browser.version.toString(), 10); // convert to string for Chrome
		const platform = ua.os.name.toLowerCase();

		// Set name and token properties. CMP uses `name` value.  Metrics uses `token`
		if (this.IS_CLIQZ) {
			this.BROWSER_INFO.displayName = 'Cliqz';
			this.BROWSER_INFO.name = 'cliqz';
			this.BROWSER_INFO.token = 'cl';
		} else if (browser.includes('edge')) {
			this.BROWSER_INFO.displayName = 'Edge';
			this.BROWSER_INFO.name = 'edge';
			this.BROWSER_INFO.token = 'ed';
		} else if (browser.includes('opera')) {
			this.BROWSER_INFO.displayName = 'Opera';
			this.BROWSER_INFO.name = 'opera';
			this.BROWSER_INFO.token = 'op';
		} else if (browser.includes('chrome')) {
			this.BROWSER_INFO.displayName = 'Chrome';
			this.BROWSER_INFO.name = 'chrome';
			this.BROWSER_INFO.token = 'ch';
		} else if (browser.includes('firefox')) {
			this.BROWSER_INFO.displayName = 'Firefox';
			this.BROWSER_INFO.name = 'firefox';
			this.BROWSER_INFO.token = 'ff';
		} else if (browser.includes('yandex')) {
			this.BROWSER_INFO.displayName = 'Yandex';
			this.BROWSER_INFO.name = 'yandex';
			this.BROWSER_INFO.token = 'yx';
		}

		// Set OS property
		if (platform.includes('mac')) {
			this.BROWSER_INFO.os = 'mac';
		} else if (platform.includes('win')) {
			this.BROWSER_INFO.os = 'win';
		} else if (platform.includes('linux')) {
			this.BROWSER_INFO.os = 'linux';
		} else if (platform.includes('android')) {
			this.BROWSER_INFO.os = 'android';
		}

		// Set version property
		this.BROWSER_INFO.version = version;

		// Check for Ghostery browsers
		return Globals._checkBrowserInfo().then((info) => {
			if (info && info.name === 'Ghostery') {
				if (platform.includes('android')) {
					this.BROWSER_INFO.displayName = 'Ghostery Android Browser';
					this.BROWSER_INFO.name = 'ghostery_android';
					this.BROWSER_INFO.token = 'ga';
					this.BROWSER_INFO.os = 'android';
					this.BROWSER_INFO.version = info.version;
				} else {
					this.BROWSER_INFO.displayName = 'Ghostery Desktop Browser';
					this.BROWSER_INFO.name = 'ghostery_desktop';
					this.BROWSER_INFO.token = 'gd';
					this.BROWSER_INFO.version = info.version.split('.').join('');
				}
			}
		});
	}

	/**
	* Check for information about this browser (FF only)
	* @private
	* @return {Promise}
	*/
	static _checkBrowserInfo() {
		if (typeof chrome.runtime.getBrowserInfo === 'function') {
			return chrome.runtime.getBrowserInfo();
		}
		return Promise.resolve(false);
	}
}

// return the class as a singleton
export default new Globals();
