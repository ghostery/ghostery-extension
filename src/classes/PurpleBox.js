/**
 * Purplebox Class
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

/* eslint consistent-return: 0 */

import conf from './Conf';
import foundBugs from './FoundBugs';
import tabInfo from './TabInfo';
import Policy from './Policy';
import globals from './Globals';
import account from './Account';
import { log } from '../utils/common';
import { sendMessage, injectScript } from '../utils/utils';

const t = chrome.i18n.getMessage;
/**
 * Class for handling Ghostery Purple Box overlay.
 * @memberOf  BackgroundClasses
 * @todo  make it a Singelton
 */
class PurpleBox {
	constructor() {
		this.policy = new Policy();
		this.channelsSupported = (typeof chrome.runtime.onConnect === 'object');
		this.ports = new Map();
	}

	/**
	 * Build the purplebox.  Called from webNavigation.onNavigation handler for main frames
	 * only. In the event of prefetching, initialization occurs via
	 * 'tabs.onReplaced'. Triggers 'createBox' message back to purplebox.js
	 *
	 * @param  {number} tab_id		tab id
	 * @return {Promise}		resolves to true or false (success/failure)
	 */
	createBox(tab_id) {
		const tab = tabInfo.getTabInfo(tab_id);
		// Skip in the event of pause, trust, prefetching, newtab page, or Firefox about:pages
		if (!conf.show_alert ||
			globals.SESSION.paused_blocking ||
			(conf.hide_alert_trusted && !!this.policy.whitelisted(tab.url)) ||
			!tab || tab.purplebox || tab.path.includes('_/chrome/newtab') || tab.protocol === 'about' || globals.EXCLUDES.includes(tab.host)) {
			return Promise.resolve(false);
		}

		// Inject script cannot handle errors properly, but we call createBox after verifying that the tab is OK
		// So update purplebox status for this tab
		tabInfo.setTabInfo(tab_id, 'purplebox', true);

		this.createBoxParams = {
			conf: {
				alert_expanded: conf.alert_expanded,
				alert_bubble_pos: conf.alert_bubble_pos,
				alert_bubble_timeout: conf.alert_bubble_timeout,
			},
			translations: {
				looking: t('box_looking'),
				trackers: t('box_trackers'),
				box_warning_compatibility: t('box_warning_compatibility'),
				box_warning_slow: t('box_warning_slow'),
				box_warning_nonsecure: t('box_warning_nonsecure'),
				tracker: t('box_tracker'),
				hide: t('box_hide'),
				settings: t('box_settings'),
				options_expanded: t('box_options_expanded'),
				hide_expanded: t('box_hide_expanded'),
				settings_expanded: t('box_settings_expanded'),
				box_dismiss_0s: t('box_dismiss_0s'),
				box_dismiss_5s: t('box_dismiss_5s'),
				box_dismiss_15s: t('box_dismiss_15s'),
				box_dismiss_30s: t('box_dismiss_30s'),
				box_display_br: t('box_display_br'),
				box_display_tr: t('box_display_tr'),
				box_display_tl: t('box_display_tl'),
				box_display_bl: t('box_display_bl')
			}
		};
		// First start listenning to Connect signal coming from purple box
		if (this.channelsSupported) {
			if (this.ports.has(tab_id)) {
				this.ports.get(tab_id).disconnect();
				this.ports.delete(tab_id);
			}
			if (!this.connectListenerAdded) {
				this.connectListenerAdded = true;

				chrome.runtime.onConnect.addListener((port) => {
					if (port && port.name === 'purpleBoxPort' && port.sender && port.sender.tab && port.sender.tab.id) {
						const tabId = port.sender.tab.id;
						if (!this.ports.has(tabId)) {
							this.ports.set(tabId, port);
							this.ports.get(tabId).onMessage.addListener((message) => {
								if (message.name === 'purpleBoxLoaded') {
									this.ports.get(tabId).postMessage({ name: 'createBox', message: this.createBoxParams });
								} else if (message.name === 'onCreateBox') {
									this.updateBox(tabId);
								} else if (message.name === 'onDestroyBox') {
									this.destroyBox(tabId);
								} else if (message.name === 'updateAlertConf') {
									conf.alert_expanded = message.message.alert_expanded;
									conf.alert_bubble_pos = message.message.alert_bubble_pos;
									conf.alert_bubble_timeout = message.message.alert_bubble_timeout;
									// push new settings to API
									account.pushUserSettings();
								}
							});
						}
					}
				});
			}
		}
		return injectScript(tab_id, 'dist/purplebox.js', 'dist/css/purplebox_styles.css', 'document_start').then(() => {
			if (!this.channelsSupported) {
				sendMessage(tab_id, 'createBox', this.createBoxParams, (response) => {
					if (chrome.runtime.lastError) {
						log('createBox sendMessage error', chrome.runtime.lastError);
						return false;
					}
					// Run updateBox in case apps loaded before creating the box
					this.updateBox(tab_id);
					return true;
				});
			}
		}).catch((err) => {
			log('Purplebox injectScript error', err);
			return false;
		});
	}

	/**
	 * Update the purple box with new bugs. Called from 'processBug'
	 * @param  {number} 	tab_id		tab id
	 * @param  {number} 	app_id		tracker id
	 */
	updateBox(tab_id, app_id) {
		const tab = tabInfo.getTabInfo(tab_id);
		const apps = foundBugs.getApps(tab_id, true, tab.url, app_id);
		// prefetching and purplebox are already checked in background.js
		if (!apps || apps.length === 0 || globals.EXCLUDES.includes(tab.host)) {
			return false;
		}

		if (this.channelsSupported) {
			if (this.ports.has(tab_id)) {
				this.ports.get(tab_id).postMessage({
					name: 'updateBox',
					message: { apps }
				});
				return true;
			}
			log('updateBox failed. Port is null');
			return false;
		}
		sendMessage(tab_id, 'updateBox', {
			apps
		}, (response) => {
			if (chrome.runtime.lastError) {
				log('updateBox sendMessage failed', chrome.runtime.lastError, tab);
			}
		});
	}

	/**
	 * Purplebox destructor
	 * @param  {number} tab_id 	tab id
	 */
	destroyBox(tab_id) {
		const tab = tabInfo.getTabInfo(tab_id);
		if (!tab || globals.EXCLUDES.includes(tab.host)) {
			return;
		}
		if (this.channelsSupported) {
			if (this.ports.has(tab_id)) {
				this.ports.get(tab_id).disconnect();
				this.ports.delete(tab_id);
			}
		}
		tabInfo.setTabInfo(tab_id, 'purplebox', false);


		return true;
	}
}

export default PurpleBox;
