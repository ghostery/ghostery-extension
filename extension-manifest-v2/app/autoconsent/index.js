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

import '@ghostery/ui';
import '@ghostery/ui/autoconsent';

import { define, html } from 'hybrids';

async function enable(_, event) {
	// TODO
}

async function disable(_, event) {
	// TODO
}

export default define({
	tag: 'gh-autoconsent',
	categories: {
		value: undefined,
		connect: (host, key) => {
			let id;

			const cb = () => {
				chrome.tabs.getCurrent((tab) => {
					chrome.runtime.sendMessage({
						name: 'getPanelData',
						message: { view: 'panel', tabId: tab.id },
					}, (response) => {
						console.log(response);
						// host[key] = response.categories.reduce((acc, c) => {
						// 	for (let i = 0; i < c.num_total; i += 1) {
						// 		acc.push(c.id);
						// 	}
						// 	return acc;
						// }, []);

						console.log(host[key]);

						id = setTimeout(cb, 1000);
					});
				});
			};

			id = setTimeout(cb, 1000);

			return () => clearTimeout(id);
		},
	},
	content: ({ categories }) => html`
       <template layout="block">
         <ui-autoconsent
           categories="${categories}"
           onenable=${enable}
           ondisable=${disable}
         ></ui-autoconsent>
       </template>
     `,
});
