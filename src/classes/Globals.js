/**
 * Project Constants
 *
 * Sets project-specific globals to span ES6 modules
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

const manifest = chrome.runtime.getManifest();
const MOBILE_UPDATE_URL = 'https://s3.amazonaws.com/cdncliqz/update/android_browser/firefox@ghostery.com/update.json';
/**
 * Structure which holds parameters to be used throughout the code, a.k.a. global values.
 * Most of them (but not all) are const.
 * @memberOf  BackgroundClasses
 */
class Globals {
	constructor() {
		// environment variables
		this.DEBUG = manifest.debug || false;
		this.LOG = this.DEBUG && manifest.log;
		this.EXTENSION_NAME = manifest.name || 'Ghostery';
		this.EXTENSION_VERSION = manifest.version_name || manifest.version; // Firefox does not support "version_name"
		this.BROWSER_INFO = {
			displayName: '', name: '', token: '', version: '', os: 'other'
		};
		this.IS_CLIQZ = false; // TEMP !!((manifest.applications && manifest.applications.gecko && manifest.applications.gecko.update_url));

		this.IS_MOBILE_APP = manifest.applications && manifest.applications.gecko &&
			manifest.applications.gecko.update_url && manifest.applications.gecko.update_url.indexOf(MOBILE_UPDATE_URL) === 0;

		// flags
		this.JUST_INSTALLED = false;
		this.JUST_UPGRADED = false;
		this.JUST_UPGRADED_FROM_7 = false;
		this.JUST_UPGRADED_FROM_8_1 = false;
		this.HOTFIX = false;
		this.LET_REDIRECTS_THROUGH = false;
		this.C2P_LOADED = false;
		this.NOTIFICATIONS_LOADED = false;
		this.upgrade_alert_shown = false;

		// init
		this.INIT_COMPLETE = false;
		this.initProps = {};

		// domains
		this.GHOSTERY_DOMAIN = this.DEBUG ? 'ghosterystage' : 'ghostery';
		this.METRICS_SUB_DOMAIN = this.DEBUG ? 'staging-d' : 'd';
		this.CMP_SUB_DOMAIN = this.DEBUG ? 'staging-cmp-cdn' : 'cmp-cdn';
		this.CDN_SUB_DOMAIN = this.DEBUG ? 'staging-cdn' : 'cdn';
		this.APPS_SUB_DOMAIN = this.DEBUG ? 'staging-apps' : 'apps';
		this.GCACHE_SUB_DOMAIN = this.DEBUG ? 'staging-gcache' : 'gcache';
		this.AUTH_SERVER = `https://consumerapi.${this.GHOSTERY_DOMAIN}.com`;
		this.ACCOUNT_SERVER = `https://accountapi.${this.GHOSTERY_DOMAIN}.com`;

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
			'enable_ad_block',
			'enable_anti_tracking',
			'enable_autoupdate',
			'enable_click2play',
			'enable_click2play_social',
			'enable_human_web',
			'enable_metrics',
			'enable_offers',
			'enable_smart_block',
			'expand_all_trackers',
			'hide_alert_trusted',
			'ignore_first_party',
			'import_callout_dismissed',
			'is_expanded',
			'is_expert',
			'notify_library_updates',
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

		this.buildBrowserInfo();
	}

	/**
	 * Gets UA and Platform strings for current browser
	 * @return {Object}
	 */
	buildBrowserInfo() {
		/*
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
		*/
		this.BROWSER_INFO.os = 'android';

		if (chrome.cliqzAppConstants) {
			this.BROWSER_INFO.displayName = 'Ghostery';
			this.BROWSER_INFO.name = 'ghostery';
			this.BROWSER_INFO.token = 'gh';
			this.BROWSER_INFO.version = chrome.cliqzAppConstants.get('MOZ_APP_VERSION');
		} else {
			this.BROWSER_INFO.displayName = 'Firefox';
			this.BROWSER_INFO.name = 'firefox';
			this.BROWSER_INFO.token = 'ff';
			const versionMatch = /Firefox\/([0-9]+\.[0-9]+)/.exec(navigator.userAgent);
			if (versionMatch) {
				this.BROWSER_INFO.version = versionMatch[1]; // eslint-disable-line prefer-destructuring
			}
		}
	}
}

// return the class as a singleton
export default new Globals();
