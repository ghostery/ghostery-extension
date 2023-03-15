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

import { getBrowserInfo } from '@ghostery/libs';

const manifest = chrome.runtime.getManifest();

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
		this.BROWSER_INFO_READY = getBrowserInfo().then((info) => {
			this.BROWSER_INFO = info;
		});

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
		this.SIGNON_BASE_URL = `https://signon.${this.GHOSTERY_ROOT_DOMAIN}`;
		this.GLOWSTERY_ROOT_DOMAIN = `${this.DEBUG ? 'staging.glowstery' : 'glowstery'}.com`;
		this.GLOWSTERY_BASE_URL = `https://${this.GLOWSTERY_ROOT_DOMAIN}`;
		this.METRICS_BASE_URL = `https://${this.DEBUG ? 'staging-d' : 'd'}.ghostery.com`;
		this.CMP_BASE_URL = `https://${this.DEBUG ? 'staging-cmp-cdn' : 'cmp-cdn'}.ghostery.com`;
		this.CDN_BASE_URL = `https://${this.DEBUG ? 'staging-cdn' : 'cdn'}.ghostery.com`;
		this.WTM_BASE_URL = 'https://www.whotracks.me';
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
		this.DAWN_NEWTAB_PRODUCTION_ID = 'newtab@ghostery.com';
		this.GHOSTERY_SEARCH_CHROME_PRODUCTION_ID = 'nomidcdbhopffbhbpfnnlgnfimhgdman';
		this.GHOSTERY_SEARCH_FIREFOX_PRODUCTION_ID = 'search@ghostery.com';

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
			'cliqz_module_whitelist',
			'current_theme',
			'enable_ad_block',
			'enable_anti_tracking',
			'enable_autoconsent',
			'enable_autoupdate',
			'enable_click2play',
			'enable_click2play_social',
			'enable_wtm_serp_report',
			'enable_metrics',
			'enable_abtests',
			'expand_all_trackers',
			'hide_alert_trusted',
			'ignore_first_party',
			'import_callout_dismissed',
			'is_expanded',
			'is_expert',
			'notify_promotions',
			'notify_upgrade_updates',
			'reload_banner_status',
			'selected_app_ids',
			'show_alert',
			'show_badge',
			'show_cmp',
			'show_redirect_tracking_dialogs',
			'show_tracker_urls',
			'site_specific_blocks',
			'site_specific_unblocks',
			'toggle_individual_trackers',
			'trackers_banner_status',
		];

		this.ONBOARDED_FEATURES = [
			'enable_ad_block',
			'enable_autoconsent',
			'enable_smart_block',
			'enable_human_web',
			'enable_anti_tracking',
		];

		// Relevant for a fresh installation: all trackers from the
		// following categories will be blocked by default.
		this.CATEGORIES_BLOCKED_BY_DEFAULT = [
			'advertising',
			'pornvertising',
			'site_analytics',
			'email',
		];

		this.SESSION = {
			paused_blocking: false,
			paused_blocking_timeout: 0,
			abtests: {},
			cmp_data: {}
		};
	}
}

// return the class as a singleton
export default new Globals();
