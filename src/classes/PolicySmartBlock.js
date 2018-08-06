/**
 * Smart Blocking Policy Class
 *
 * Handles policy for Smart Blocking
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

import conf from './Conf';
import tabInfo from './TabInfo';
import compDb from './CompatibilityDb';
import globals from './Globals';
import Policy from './Policy';
/**
 * Class for handling Smart Blocking site policy.
 * @memberOf  BackgroundClasses
 * @todo  make it a Singelton
 */
class PolicySmartBlock {
	constructor() {
		this.policy = new Policy();
		this.allowedCategoriesList = [
			'essential',
			'audio_video_player',
			'comments',
		];
		this.allowedTypesList = [
			'stylesheet',
			'image',
			'font',
		];
	}
	/**
	 * Determine if the tracker should be unblocked on a particular site to prevent site breaking.
	 * @param  {string} appId       tracker id
	 * @param  {string} catId       category id
	 * @param  {number} tabId       tab id
	 * @param  {string} pageURL     tab url
	 * @param  {string} requestType type of the request
	 * @return {boolean} 			true if one of the conditions is met, false they are not
	 *                           	applicable to this url, or none are met.
	 */
	shouldUnblock(appId, catId, tabId, pageURL, requestType) {
		if (!this.shouldCheck(tabId, appId)) { return false; }

		let reason;

		if (this._appHasKnownIssue(tabId, appId, pageURL)) {
			reason = 'hasIssue'; 		// allow if tracker is in compatibility list
		} else if (this._allowedCategories(tabId, appId, catId)) {
			reason = 'allowedCategory'; // allow if tracker is in breaking category
		} else if (this._allowedTypes(tabId, appId, requestType)) {
			reason = 'allowedType'; 	// allow if tracker is in breaking type
		} else if (this._pageWasReloaded(tabId, appId)) {
			reason = 'pageReloaded'; 	// allow if page has been reloaded recently
		}

		if (reason) {
			tabInfo.setTabSmartBlockAppInfo(tabId, appId, reason, false);
			return true;
		}

		return false;
	}
	/**
	 * Determine if the tracker should be blocked on a particular site to prevent site breaking.
	 * @param  {string} appId       tracker id
	 * @param  {string} catId       category id
	 * @param  {number} tabId       tab id
	 * @param  {string} pageURL     tab url
	 * @param  {string} requestType type of the request
	 * @return {boolean}         	true if one of the conditions is met, false they are not
	 *                              applicable to this url, or none are met.
	 */
	shouldBlock(appId, catId, tabId, pageURL, requestType, requestTimestamp) {
		if (!this.shouldCheck(tabId, appId)) { return false; }

		let reason;

		// block if it's been more than 5 seconds since page load started
		if (this._requestWasSlow(tabId, appId, requestTimestamp)) {
			reason = 'slow';

			if (this._appHasKnownIssue(tabId, appId, pageURL)) {
				reason = 'hasIssue'; 		// allow if tracker is in compatibility list
			} else if (this._allowedCategories(tabId, appId, catId)) {
				reason = 'allowedCategory'; // allow if tracker is in breaking category
			} else if (this._allowedTypes(tabId, appId, requestType)) {
				reason = 'allowedType'; 	// allow if tracker is in breaking type
			} else if (this._pageWasReloaded(tabId, appId)) {
				reason = 'pageReloaded'; 	// allow if page has been reloaded recently
			}
		}

		const result = (reason === 'slow');
		if (result) {
			// We don't want record in tabInfo reasons other than 'slow'
			// Smart blocking should not claim that it unblock trackers which were unlocked
			// for other reasons before shouldBlock was called for them.
			tabInfo.setTabSmartBlockAppInfo(tabId, appId, 'slow', true);
		}

		return result;
	}


	/**
	 * Check if Smart Block should proceed based on:
	 * 1. Smart Block is enabled
	 * 2. Paused blocking is disabled
	 * 3. Page is neither whitelisted or blacklisted
	 * 4. Tracker is not site-specific unblocked
	 * 5. Tracker is not site-specific blocked
	 *
	 * @param  {number} 			tabId 	tab id
	 * @param  {string | boolean} 	appId 	tracker id
	 * @return {boolean}
	 */
	shouldCheck(tabId, appId = false) {
		const tabUrl = tabInfo.getTabInfo(tabId, 'url');
		const tabHost = tabInfo.getTabInfo(tabId, 'host');

		return (
			conf.enable_smart_block &&
			!globals.SESSION.paused_blocking &&
			!this.policy.getSitePolicy(tabUrl) &&
			((appId && (!conf.site_specific_unblocks.hasOwnProperty(tabHost) || !conf.site_specific_unblocks[tabHost].includes(+appId))) || appId === false) &&
			((appId && (!conf.site_specific_blocks.hasOwnProperty(tabHost) || !conf.site_specific_blocks[tabHost].includes(+appId))) || appId === false)
		);
	}

	/**
	 * Check if request host matches page host
	 * @TODO: this check will still fail when pageHost is "foo.bar.domain.com"
	 * and requestHost is "some.other.subdomain.domain.com"
	 * @param  {number} tabId			tab id
	 * @param  {string} pageHost		host of the page url
	 * @param  {string} requestHost		host of the request url
	 * @return {boolean}
	 */
	isFirstPartyRequest(tabId, inputPageHost = '', inputRequestHost = '') {
		let pageHost = inputPageHost;
		let requestHost = inputRequestHost;

		if (!this.shouldCheck(tabId)) { return false; }

		// Strip out www. to fix the most common sub-domain issue.  See ToDo in function comment.
		if (pageHost.startsWith('www.')) {
			pageHost = pageHost.slice(4);
		}
		if (requestHost.startsWith('www.')) {
			requestHost = requestHost.slice(4);
		}

		const min = Math.min(requestHost.length, pageHost.length);
		let matches = true;
		let i = 0;
		while (i < min && matches) {
			matches = requestHost.charAt(requestHost.length - i + 1) === pageHost.charAt(pageHost.length - i + 1);
			i++;
		}

		if (matches) {
			// tabInfo.setTabSmartBlockInfo(tabId, 'firstParty');
		}

		return matches;
	}

	/**
	 * Check if tab was reloaded.
	 * @param  {number} tabId		tab id
	 * @return {boolean}
	 */
	_pageWasReloaded(tabId) {
		return tabInfo.getTabInfo(tabId, 'reloaded') || false;
	}

	/**
	 * Check if app has a known issue with a URL.
	 * @param 	{number} tabId 		tab id
	 * @param  	{string} appId		tracker id
	 * @param  	{string} pageURL	tab url
	 * @return 	{boolean}
	 */
	_appHasKnownIssue(tabId, appId, pageURL) {
		return compDb.hasIssue(appId, pageURL);
	}

	/**
	 * Check if HTTP or WS (insecure web socket) request is loading on a HTTPS page
	 * @param 	{number} tabId 				tab id
	 * @param  	{string} pageProtocol		protocol of the tab url
	 * @param  	{string} requestProtocol	protocol of the request url
	 * @param 	{string} requestHost 		host of the request url
	 * @return 	{boolean}
	 */
	isInsecureRequest(tabId, pageProtocol, requestProtocol, requestHost) {
		if (!this.shouldCheck(tabId)) { return false; }

		// don't block mixed content from localhost
		if (requestHost === 'localhost' || requestHost === '127.0.0.1' || requestHost === '[::1]') {
			return false;
		}

		return (
			pageProtocol === 'https' &&
			(requestProtocol === 'http' || requestProtocol === 'ws') || false
		);
	}

	/**
	 * Check if given category is in the list of whitelisted categories
	 * @param 	{number} 	tabId 		tab id
	 * @param  	{string} 	appId		tracker id
	 * @param  	{string} 	catId  		category id
	 * @return {boolean}
	 */
	_allowedCategories(tabId, appId, catId) {
		return this.allowedCategoriesList.includes(catId);
	}

	/**
	 * Check if given request type is in the list of whitelisted requests
	 * @param 	{number} 	tabId 				tab id
	 * @param  	{string} 	appId				tracker id
	 * @param  	{string} 	requestType  		request type
	 * @return {boolean}
	 */
	_allowedTypes(tabId, appId, requestType) {
		return this.allowedTypesList.includes(requestType);
	}

	/**
	 * Check if tab has been reloaded
	 * @param  {string} tabId		tab id
	 * @return {boolean}
	 */
	checkReloadThreshold(tabId) {
		if (!this.shouldCheck(tabId)) { return false; }

		const THRESHHOLD = 30000; // 30 seconds

		return (
			tabInfo.getTabInfoPersist(tabId, 'numOfReloads') > 1 &&
			((Date.now() - tabInfo.getTabInfoPersist(tabId, 'firstLoadTimestamp')) < THRESHHOLD) || false
		);
	}

	/**
	 * Check if request loaded after a threshhold time since page load.
	 * @param  	{string}	tabId				tab id
	 * @param  	{string} 	appId				tracker id
	 * @param  	{number} 	requestTimestamp   	timestamp of the request
	 * @return 	{boolean}
	 */
	_requestWasSlow(tabId, appId, requestTimestamp) {
		const THRESHHOLD = 5000; // 5 seconds
		const pageTimestamp = tabInfo.getTabInfo(tabId, 'timestamp');
		return (requestTimestamp - pageTimestamp > THRESHHOLD) || false;
	}
}

export default PolicySmartBlock;
