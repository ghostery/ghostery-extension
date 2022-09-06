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

import {
	getStats,
	close,
	disable,
	updateIframeHeight
} from '@whotracksme/webextension-packages/packages/trackers-preview/src/page_scripts';

import { define, html } from 'hybrids';

const domain = new URLSearchParams(window.location.search).get('domain');
const stats = getStats(domain);

updateIframeHeight();

export default define({
	tag: 'gh-trackers-preview',
	content: () => html`
	<template layout="block">
		<ui-trackers-preview
			stats="${stats}"
			domain="${domain}"
			onclose="${close}"
			ondisable="${disable}"
		></ui-trackers-preview>
	</template>
  `,
});
