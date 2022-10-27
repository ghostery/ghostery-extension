/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import rules from '@duckduckgo/autoconsent/rules/rules.json';
import { parse } from 'tldts-experimental';

import globals from '../classes/Globals';
import conf from '../classes/Conf';

async function getTabDomain(tabId) {
	const tab = await new Promise(resolve => chrome.tabs.get(tabId, resolve));
	return parse(tab.url).domain;
}

async function initialize(msg, tabId, frameId) {
	const {
		enable_autoconsent,
		autoconsent_whitelist,
		autoconsent_blacklist,
		site_whitelist,
	} = conf;

	if (!enable_autoconsent || globals.SESSION.paused_blocking) {
		return;
	}

	const domain = await getTabDomain(tabId);

	if ((autoconsent_blacklist && autoconsent_blacklist.includes(domain)) || site_whitelist.some(s => s.includes(domain))) {
		return;
	}

	const globallyEnabled = !autoconsent_whitelist;
	const optOut = globallyEnabled || autoconsent_whitelist.includes(domain);

	chrome.tabs.sendMessage(
		tabId,
		{
			action: 'autoconsent',
			type: 'initResp',
			rules,
			config: {
				enabled: true,
				autoAction: optOut ? 'optOut' : '',
				disabledCmps: [],
				enablePrehide: optOut,
				detectRetries: 20,
			},
		},
		{
			frameId,
		},
	);
}

async function evalCode(code, id, tabId, frameId) {
	const data = await new Promise((resolve) => {
		chrome.tabs.executeScript(tabId, {
			frameId,
			code: `!!window.eval(decodeURIComponent("${encodeURIComponent(code)}"))`
		}, (result) => {
			resolve([{
				result,
				frameId,
			}]);
		});
	});

	chrome.tabs.sendMessage(
		tabId,
		{
			action: 'autoconsent',
			id,
			type: 'evalResp',
			result: data.result,
		},
		{
			frameId,
		},
	);
}

async function openIframe(msg, tabId) {
	const { autoconsent_whitelist, autoconsent_interactions } = conf;
	if (!autoconsent_whitelist) return;

	const domain = await getTabDomain(tabId);

	if (autoconsent_whitelist.includes(domain)) {
		return;
	}

	chrome.tabs.sendMessage(
		tabId,
		{
			action: 'autoconsent',
			type: 'openIframe',
			domain,
			defaultForAll: autoconsent_interactions >= 2,
		},
		{ frameId: 0 },
	);
}

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (msg.action !== 'autoconsent') return false;
	if (!sender.tab) return false;

	const tabId = sender.tab.id;
	const { frameId } = sender;

	switch (msg.type) {
		case 'init':
			return initialize(msg, tabId, frameId);
		case 'eval':
			return evalCode(msg.code, msg.id, tabId, frameId);
		case 'cmpDetected':
			openIframe(msg, tabId);
			return false;
		default:
			return false;
	}
});
