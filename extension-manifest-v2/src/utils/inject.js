import tabInfo from '../classes/TabInfo';
import globals from '../classes/Globals';
import { log } from './common';

/**
 * Inject content scripts and CSS into a given tabID (top-level frame only).
 * Note: Chrome 61 blocks content scripts on the new tab page. Be
 * sure to check the current URL before calling this function, otherwise Chrome will throw
 * a permission error
 *
 * @memberOf BackgroundUtils
 *
 * @param  {number} tabId 		tab id
 * @param  {string} scriptfile	path to the js file
 * @param  {string} cssfile 	path to the css file
 * @param  {string} runAt		"document_start", "document_end", or "document_idle"
 * @return {Promise}			resolve yields no data, rejects yields error
 */
export function injectScript(tabId, scriptfile, cssfile, runAt) {
	return new Promise((resolve, reject) => {
		chrome.tabs.executeScript(tabId, { file: scriptfile, runAt }, () => {
			if (chrome.runtime.lastError) {
				log('injectScript error', chrome.runtime.lastError);
				reject(chrome.runtime.lastError);
				return;
			}

			if (cssfile) {
				chrome.tabs.insertCSS(tabId, { file: cssfile, runAt }, () => {
					if (chrome.runtime.lastError) {
						log('insertCSS error', chrome.runtime.lastError);
						reject(chrome.runtime.lastError);
						return;
					}
					resolve();
				});
			} else {
				resolve();
			}
		});
	});
}

/**
 * Inject dist/notifications.js content script.
 * @memberOf BackgroundUtils
 *
 * @param  {number} 	tab_id 			tab id
 * @param  {boolean} 	importExport 	true means that script is being injected
 * @return {Promise} 					resolve yields no data, rejects yields error
 */
// eslint-disable-next-line import/prefer-default-export
export function injectNotifications(tab_id, importExport = false) {
	if (globals.NOTIFICATIONS_LOADED) {
		// return true to allow sendMessage calls to continue
		return Promise.resolve(true);
	}
	const tab = tabInfo.getTabInfo(tab_id);
	// check for prefetching, non http/s pages and Chrome (< 75) or Edge new tab page
	if (tab && (tab.prefetched === true || !tab.protocol.startsWith('http') ||
		tab.path.includes('_/chrome/newtab') || tab.host.includes('ntp.msn.com') ||
		(!importExport && globals.EXCLUDES.includes(tab.host)))) {
		// return false to prevent sendMessage calls
		return Promise.resolve(false);
	}

	return injectScript(tab_id, 'dist/notifications.js', '', 'document_start').then(() => {
		globals.NOTIFICATIONS_LOADED = true;
		return true;
	}).catch((err) => {
		log('injectNotifications error', err);
		return false; // prevent sendMessage calls
	});
}
