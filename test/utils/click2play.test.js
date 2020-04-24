/**
 * click2play.js Unit Tests
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { buildC2P } from '../../src/utils/click2play';
import tabInfo from '../../src/classes/TabInfo';
import Policy from '../../src/classes/Policy';
import c2p_tpl from '../../app/templates/click2play.html';
import { injectScript, sendMessage } from '../../src/utils/utils';

// Mock imports for dependencies
jest.mock('../../app/templates/click2play.html', () => {
	const _ = require('underscore');
	return _.template('../../app/templates/click2play.html');
});
jest.mock('../../src/classes/TabInfo', () => ({
	c2pStatus: 'none',
	c2pQueue: {},
	host: 'cnn.com',
	path: '',
	prefetched: false,
	protocol: 'https',
}));
jest.mock('../../src/classes/Policy');
jest.mock('../../src/classes/Globals', () => ({
	BROWSER_INFO: { displayName: '', name: '', token: '', version: '', os: 'other' },
	EXCLUDES: []
}));
jest.mock('../../src/utils/utils', () => ({
	sendMessage: jest.fn(),
	injectScript: jest.fn(() => Promise.resolve())
}));
jest.mock('../../src/classes/Click2PlayDb', () => ({
	type: 'click2play',
	db: {
		apps: {
			464: [{
				aid: 464,
				allow: [464, 93, 922],
				frameColor: '',
				text: '',
				button: 'ghostery_facebook.png',
				attach: false,
				ele: 'iframe[src*=facebook\\.com\\/plugins\\/like\\.php], .fb-like, fb\\:like',
				type: ''
			},{
				aid: 464,
				allow: [464, 93, 922],
				frameColor: '',
				text: '',
				button: '',
				attach: 'parentNode',
				ele: 'iframe[src*=facebook\\.com\\/plugins\\/video\\.php], iframe[src*=facebook\\.com\\/plugins\\/likebox\\.php], iframe[src*=facebook\\.com\\/plugins\\/post\\.php], iframe[src*=facebook\\.com\\/plugins\\/activity\\.php], .fb-like-box, fb\\:like-box, .fb-activity, fb\\:activity',
				type: ''
			},{
				aid: 464,
				allow: [464, 93, 922],
				frameColor: '',
				text: '',
				button: '',
				attach: false,
				ele: 'fb\\:comments, #fb-comments',
				type: ''
			}],
		}
	}
}));
jest.mock('../../src/classes/bugDb', () => ({
	db: {
		apps: {
			464: [{
				name: "Facebook Social Plugins"
			}],
		}
	}
}));

// Mock TabInfo data
tabInfo.getTabInfo = jest.fn();
tabInfo.getTabInfo.mockReturnValue(tabInfo);

describe('src/utils/click2play.js', () => {
	const tab = tabInfo.getTabInfo(1);

	describe('testing buildC2P()', () => {
		const details = {
			tab_id: 1
		};

		test('c2pStatus is \'none\'', () => {
			expect(tab.c2pStatus).toBe('none');
		});

		test('injectScript() is called when c2pStatus is \'none\'', () => {
			buildC2P(details, 464);
			expect(injectScript).toHaveBeenCalledWith(details.tab_id, 'dist/click_to_play.js', '', 'document_idle');
		});

		test('sendMessage() called with correct C2P data', () => {
			expect(sendMessage).toHaveBeenCalledWith(details.tab_id, 'c2p', tab.c2pQueue);
		});

		test('c2pStatus is \'done\'', () => {
			expect(tab.c2pStatus).toBe('done');
		});

		test('injectScript() is not called when c2pStatus is \'loading\'', () => {
			tabInfo.c2pStatus = 'loading';
			injectScript.mockClear();
			buildC2P(details, 464);
			expect(injectScript).not.toHaveBeenCalled();
		});

		test('c2p app and html data added to c2pQueue when c2pStatus is \'loading\'', () => {
			expect(tab.c2pQueue).toHaveProperty('464');
		});


	});
});
