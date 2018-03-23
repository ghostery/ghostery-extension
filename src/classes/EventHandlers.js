/**
 * Event Handler Class
 *
 * Callback functions for event listeners attached to
 * chrome.webNavigation, chrome.webRequest and  chrome.tabs
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

import _ from 'underscore';
import bugDb from './BugDb';
import Button from './BrowserButton';
import c2pDb from './Click2PlayDb';
import cmp from './CMP';
import conf from './Conf';
import foundBugs from './FoundBugs';
import globals from './Globals';
import latency from './Latency';
import Policy, { BLOCK_REASON_SS_UNBLOCKED } from './Policy';
import PolicySmartBlock from './PolicySmartBlock';
import PurpleBox from './PurpleBox';
import surrogatedb from './SurrogateDb';
import compDb from './CompatibilityDb';
import tabInfo from './TabInfo';
import { buildC2P, buildRedirectC2P } from '../utils/click2play';
import { log } from '../utils/common';
import { isBug } from '../utils/matcher';
import * as utils from '../utils/utils';

const button = new Button();
const RequestsMap = new Map();
/**
 * This class is a collection of handlers for
 * webNavigation, webRequest and tabs events.
 * @memberOf  BackgroundClasses
 */
class EventHandlers {
	constructor() {
		this.button = new Button();
		this.policy = new Policy();
		this.policySmartBlock = new PolicySmartBlock();
		this.purplebox = new PurpleBox();
	}

	/**
	 * Handler for webNavigation.onBeforeNavigate event.
	 * Called when a navigation is about to occur.
	 *
	 * @param  {Object} details 	event data
	 */
	onBeforeNavigate(details) {
		const { tabId, frameId, url } = details;

		// frameId === 0 indicates the navigation event ocurred in the content window, not a subframe
		if (frameId === 0) {
			log(`❤ ❤ ❤ Tab ${tabId} navigating to ${url} ❤ ❤ ❤`);

			RequestsMap.clear();
			this._clearTabData(tabId);
			this._resetNotifications();

			// initialize tabInfo, foundBugs objects for this tab
			tabInfo.create(tabId, url);
			foundBugs.update(tabId);
			button.update(tabId);

			// Workaround for foundBugs/tabInfo memory leak when the user triggers
			// prefetching/prerendering but never loads the page. Wait two minutes
			// and check whether the tab doesn't exist.
			let error;
			setTimeout(() => {
				utils.getTab(tabId, null, error = () => {
					log('Clearing orphan tab data for tab', tabId);
					this._clearTabData(tabId);
					this._resetNotifications();
				});
			}, 120000);
		}
	}

	/**
	 * Handler for webNavigation.onCommitted event.
	 * Called when a navigation is committed.
	 *
	 * @param  {Object} details 	event data
	 */
	onCommitted(details) {
		const {
			tabId, frameId, url, transitionType, transitionQualifiers
		} = details;

		// frameId === 0 indicates the navigation event ocurred in the content window, not a subframe
		if (frameId === 0) {
			// update reload info before creating/clearing tab info
			if (transitionType === 'reload' && !transitionQualifiers.includes('forward_back')) {
				tabInfo.setTabInfo(tabId, 'numOfReloads', tabInfo.getTabInfo(tabId, 'numOfReloads') + 1);
			} else if (transitionType !== 'auto_subframe' && transitionType !== 'manual_subframe') {
				tabInfo.setTabInfo(tabId, 'reloaded', false);
				tabInfo.setTabInfo(tabId, 'numOfReloads', 0);
			}

			// Set incognito and whether this tab was prefetched
			utils.getTab(tabId, (tab) => {
				if (tab) {
					tabInfo.setTabInfo(tabId, 'incognito', tab.incognito);
					// purplebox.createBox() will first check to make sure this is a valid tab
					this._createBox(tabId);
				}
			}, () => {
				// prefetched tabs will return an error from utils.getTab
				utils.getActiveTab((tab) => {
					if (tab) {
						tabInfo.setTabInfo(tabId, 'incognito', tab.incognito);
					}
					tabInfo.setTabInfo(tabId, 'prefetched', true);
				});
			});
		}
	}

	/**
	 * Handler for webNavigation.onDOMContentLoaded event.
	 * Called when the page's DOM is fully constructed,
	 * but the referenced resources may not finish loading
	 *
	 * @param  {Object} details 	event data
	 */
	onDOMContentLoaded(details) {
		const tab_id = details.tabId;

		if (!utils.isValidTopLevelNavigation(details)) {
			return;
		}

		// show upgrade notifications
		utils.getActiveTab((tab) => {
			if (!tab || tab.id !== tab_id || tab.incognito) {
				return;
			}
			const alert_messages = [
				'notification_library_update',
				'notification_library_update_link',
				'notification_upgrade',
				'notification_upgrade_link',
				'notification_upgrade_title_v8',
				'notification_upgrade_v8',
				'notification_upgrade_link_v8'
			];

			// If we have offers, we first look for a Cliqz offer with specified offer_urls,
			// one of which matches to details.url. If none of those available
			// we look for a cliqz offer which does not have urls specified (meaning good for any site)
			// All Cliqz offers have Dismiss === 1, so the found one is injected and removed.
			// Lastly we look for non-cliqz offers (classic CMPs)
			if (cmp.CMP_DATA.length !== 0) {
				const CMPS = cmp.CMP_DATA;
				const numOffers = CMPS.length;
				let cliqzOffer;
				let nonCliqzOffer;
				for (let i = 0; i < numOffers; i++) {
					const CMP = CMPS[i];
					if (utils.isCliqzOffer(CMP)) {
						// If offer has urls specified and none of them matches current url
						// this offer should not be displayed
						const urls = CMP.data.offer_info.offer_urls;
						if (urls instanceof Array) {
							const numUrls = urls.length;
							for (let j = 0; j < numUrls; j++) {
								if (urls[j] === details.url) {
									cliqzOffer = CMP;
									cliqzOffer.index = i;
									break;
								}
							}
							if (cliqzOffer) {
								break;
							}
						} else if (!cliqzOffer) { // the earliest Cliqz offer without urls specified
							cliqzOffer = CMP;
							cliqzOffer.index = i;
						}
					} else if (conf.show_cmp) {
						if (!nonCliqzOffer) {
							nonCliqzOffer = CMP;
							nonCliqzOffer.index = i;
						}
					}
				}

				let finalOffer = cliqzOffer || (nonCliqzOffer || undefined);

				if (!finalOffer) {
					return;
				}

				const { index } = finalOffer;
				finalOffer = cmp.CMP_DATA[index];

				utils.injectNotifications(tab.id).then((result) => {
					if (result) {
						utils.sendMessage(tab_id, 'showCMPMessage', {
							data: finalOffer
						}, () => {
							// decrease dismiss count
							finalOffer.Dismiss--;
							if (finalOffer.Dismiss <= 0) {
								cmp.CMP_DATA.splice(index, 1);
							}
						});
					}
				});
			} else if (globals.JUST_UPGRADED && !globals.HOTFIX && !globals.upgrade_alert_shown && conf.notify_upgrade_updates) {
				utils.injectNotifications(tab.id).then((result) => {
					if (result) {
						utils.sendMessage(
							tab_id, 'showUpgradeAlert', {
								translations: _.object(_.map(alert_messages, key => [key, chrome.i18n.getMessage(key)])),
								language: conf.language,
								major_upgrade: globals.JUST_UPGRADED_FROM_7
							},
							() => {
							// not all tabs will have content scripts loaded, so better wait for confirmation first
							// TODO no longer necessary?
								globals.upgrade_alert_shown = true;
							}
						);
					}
				});
			} else if (bugDb.db.JUST_UPDATED_WITH_NEW_TRACKERS) {
				if (conf.notify_library_updates) {
					utils.injectNotifications(tab.id).then((result) => {
						if (result) {
							utils.sendMessage(
								tab_id, 'showLibraryUpdateAlert', {
									translations: _.object(_.map(alert_messages, key => [key, chrome.i18n.getMessage(key)])),
									language: conf.language
								},
								() => {
									bugDb.db.JUST_UPDATED_WITH_NEW_TRACKERS = false;
								}
							);
						}
					});
				} else {
					bugDb.db.JUST_UPDATED_WITH_NEW_TRACKERS = false;
				}
			}
		});
	}

	/**
	 * Handler for webNavigation.onCompleted event.
	 * Called when a document, including the resources it refers to,
	 * is completely loaded and initialized
	 *
	 * @param  {Object} details 	event data
	 */
	onNavigationCompleted(details) {
		if (!utils.isValidTopLevelNavigation(details)) {
			return;
		}

		RequestsMap.clear();

		// Code below executes for top level frame only
		log(`foundBugs: ${foundBugs.getAppsCount(details.tabId)}, tab_id: ${details.tabId}`);

		// inject page_performance script to display page latency on Summary view
		if (this._isValidUrl(utils.processUrl(details.url))) {
			utils.injectScript(details.tabId, 'dist/page_performance.js', '', 'document_idle').catch((err) => {
				log('onNavigationCompleted injectScript error', err);
			});
		}
		// The problem is that requests may continue well after onNavigationCompleted
		// This breaks allow once for C2P, as it clears too early
		setTimeout(() => {
			this._eventReset(details.tabId);
		}, 2000);
	}

	/**
	 * Handler for webNavigation.onErrorOccurred event.
	 * Called when navigation fails on any of its steps.
	 *
	 * @param  {Object} details 	event data
	 */
	onNavigationErrorOccurred(details) {
		const tab_id = details.tabId;

		if (!utils.isValidTopLevelNavigation(details)) {
			// handle navigation to Web Store from some other page (not from blank page/NTP)
			// TODO what other webRequest-restricted pages are out there?
			if (details.url.startsWith('https://chrome.google.com/webstore/')) {
				this._clearTabData(tab_id);
				this._resetNotifications();
			}

			return;
		}

		this._eventReset(tab_id);
	}
	/**
	 * Handler for webRequest.onBeforeRequest event
	 * Called when a request is about to occur
	 *
	 * TODOS:
	 * 		+ THIS HAS TO BE SUPER FAST
	 * 		+ Speed this up by making it asynchronous when blocking is disabled?
	 * 		+ Also speed it up for blocking-whitelisted pages (by delaying isBug scanning)?
	 *
	 * @param  {Object} details 	event data
	 * @return {Object}             optionaly return {cancel: true} to force dropping the request
	 */
	onBeforeRequest(details) {
		const tab_id = details.tabId;
		const request_id = details.requestId;

		// -1 indicates the request isn't related to a tab
		if (tab_id <= 0) {
			return { cancel: false };
		}

		if (!tabInfo.getTabInfo(tab_id)) {
			log(`tabInfo not found for tab ${tab_id}, initializing...`);

			// create new tabInfo entry
			tabInfo.create(tab_id);

			// get tab data from browser and update the new tabInfo entry
			utils.getTab(tab_id, (tab) => {
				const ti = tabInfo.getTabInfo(tab_id);
				if (ti && ti.partialScan) {
					tabInfo.setTabInfo(tab_id, 'url', tab.url);
					tabInfo.setTabInfo(tab_id, 'incognito', tab.incognito);
				}
			});
		}

		if (!this._checkRedirect(details.type, request_id)) {
			return { cancel: false };
		}

		const page_url = tabInfo.getTabInfo(tab_id, 'url');
		const page_host = tabInfo.getTabInfo(tab_id, 'host');
		const page_protocol = tabInfo.getTabInfo(tab_id, 'protocol');
		const from_redirect = globals.REDIRECT_MAP.has(request_id);
		const bug_id = (page_url ? isBug(details.url, page_url) : isBug(details.url));
		const processed = utils.processUrl(details.url);

		/* ** SMART BLOCKING - Privacy ** */
		// block HTTP request on HTTPS page
		if (this.policySmartBlock.isInsecureRequest(tab_id, page_protocol, processed.protocol)) {
			return this._blockHelper(details, tab_id, null, null, request_id, from_redirect, true);
		}

		// allow if not a tracker
		if (!bug_id) {
			return { cancel: false };
		}

		/* ** SMART BLOCKING - Breakage ** */
		// allow first party trackers
		if (this.policySmartBlock.isFirstPartyRequest(tab_id, page_host, processed.host)) {
			return { cancel: false };
		}

		const app_id = bugDb.db.bugs[bug_id].aid;
		const cat_id = bugDb.db.apps[app_id].cat;
		const incognito = tabInfo.getTabInfo(tab_id, 'incognito');
		const tab_host = tabInfo.getTabInfo(tab_id, 'host');
		const fromRedirect = globals.REDIRECT_MAP.has(request_id);
		const { block, reason } = this._checkBlocking(app_id, cat_id, tab_id, tab_host, page_url, request_id);
		if (!block && reason === BLOCK_REASON_SS_UNBLOCKED) {
			// The way to pass this flag to Cliqz handlers
			details.ghosteryWhitelisted = true;
		}
		// Latency initialization needs to be synchronous to avoid race condition with onCompleted, etc.
		// TODO can URLs repeat within a redirect chain? what are the cases of repeating URLs (trackers only, ...)?
		if (block === false) {
			// Store latency data keyed by URL so that we don't use the wrong latencies in a redirect chain.
			latency.latencies[request_id] = latency.latencies[request_id] || {};

			latency.latencies[request_id][details.url] = {
				start_time: Math.round(details.timeStamp),
				bug_id,
				// these could be undefined
				page_url,
				incognito
			};
		}

		// process the tracker asynchronously
		// very important to block request processing as little as necessary
		setTimeout(() => {
			this._processBug({
				bug_id,
				app_id,
				type: details.type,
				url: details.url,
				block,
				tab_id,
				from_frame: details.parentFrameId !== -1
			});
		}, 1);

		if (block) {
			if (this.policySmartBlock.shouldUnblock(app_id, cat_id, tab_id, page_url, details.type)) {
				return { cancel: false };
			}
			return this._blockHelper(details, tab_id, app_id, bug_id, request_id, fromRedirect);
		}
		if (this.policySmartBlock.shouldBlock(app_id, cat_id, tab_id, page_url, details.type, details.timeStamp)) {
			return this._blockHelper(details, tab_id, app_id, bug_id, request_id);
		}
		return { cancel: false };
	}

	/**
	 * Handler for webRequest.onBeforeSendHeaders event.
	 * Called each time that an HTTP(S) request is about to send headers
	 *
	 * @param  {Object} details event data
	 * @return {Object} 		optionally return headers to send
	 */
	onBeforeSendHeaders(details) {
		for (let i = 0; i < details.requestHeaders.length; ++i) {
			// Fetch requests in Firefox web-extension has a flaw. They attach
			// origin: moz-extension//ID , which is specific to a user.
			// We need to remove that header from the calls originating from within the extension.
			// We also strip cookies from specific Ghostery domains
			if ((details.requestHeaders[i].name.toLowerCase() === 'origin' &&
				details.requestHeaders[i].value.startsWith('moz-extension://')) ||
				(details.requestHeaders[i].name.toLowerCase() === 'cookie')) {
				details.requestHeaders[i].value = '';
			}
		}

		return { requestHeaders: details.requestHeaders };
	}

	/**
	 * Handler for webRequest.onHeadersReceived event
	 * Called each time that an HTTP(S) response header is received.
	 *
	 * @param  {Object} details 	event data
	 */
	onHeadersReceived(details) {
		// Skip content-length collection if it's a 3XX (redirect)
		if (details.statusCode >> 8 === 1) { }  // eslint-disable-line
	}

	/**
	 * Handler for webRequest.onBeforeRedirect event.
	 * Fires when a redirect is about to be executed. Calculate latency,
	 * send GR if enabled and increase requests count.
	 *
	 * @param  {Object} details 	event data
	 */
	onBeforeRedirect(details) {
		if (details.type === 'main_frame') {
			tabInfo.setTabInfo(details.tabId, 'url', details.redirectUrl);
			globals.REDIRECT_MAP.set(details.requestId, { url: details.url, redirectUrl: details.redirectUrl });
		}

		const appWithLatencyId = latency.logLatency(details);
		if (appWithLatencyId) {
			this.purplebox.updateBox(details.tabId, appWithLatencyId);
		}
	}

	/**
	 * Handler for webRequest.onCompleted event.
	 * Called when a request has been processed successfully. Calculate latency
	 * and send GR if enabled.
	 *
	 * @param  {Object} details 	event data
	 */
	onRequestCompleted(details) {
		if (!details || details.tabId <= 0) {
			return;
		}
		this._clearRedirects(details.requestId);

		if (details.type !== 'main_frame') {
			const appWithLatencyId = latency.logLatency(details);

			if (appWithLatencyId) {
				this.purplebox.updateBox(details.tabId, appWithLatencyId);
			}
		}
	}

	/**
	 * Handler for webRequest.onErrorOccurred event.
	 * Called when a request could not be processed successfully.
	 * Set latency = -1 and send GR if enabled.
	 *
	 * @param  {Object} details 	event data
	 */
	onRequestErrorOccurred(details) {
		latency.logLatency(details);
		this._clearRedirects(details.requestId);
	}

	/**
	 * Handler for tabs.onCreated event.
	 * Called when a new tab is created by user or internally
	 *
	 * @param  {Object} tab 	 Details of the tab that was created
	 */
	onTabCreated(tab) {}

	/**
	 * Handler for tabs.onActivated event.
	 * Called when the active tab in a window changes.
	 *
	 * @param  {Object} activeInfo	tab data
	 */
	onTabActivated(activeInfo) {
		button.update(activeInfo.tabId);
		this._resetNotifications();
	}

	/**
	 * Handler for tabs.onReplaced event.
	 * Called when a tab is replaced with another tab due to prerendering.
	 *
	 * @param  {number} addedTabId		added tab id
	 * @param  {number} removedTabId   removed tab id
	 */
	onTabReplaced(addedTabId, removedTabId) {
		const prefetched = tabInfo.getTabInfo(addedTabId, 'prefetched');
		// If the new tab was previously prefetched, update it's status here
		if (prefetched) {
			tabInfo.setTabInfo(addedTabId, 'prefetched', false);
			// create the purplebox/bluebox here, since it would have failed during onNavigation()
			this._createBox(addedTabId);
		} else {
			foundBugs.update(addedTabId);
			button.update(addedTabId);
		}
		log('chrome.tabs.onReplaced', tabInfo.getTabInfo(addedTabId));
	}

	/**
	 * Handler for tabs.onRemoved event.
	 * Called when a tab is closed. Clear tab data
	 *
	 * @param  {number} tab_id		tab id
	 */
	onTabRemoved(tab_id) {
		this._clearTabData(tab_id);
		this._resetNotifications();
	}

	/**
	 * Takes bug data from onBeforeRequest and updates the purplebox
	 * and ghostery icon, among other things
	 *
	 * @private
	 *
	 * @param  {Object} details 	bug details
	 */
	_processBug(details) {
		const {
			bug_id, app_id, type, url, block, tab_id
		} = details;
		const tab = tabInfo.getTabInfo(tab_id);

		let num_apps_old;

		log((block ? 'Blocked' : 'Found'), type, url);
		log(`^^^ Pattern ID ${bug_id} on tab ID ${tab_id}`);

		if (conf.show_alert) {
			num_apps_old = foundBugs.getAppsCount(tab_id);
		}

		foundBugs.update(tab_id, bug_id, url, block, type);

		button.update(details.tab_id);

		if (block && (conf.enable_click2play || conf.enable_click2playSocial)) {
			buildC2P(details, app_id);
		}

		// Note: tab.purplebox handles a race condition where this function is sometimes called before onNavigation()
		if (conf.show_alert && tab && !tab.prefetched && tab.purplebox) {
			if (foundBugs.getAppsCount(details.tab_id) > num_apps_old || c2pDb.allowedOnce(details.tab_id, app_id)) {
				this.purplebox.updateBox(details.tab_id, app_id);
			}
		}
	}

	/**
	 * Helper function that returns the appropriate object to block several
	 * types of requests coming through `chrome.webRequest.onBeforeRequest`
	 *
	 * @private
	 *
	 * @param  {Object} details 	event data
	 * @param  {number} tabId 		tab id
	 * @param  {number} appId 		app id
	 * @param  {number} bugId 		bug id
	 * @param  {number} requestId 	request id
	 * @param  {boolean} fromRedirect
	 * @return {string|boolean}
	 */
	_blockHelper(details, tabId, appId, bugId, requestId, fromRedirect, upgradeInsecure) {
		if (upgradeInsecure) {
			// attempt to redirect request to HTTPS. NOTE: Redirects from URLs
			// with ws:// and wss:// schemes are ignored.
			// keep track of insecure redirects to avoid redirect loops
			const ir = tabInfo.getTabInfo(tabId, 'insecureRedirects');
			if (ir.indexOf(requestId) >= 0) {
				return { cancel: true };
			}
			ir.push(requestId);
			tabInfo.setTabInfo(tabId, 'insecureRedirects', ir);
			return {
				redirectUrl: details.url.replace(/^http:/, 'https:')
			};
		} else if (details.type === 'sub_frame') {
			return {
				redirectUrl: 'about:blank'
			};
		} else if (details.type === 'image') {
			return {
				// send PNG (and not GIF) to avoid conflicts with Adblock Plus
				redirectUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
			};
		} else if (details.type === 'script' && bugId) {
			let code = '';
			if (appId === 2575) { // Hubspot
				code = this._getHubspotFormSurrogate(details.url);
			} else {
				const ti = tabInfo.getTabInfo(tabId);
				const surrogates = surrogatedb.getForTracker(details.url, appId, bugId, ti.host);

				if (surrogates.length > 0) {
					code = _.reduce(surrogates, (memo, s) => {
						memo += s.code; // eslint-disable-line no-param-reassign
						return memo;
					}, '');
				}
			}

			if (code) {
				const dataUrl = `data:application/javascript;base64,${btoa(code)}`;
				log('NEW SURROGATE', appId);
				return {
					redirectUrl: dataUrl
				};
			}
		} else if (fromRedirect) {
			const url = buildRedirectC2P(requestId, globals.REDIRECT_MAP.get(requestId), appId);
			setTimeout(() => {
				chrome.tabs.update(details.tabId, { url });
			}, 0);
		}

		return {
			// If true, the request is cancelled. This prevents the request from being sent.
			cancel: true
		};
	}

	/**
	 * Checks to see if the URL is valid
	 *
	 * @private
	 *
	 * @param  {Object}  parsedURL
	 * @return {Boolean}
	 */
	_isValidUrl(parsedURL) {
		if (parsedURL.protocol.startsWith('http') && parsedURL.host.includes('.') && /[A-Za-z]/.test(parsedURL.host)) {
			return true;
		}

		return false;
	}

	/**
	 * Creates surrogate for hubspot form
	 *
	 * @private
	 *
	 * @param  {string} form 	request url
	 * @return {string} 		surrogate code
	 */
	_getHubspotFormSurrogate(url) {
		// Hubspot url has a fixed format
		// https://forms.hubspot.com/embed/v3/form/532040/95b5de3a-6d4a-4729-bebf-07c41268d773?callback=hs_reqwest_0&hutk=941df50e9277ee76755310cd78647a08
		// The following three parameters are privacy-safe:
		// 532040 - parner id
		// 95b5de3a-6d4a-4729-bebf-07c41268d773 - form id on the page
		// hs_reqwest_0 - function which will be called on the client after the request
		//
		// hutk=941df50e9277ee76755310cd78647a08 -is user-specific (same every session)
		const tokens = url.substr(8).split(/\/|\&|\?|\#|\=/ig);

		return `${tokens[7]}({"form":{"portalId":${tokens[4]},"guid": "${tokens[5]}","cssClass":"hs-form stacked","formFieldGroups":[{"fields":[{}]}],"metaData":[]},"properties":{}})`;
	}

	/**
	 * Clear tab data for a given tab_id
	 *
	 * @private
	 *
	 * @param  {number} tab_id
	 */
	_clearTabData(tab_id) {
		foundBugs.clear(tab_id);
		tabInfo.clear(tab_id);
	}

	/**
	 * Clear the REDIRECT_MAP for a particular requestId
	 *
	 * @private
	 *
	 * @param  {number} requestId
	 */
	_clearRedirects(requestId) {
		globals.REDIRECT_MAP.delete(requestId);
		globals.LET_REDIRECTS_THROUGH = false;
	}

	/**
	 * Check for redirects in onBeforeRequest
	 *
	 * @private
	 *
	 * @param  {string} type 			type of request
	 * @param  {number}	request_id		request id
	 * @return {boolean}
	 */
	_checkRedirect(type, request_id) {
		const fromRedirect = globals.REDIRECT_MAP.has(request_id);
		// if the request is part of the main_frame and not a redirect, we don't proceed
		if (type === 'main_frame' && !fromRedirect) {
			return false;
		}

		return true;
	}

	/**
	 * Determine whether this request should be blocked
	 *
	 * @private
	 *
	 * @param  {number} 	app_id			tracker id
	 * @param  {number} 	cat_id			tracker category id
	 * @param  {number} 	tab_id			tab id
	 * @param  {string} 	tab_host		tab url host
	 * @param  {string} 	page_url		full tab url
	 * @param  {number} 	request_id		request id
	 * @return {Object}		{block, ss_unblock}
	 */
	_checkBlocking(app_id, cat_id, tab_id, tab_host, page_url, request_id) {
		const fromRedirect = globals.REDIRECT_MAP.has(request_id);
		let block;

		// If we let page-level c2p trackers through, we don't want to block it
		// along with all subsequent top-level redirects.
		if (fromRedirect && globals.LET_REDIRECTS_THROUGH) {
			block = { block: false };
		} else {
			block = this.policy.shouldBlock(app_id, cat_id, tab_id, tab_host, page_url);
		}

		return block;
	}

	/**
	 * Utility method to reset data during/after event
	 *
	 * @private
	 *
	 * @param  {number}	tab_id		tab id
	 */
	_eventReset(tab_id) {
		c2pDb.reset(tab_id);
		globals.REDIRECT_MAP.clear();
		globals.LET_REDIRECTS_THROUGH = false;
	}

	/**
	 * Utility method to create purple box
	 *
	 * @private
	 *
	 * @param  {number} tab_id		tab id
	 */
	_createBox(tab_id) {
		this.purplebox.createBox(tab_id).then((result) => {
			foundBugs.update(tab_id);
			button.update(tab_id);
		}).catch((err) => {
			log('Purplebox creation failed:', err);
		});
	}

	/**
	 * Utility method to reset notification flags
	 *
	 * @private
	 *
	 */
	_resetNotifications() {
		globals.C2P_LOADED = globals.NOTIFICATIONS_LOADED = false; // eslint-disable-line no-multi-assign
	}
}

export default EventHandlers;
