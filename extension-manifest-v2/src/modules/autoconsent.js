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

async function initialize(msg, tabId, frameId) {
	const url = new URL(msg.url);

	// dnrRules.annoyances && !autoconsent.disallowed.includes(url.hostname)
	if (true) {
		// autoconsent.all || autoconsent.allowed.includes(url.hostname)
		const optOut = false;

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

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (msg.action !== 'autoconsent') return false;
	if (!sender.tab) return false;

	console.log('[autoconsent]', msg.type, msg);

	const tabId = sender.tab.id;
	const { frameId } = sender;

	switch (msg.type) {
		case 'init':
			return initialize(msg, tabId, frameId);
		case 'eval':
			return evalCode(msg.code, msg.id, tabId, frameId);
		default:
			return false;
	}
});
