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

import { buildC2P, buildRedirectC2P, allowAllwaysC2P } from '../../src/utils/click2play';
import tabInfo from '../../src/classes/TabInfo';
import Policy from '../../src/classes/Policy';
import globals from '../../src/classes/Globals';
import conf from '../../src/classes/Conf';
import c2p_tpl from '../../app/templates/click2play.html';
import * as utils from '../../src/utils/utils';
import * as inject from '../../src/utils/inject';

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
	EXCLUDES: [],
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
jest.mock('../../src/classes/BugDb', () => ({
	db: {
		apps: {
			464: {
				name: "Facebook Social Plugins"
			},
		}
	}
}));
jest.mock('../../src/classes/Conf', () => ({
		selected_app_ids: {
			15: 1,
			41: 1,
		},
		site_specific_blocks: {
			'www.ghostery.com': [15, 100],
			'www.cnn.com': [41],
		},
		site_specific_unblocks: {
			'www.cnn.com': [15, 50],
		},
}));

// Mock TabInfo data
tabInfo.getTabInfo = jest.fn();
tabInfo.getTabInfo.mockReturnValue(tabInfo);
tabInfo.setTabInfo = jest.fn().mockImplementation((tab_id, property, value) => {
	tabInfo[property] = value;
});

describe('src/utils/click2play.js', () => {
	beforeEach(() => {
		chrome.tabs.sendMessage.flush();
		chrome.tabs.executeScript.flush();
	})

	afterAll(() => {
		chrome.flush();
	});

	const details = {
		tab_id: 1
	};
	const tab = tabInfo.getTabInfo(details.tab_id);

	describe('testing buildC2P()', () => {
		describe('c2pStatus is "none"', () => {
			beforeAll(() => {
				tabInfo.c2pStatus = 'none';
			});

			test('c2pStatus defaults to "none"', () => {
				expect(tab.c2pStatus).toBe('none');
			});

			test('chrome.tabs.executeScript() is called', () => {
				chrome.tabs.executeScript.yields();
				chrome.runtime.sendMessage.yields();
				buildC2P(details, 464);
				expect(chrome.tabs.executeScript.withArgs(details.tab_id, { file: 'dist/click_to_play.js', runAt: 'document_idle' }).calledOnce);
			});

			test('c2pApp and c2pHtml data added to c2pQueue', () => {
				// Look at what data was added to c2pQueue via setTabInfo
				const c2pQueue = tabInfo.setTabInfo.mock.calls[1][2];
				expect(c2pQueue).toHaveProperty('464');
			});

			test('chrome.runtime.sendMessage() called with correct C2P data', () => {
				const c2pQueue = tabInfo.setTabInfo.mock.calls[1][2];
				expect(chrome.runtime.sendMessage.withArgs(details.tab_id, { name: 'c2p', message: c2pQueue }).calledOnce);
			});

			test('c2pStatus set to "done"', () => {
				expect(tab.c2pStatus).toBe('done');
			});

			test('c2pQueue cleared', () => {
				expect(tab.c2pQueue).toEqual({});
			});
		});

		describe('c2pStatus is "loading"', () => {
			beforeAll(() => {
				tabInfo.c2pStatus = 'loading';
				buildC2P(details, 464);
			});

			test('chrome.tabs.executeScript() and chrome.runtime.sendMessage() are not called', () => {
				expect(chrome.tabs.executeScript.notCalled);
				expect(chrome.runtime.sendMessage.notCalled);
			});

			test('c2pApp and c2pHtml data added to c2pQueue', () => {
				expect(tab.c2pQueue).toHaveProperty('464');
			});
		});

		describe('c2pStatus is "done"', () => {
			beforeAll(() => {
				tabInfo.c2pStatus = 'done';
				tabInfo.c2pQueue = {};
				buildC2P(details, 464);
			});

			test('chrome.tabs.executeScript() is not called. chrome.runtime.sendMessage() is called', () => {
				expect(chrome.tabs.executeScript.notCalled);
				expect(chrome.runtime.sendMessage.calledOnce);
			});

			test('c2pQueue is empty', () => {
				expect(tab.c2pQueue).toEqual({});
			});
		});
	});

	describe('testing buildRedirectC2P()', () => {
		const REDIRECT_MAP = new Map([[100, { url: 'https://cnn.com/', redirectUrl: 'https://fake-redirect.com/' }]]);

		test('app_id is added to BLOCKED_REDIRECT_DATA global', () => {
			buildRedirectC2P(REDIRECT_MAP.get(100), 464);
			expect(globals.BLOCKED_REDIRECT_DATA.app_id).toBe(464);
			expect(globals.BLOCKED_REDIRECT_DATA.url).toBe('https://fake-redirect.com/');
		});
	});

	describe('testing allowAllwaysC2P()', () => {
		test('app_id is removed from selected_app_ids', () => {
			allowAllwaysC2P(15, 'www.espn.com');
			expect(conf.selected_app_ids).not.toHaveProperty('15');
			expect(conf.selected_app_ids).toMatchObject({41: 1});
		});

		test('app_id is removed from site_specific_blocks', () => {
			allowAllwaysC2P(15, 'www.ghostery.com');
			expect(conf.site_specific_blocks['www.ghostery.com']).toEqual(expect.not.arrayContaining([15]));
			expect(conf.site_specific_blocks['www.ghostery.com']).toEqual(expect.arrayContaining([100]));
		});

		test('app_id is added to site_specific_unblocks', () => {
			allowAllwaysC2P(41, 'www.cnn.com');
			expect(conf.site_specific_unblocks['www.cnn.com']).toEqual(expect.arrayContaining([15,50,41]));
			// Check results from preceding tests
			expect(conf.site_specific_unblocks['www.espn.com']).toEqual(expect.arrayContaining([15]));
			expect(conf.site_specific_unblocks['www.ghostery.com']).toEqual(expect.arrayContaining([15]));
			// Check removal from selected_app_ids and site_specific_blocks as well
			expect(conf.selected_app_ids).not.toHaveProperty('41');
			expect(conf.site_specific_blocks['www.cnn.com']).toEqual(expect.not.arrayContaining([41]));
		});
	});
});
