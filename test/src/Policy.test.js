/**
 * Policy.js Unit Tests
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import Policy, {
	BLOCK_REASON_BLOCK_PAUSED,
	BLOCK_REASON_GLOBAL_BLOCKED,
	BLOCK_REASON_GLOBAL_UNBLOCKED,
	BLOCK_REASON_WHITELISTED,
	BLOCK_REASON_BLACKLISTED,
	BLOCK_REASON_SS_UNBLOCKED,
	BLOCK_REASON_SS_BLOCKED,
	BLOCK_REASON_C2P_ALLOWED_ONCE,
} from '../../src/classes/Policy';
import c2pDb from '../../src/classes/Click2PlayDb';
import conf from '../../src/classes/Conf';
import globals from '../../src/classes/Globals';
import { processUrl } from '../../src/utils/utils';

// Mock imports for dependencies
jest.mock('../../src/classes/TabInfo');
jest.mock('../../src/classes/Conf', () => {
	return {
		selected_app_ids: {
			15: 1,
			41: 1,
		},
		toggle_individual_trackers: true,
		site_specific_blocks: {
			'www.espn.com': [50],
			'www.cnn.com': [13],
			'www.ghostery.com': [15],
		},
		site_specific_unblocks: {
			'www.cnn.com': [15, 50],
			'www.tmz.com': [41, 50],
		},
		site_blacklist: ['tmz.com'],
		site_whitelist: ['ghostery.com', 'cliqz.com'],
	}
});
jest.mock('../../src/classes/Globals', () => {
	return {
		BLACKLISTED: 1,
		WHITELISTED: 2,
		SESSION : {
			paused_blocking: false,
		},
		BROWSER_INFO: { displayName: '', name: '', token: '', version: '', os: 'other' },
	}
});

describe('src/classes/Policy.js', () => {
	describe('testing shouldBlock()', () => {
		beforeAll(() => {
			// Mock C2P allow-once check
			c2pDb.allowedOnce = jest.fn();
			c2pDb.allowedOnce.mockReturnValue(false);
		});

		describe('with Ghostery paused', () => {
			beforeEach(() => {
				globals.SESSION.paused_blocking = true;
			});
			afterEach(() => {
				globals.SESSION.paused_blocking = false;
			});
			test('a blocked tracker is unblocked with reason BLOCK_REASON_BLOCK_PAUSED', () => {
				const { block, reason } = Policy.shouldBlock(41, 'advertising', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_BLOCK_PAUSED);
			});
			test('an unblocked tracker remains unblocked with reason BLOCK_REASON_BLOCK_PAUSED', () => {
				const { block, reason } = Policy.shouldBlock(50, 'essential', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_BLOCK_PAUSED);
			});
			test('a tracker on a white-listed site is unblocked with reason BLOCK_REASON_BLOCK_PAUSED', () => {
				const { block, reason } = Policy.shouldBlock(41, 'advertising', 1, 'www.ghostery.com', 'https://www.ghostery.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_BLOCK_PAUSED);
			});
			test('a tracker on a black-listed site is unblocked with reason BLOCK_REASON_BLOCK_PAUSED', () => {
				const { block, reason } = Policy.shouldBlock(50, 'essential', 1, 'www.tmz.com', 'https://www.tmz.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_BLOCK_PAUSED);
			});
		});

		describe('with Click2Play Allow Once enabled', () => {
			beforeAll(() => {
				c2pDb.allowedOnce.mockReturnValue(true);
			});
			afterAll(() => {
				c2pDb.allowedOnce.mockReturnValue(false);
			});
			test('a blocked tracker on the site-specific allow list on a black-listed site is unblocked with reason BLOCK_REASON_C2P_ALLOWED_ONCE', () => {
				const { block, reason } = Policy.shouldBlock(41, 'advertising', 1, 'www.tmz.com', 'https://www.tmz.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_C2P_ALLOWED_ONCE);
			});
			test('a blocked tracker is unblocked with reason BLOCK_REASON_C2P_ALLOWED_ONCE', () => {
				const { block, reason } = Policy.shouldBlock(41, 'advertising', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_C2P_ALLOWED_ONCE);
			});
			test('an unblocked tracker on the site-specific block list remains unblocked with reason BLOCK_REASON_C2P_ALLOWED_ONCE', () => {
				const { block, reason } = Policy.shouldBlock(50, 'essential', 1, 'www.espn.com', 'https://www.espn.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_C2P_ALLOWED_ONCE);
			});
			test('an unblocked tracker on the site-specific allow list on a black-listed site remains unblocked with reason BLOCK_REASON_C2P_ALLOWED_ONCE', () => {
				const { block, reason } = Policy.shouldBlock(50, 'essential', 1, 'www.tmz.com', 'https://www.tmz.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_C2P_ALLOWED_ONCE);
			});
			test('an unblocked tracker on a black-listed site remains unblocked with reason BLOCK_REASON_C2P_ALLOWED_ONCE', () => {
				const { block, reason } = Policy.shouldBlock(55, 'essential', 1, 'www.tmz.com', 'https://www.tmz.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_C2P_ALLOWED_ONCE);
			});
			test('an unblocked tracker remains unblocked with reason BLOCK_REASON_C2P_ALLOWED_ONCE', () => {
				const { block, reason } = Policy.shouldBlock(55, 'essential', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_C2P_ALLOWED_ONCE);
			});
		});

		describe('with a globally blocked tracker', () => {
			test('a tracker on the site-specific allow list is unblocked with reason BLOCK_REASON_SS_UNBLOCKED', () => {
				const { block, reason } = Policy.shouldBlock(15, 'site_analytics', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_SS_UNBLOCKED);
			});
			test('a tracker on the site-specific allow list on a black-listed site remains blocked with reason BLOCK_REASON_BLACKLISTED', () => {
				const { block, reason } = Policy.shouldBlock(41, 'advertising', 1, 'www.tmz.com', 'https://www.tmz.com/');
				expect(block).toBeTruthy();
				expect(reason).toBe(BLOCK_REASON_BLACKLISTED);
			});
			test('a tracker on a white-listed site is unblocked with reason BLOCK_REASON_WHITELISTED', () => {
				const { block, reason } = Policy.shouldBlock(41, 'advertising', 1, 'www.ghostery.com', 'https://www.ghostery.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_WHITELISTED);
			});
			test('a tracker is blocked with reason BLOCK_REASON_GLOBAL_BLOCKED', () => {
				const { block, reason } = Policy.shouldBlock(41, 'advertising', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeTruthy();
				expect(reason).toBe(BLOCK_REASON_GLOBAL_BLOCKED);
			});
		});

		describe('with a globally unblocked tracker', () => {
			test('a tracker on the site-specific block list is blocked with reason BLOCK_REASON_SS_BLOCKED', () => {
				const { block, reason } = Policy.shouldBlock(13, 'site_analytics', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeTruthy();
				expect(reason).toBe(BLOCK_REASON_SS_BLOCKED);
			});
			test('a tracker on the site-specific block list on a white-listed site is unblocked with reason BLOCK_REASON_WHITELISTED', () => {
				const { block, reason } = Policy.shouldBlock(15, 'site_analytics', 1, 'www.ghostery.com', 'https://www.ghostery.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_WHITELISTED);
			});
			test('a tracker on the site-specific allow list is unblocked with reason BLOCK_REASON_SS_UNBLOCKED', () => {
				const { block, reason } = Policy.shouldBlock(50, 'essential', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_SS_UNBLOCKED);
			});
			test('a tracker on the site-specific allow list on a black-listed site is blocked with reason BLOCK_REASON_BLACKLISTED', () => {
				const { block, reason } = Policy.shouldBlock(50, 'essential', 1, 'www.tmz.com', 'https://www.tmz.com/');
				expect(block).toBeTruthy();
				expect(reason).toBe(BLOCK_REASON_BLACKLISTED);
			});
			test('a tracker on a black-listed site is blocked with reason BLOCK_REASON_BLACKLISTED', () => {
				const { block, reason } = Policy.shouldBlock(55, 'essential', 1, 'www.tmz.com', 'https://www.tmz.com/');
				expect(block).toBeTruthy();
				expect(reason).toBe(BLOCK_REASON_BLACKLISTED);
			});
			test('a tracker is unblocked with reason BLOCK_REASON_GLOBAL_UNBLOCKED', () => {
				const { block, reason } = Policy.shouldBlock(55, 'essential', 1, 'www.cnn.com', 'https://www.cnn.com/');
				expect(block).toBeFalsy();
				expect(reason).toBe(BLOCK_REASON_GLOBAL_UNBLOCKED);
			});
		});
	});

	describe('test matchesWildcard()', () => {
		test('matchesWildcard should return true with wildcard entered ', () => {
			let url = 'developer.mozilla.org';
			let input = 'developer.*.org';
			expect(Policy.matchesWildcard(url, input)).toBeTruthy();

			url = 'ghostery.com';
			input = '*.com';
			expect(Policy.matchesWildcard(url, input)).toBeTruthy();

			url = 'ghostery.com'
			input = '*';
			expect(Policy.matchesWildcard(url, input)).toBeTruthy();

			url = 'developer.mozilla.org';
			input = 'developer.*';
			expect(Policy.matchesWildcard(url , input)).toBeTruthy();

			url = 'developer.mozilla.org';
			input = '****';
			expect(Policy.matchesWildcard(url, input)).toBeTruthy();
		});

		test('matchesWildcard should return false with wildcard entered ', () => {
			let url = 'developer.mozilla.org';
			let input = '<script>*</script>';
			expect(Policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'ghostery.com';
			input = '+$@@#$*';
			expect(Policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'ghostery.com'
			input = 'αράδειγμα.δοκιμ.*';
			expect(Policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'SELECT * FROM USERS';
			input = 'developer.*';
			expect(Policy.matchesWildcard(url , input)).toBeFalsy();
		});

		test('matchesWildcard should return false with regex entered', () => {
			let url = 'foo.com';
			let input = '/foo)]/';
			expect(Policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'foo.com';
			input = 'test\\';
			expect(Policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '/(?<=x*)foo/';
			expect(Policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '/foo(?)/';
			expect(Policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '<script></script>';
			expect(Policy.matchesWildcard(url, input)).toBeFalsy();
		});
	})
});
