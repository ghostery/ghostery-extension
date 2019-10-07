/**
 * Configuration Data Class
 *
 * This module provides an interface for managing User Configuration
 * properties. All Conf properties (aka static class variables) are
 * attached to Conf.prototype. Method init is called only once on startup
 * or when extension is being installed/updated
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

/* eslint no-use-before-define: 0 */

import globals from './Globals';
import { prefsGet } from '../utils/common';

const { IS_CLIQZ, BROWSER_INFO } = globals;
const IS_FIREFOX = (BROWSER_INFO.name === 'firefox');
/**
 * Class for handling user configuration properties synchronously.
 *
 * For persistence user settings are stored in Chrome Storage.
 * However, access to Storage is asynchronous. ConfData makes an
 * in-memory copy of Storage content on startup, which allows to
 * manipulate properties synchronously during the session. Changed
 * properties are ultimately saved back to Storage asynchronously.
 * @memberOf  BackgroundClasses
 */
class ConfData {
	constructor() {
		// language does not get persisted
		this.language = this._getDefaultLanguage();
		this.SYNC_SET = new Set(globals.SYNC_ARRAY);
	}

	/**
	 * Reads all properties from Storage and sets them as
	 * prototyped properties of the ConfData object.
	 * This method is called once on startup.
	 */
	init() {
		return prefsGet().then((data) => {
			const nowTime = Number(new Date().getTime());
			const _initProperty = (name, value) => {
				if (data[name] === null || typeof (data[name]) === 'undefined') {
					data[name] = value;
					_setProp(name, value);
				}
				this[name] = data[name];
			};
			const _setProp = (name, value) => {
				if (!globals.INIT_COMPLETE) {
					globals.initProps[name] = value;
				}
			};

			// Transfer legacy previous version property to new name
			const { previous_version } = data;
			if (data.previous_version === null || typeof (data.previous_version) === 'undefined') {
				if (data.previousVersion) {
					data.previous_version = data.previousVersion;
					chrome.storage.local.remove('previousVersion');
					delete data.previousVersion;
				}
			}
			this.previous_version = data.previous_version || '';

			if (previous_version !== this.previous_version) {
				_setProp('previous_version', this.previous_version);
			}

			// Transfer legacy banner statuses which used to be objects
			const { reload_banner_status, trackers_banner_status } = data;
			if (reload_banner_status && typeof reload_banner_status === 'object') {
				this.reload_banner_status = !!reload_banner_status.show;
				_setProp('reload_banner_status', this.reload_banner_status);
			} else {
				_initProperty('reload_banner_status', true);
			}

			if (trackers_banner_status && typeof trackers_banner_status === 'object') {
				this.trackers_banner_status = !!trackers_banner_status.show;
				_setProp('trackers_banner_status', this.trackers_banner_status);
			} else {
				_initProperty('trackers_banner_status', true);
			}

			// simple props
			_initProperty('alert_bubble_pos', 'br');
			_initProperty('alert_bubble_timeout', 15);
			_initProperty('alert_expanded', false);
			_initProperty('block_by_default', false);
			_initProperty('bugs_last_checked', 0);
			_initProperty('bugs_last_updated', nowTime);
			_initProperty('cliqz_import_state', 0);
			_initProperty('cmp_version', 0);
			_initProperty('current_theme', 'default');
			_initProperty('enable_ad_block', !IS_CLIQZ);
			_initProperty('enable_anti_tracking', !IS_CLIQZ);
			_initProperty('enable_autoupdate', true);
			_initProperty('enable_click2play', true);
			_initProperty('enable_click2play_social', true);
			_initProperty('enable_human_web', !IS_CLIQZ && !IS_FIREFOX);
			_initProperty('enable_metrics', false);
			_initProperty('enable_offers', !IS_CLIQZ);
			_initProperty('enable_smart_block', true);
			_initProperty('expand_all_trackers', true);
			_initProperty('hide_alert_trusted', false);
			_initProperty('ignore_first_party', true);
			_initProperty('import_callout_dismissed', true);
			_initProperty('insights_promo_modal_last_seen', 0);
			_initProperty('install_random_number', 0);
			_initProperty('install_date', 0);
			_initProperty('is_expanded', false);
			_initProperty('is_expert', false);
			_initProperty('last_cmp_date', 0);
			_initProperty('notify_library_updates', false);
			_initProperty('notify_upgrade_updates', true);
			_initProperty('paid_subscription', false);
			_initProperty('plus_promo_modal_last_seen', 0);
			_initProperty('rewards_accepted', false);
			_initProperty('rewards_opted_in', false);
			_initProperty('settings_last_imported', 0);
			_initProperty('settings_last_exported', 0);
			_initProperty('show_alert', true);
			_initProperty('show_badge', true);
			_initProperty('show_cmp', true);
			_initProperty('show_tracker_urls', true);
			_initProperty('toggle_individual_trackers', true);
			_initProperty('setup_step', 7);
			_initProperty('setup_show_warning_override', true);
			_initProperty('setup_number', 0);
			_initProperty('setup_block', 1);
			_initProperty('setup_complete', false);
			_initProperty('tutorial_complete', false);

			// Complex props
			_initProperty('account', null);
			_initProperty('bugs', {});
			_initProperty('click2play', {});
			_initProperty('cmp_data', []);
			_initProperty('compatibility', {});
			_initProperty('metrics', {});
			_initProperty('new_app_ids', []);
			_initProperty('selected_app_ids', {});
			_initProperty('site_blacklist', []);
			_initProperty('site_specific_blocks', {});
			_initProperty('site_specific_unblocks', {});
			_initProperty('site_whitelist', []);
			_initProperty('cliqz_module_whitelist', {});
			_initProperty('surrogates', {});
			_initProperty('version_history', []);
		});
	}

	_getDefaultLanguage() {
		const SUPPORTED_LANGUAGES = {
			de: 'Deutsch',
			en: 'English',
			es: 'español',
			fr: 'Français',
			hu: 'magyar',
			it: 'Italiano',
			ja: '日本語',
			ko: '한국어',
			nl: 'Nederlands',
			pl: 'Polski',
			pt_BR: 'português',
			ru: 'Русский',
			zh_CN: '简体中文',
			zh_TW: '繁體中文'
		};

		let lang = window.navigator.language.replace('-', '_');

		if (SUPPORTED_LANGUAGES.hasOwnProperty(lang)) {
			return lang;
		}

		lang = lang.slice(0, 2);
		if (SUPPORTED_LANGUAGES.hasOwnProperty(lang)) {
			return lang;
		}

		return 'en';
	}
}

// return the class as a singleton
export default new ConfData();
