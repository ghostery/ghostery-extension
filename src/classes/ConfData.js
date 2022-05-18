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

import { debounce } from 'underscore';
import globals from './Globals';
import { log, prefsGet, prefsSet } from '../utils/common';

const { IS_CLIQZ, BROWSER_INFO } = globals;
const IS_FIREFOX = (BROWSER_INFO.name === 'firefox');

/**
 * ConfData will keep values in memory, but eventually write through
 * to disk. This control how much time can elapse after the last
 * write before there will be an implicit flush.
 */
const CACHE_WRITES_DURATION_IN_MS = 20;

/**
 * Class for handling user configuration properties synchronously.
 *
 * NOTE: This class is not intended to be used directly.
 * The canonical way to access is by using the proxy class
 * defined in "./Conf.js"
 *
 * For persistence user settings are stored in Chrome Storage.
 * However, access to Storage is asynchronous. ConfData makes an
 * in-memory copy of Storage content on startup, which allows to
 * manipulate properties synchronously during the session. Changed
 * properties are ultimately saved back to Storage asynchronously.
 * @memberOf  BackgroundClasses
 */
class ConfData {
	#modifiedKeys;
	#markAsDirty;

	constructor() {
		// language does not get persisted
		this.language = ConfData._getDefaultLanguage();
		this.SYNC_SET = new Set(globals.SYNC_ARRAY);

		// We have to keep some state, but the class was written to be used
		// like a normal object. To avoid unintended side-effects, the new
		// properties should not be visible when iterating over the class.
		this.#modifiedKeys = new Set();
		this.#markAsDirty = debounce(this.flush.bind(this), CACHE_WRITES_DURATION_IN_MS);
	}

	setProperty(key, value) {
		if (this[key] !== value) {
			this[key] = value;
			this.#modifiedKeys.add(key);
			this.#markAsDirty();
		}
	}

	/**
	 * Reads all properties from Storage and sets them as
	 * prototyped properties of the ConfData object.
	 * This method is called once on startup.
	 */
	async init() {
		const data = { ...await prefsGet() };
		const nowTime = Date.now();

		const load = (name, defaultValue) => {
			const isPresent = data[name] !== null && data[name] !== undefined;
			this.setProperty(name, isPresent ? data[name] : defaultValue);
		};

		// Make sure that getBrowserInfo() has resolved before we set these properties
		await globals.BROWSER_INFO_READY;
		load('enable_metrics', BROWSER_INFO.name === 'ghostery_desktop');

		// simple props
		load('alert_bubble_pos', 'br');
		load('alert_bubble_timeout', 15);
		load('alert_expanded', false);
		load('bugs_last_checked', 0);
		load('bugs_last_updated', nowTime);
		load('cliqz_adb_mode', globals.DEFAULT_ADBLOCKER_SETTING);
		load('cliqz_legacy_opt_in', false);
		load('cliqz_import_state', 0);
		load('cmp_version', 0);
		load('current_theme', 'default');
		load('enable_ad_block', !IS_CLIQZ);
		load('enable_anti_tracking', !IS_CLIQZ);
		load('enable_autoupdate', true);
		load('enable_click2play', true);
		load('enable_click2play_social', true);
		load('enable_human_web', !IS_CLIQZ && !IS_FIREFOX);
		load('enable_abtests', true);
		load('enable_smart_block', true);
		load('expand_all_trackers', true);
		load('hide_alert_trusted', false);
		load('hub_layout', 'not_yet_set');
		load('ignore_first_party', true);
		load('import_callout_dismissed', true);
		load('install_random_number', 0);
		load('install_date', 0);
		load('is_expanded', false);
		load('is_expert', false);
		load('last_cmp_date', 0);
		load('notify_library_updates', false);
		load('notify_promotions', true);
		load('notify_upgrade_updates', true);
		load('paid_subscription', false);
		load('settings_last_imported', 0);
		load('settings_last_exported', 0);
		load('show_alert', false); // Tracker-Tally
		load('show_badge', true);
		load('show_cmp', true);
		load('show_tracker_urls', true);
		load('toggle_individual_trackers', true);
		load('setup_step', 7);
		load('setup_show_warning_override', true);
		load('setup_number', 0);
		load('setup_block', 1);
		load('setup_complete', false);
		load('tutorial_complete', false);
		load('enable_wtm_serp_report', true);

		// Complex props
		load('account', null);
		load('bugs', {});
		load('click2play', {});
		load('cmp_data', []);
		load('compatibility', {});
		load('metrics', {});
		load('new_app_ids', []);
		load('selected_app_ids', {});
		load('site_blacklist', []);
		load('site_specific_blocks', {});
		load('site_specific_unblocks', {});
		load('site_whitelist', []);
		load('cliqz_module_whitelist', {});
		load('surrogates', {});
		load('version_history', []);
	}

	/**
	 * Write pending changes to Storage.
	 */
	flush() {
		if (this.#modifiedKeys.size > 0) {
			const keys = [...this.#modifiedKeys];
			this.#modifiedKeys.clear();

			const changes = Object.fromEntries(keys.map(key => [key, this[key]]));
			log('Flushed config...', changes);
			prefsSet(changes).then(() => {
				log('Flushed config...DONE', changes);
			}).catch((err) => {
				// Retrying will most likely fail. To recover, remember the
				// old keys, so they are not lost in later write operations.
				log('Failed to write keys. Pushing failed updates back.', err);
				keys.forEach(key => this.#modifiedKeys.add(key));
			});
		}
	}

	static _getDefaultLanguage() {
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
