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

import { define, html } from 'hybrids';

import '@ghostery/ui/autoconsent';
import { setupIframeSize, closeIframe } from '@ghostery/ui/iframe';

const hostname = new URLSearchParams(window.location.search).get('host');
setupIframeSize();

async function enable(_, event) {
	const { all } = event.detail;

	chrome.runtime.sendMessage({
		name: 'enable',
		origin: 'autoconsent',
		message: { url: all ? undefined : hostname },
	});
}

async function disable(_, event) {
	const { all } = event.detail;

	chrome.runtime.sendMessage({
		name: 'disable',
		origin: 'autoconsent',
		message: { url: all ? undefined : hostname },
	});
}

function close(host, event) {
	closeIframe(event.detail.reload);
}

async function getCategories() {
	const tab = await new Promise(
		(resolve) => { chrome.runtime.sendMessage({ name: 'getTabInfo' }, resolve); }
	);

	const { summary } = await new Promise(
		(resolve) => {
			chrome.runtime.sendMessage({
				name: 'getPanelData',
				message: { view: 'panel', tabId: tab.id },
			}, resolve);
		},
	);
	const { antiTracking, adBlock } = await new Promise(
		(resolve) => {
			chrome.runtime.sendMessage({
				name: 'getCommonModuleData',
				message: { tabId: tab.id },
			}, resolve);
		},
	);

	const result = summary.categories.reduce((acc, c) => {
		for (let i = 0; i < c.num_total; i += 1) {
			acc.push(c.id);
		}
		return acc;
	}, []);

	for (let i = 0; i < adBlock.unidentifiedTrackerCount; i += 1) {
		result.push('unknown');
	}

	for (let i = 0; i < antiTracking.trackerCount; i += 1) {
		result.push('advertising');
	}

	return result;
}

export default define({
	tag: 'gh-autoconsent',
	categories: {
		value: undefined,
		connect: (host, key) => {
			let id;

			const cb = async () => {
				host[key] = await getCategories();
				id = setTimeout(cb, 1000);
			};

			id = setTimeout(cb, 1000);

			return () => clearTimeout(id);
		},
	},
	content: ({ categories }) => html`
		<template layout="block">
			<ui-autoconsent
				categories="${categories}"
				onenable="${enable}"
				ondisable="${disable}"
				onclose="${close}"
			></ui-autoconsent>
		</template>
	`,
});
