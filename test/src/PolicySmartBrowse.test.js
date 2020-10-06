/**
 * PolicySmartBrowse.js Unit Tests
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

import PolicySmartBrowse from '../../src/classes/PolicySmartBrowse';
import { processUrl } from '../../src/utils/utils';

let policySmartBrowse = new PolicySmartBrowse();

// Mock imports for dependencies
jest.mock('../../src/classes/TabInfo', () => {});

describe('src/classes/PolicySmartBrowse.js', () => {
	describe('PolicySmartBrowse constructor tests', () => {
		test('allowedCategoriesList is constructed correctly', () => {
			const allowedCategoriesList = [
				'essential',
				'audio_video_player',
				'comments',
			];
			return expect(policySmartBrowse.allowedCategoriesList).toEqual(allowedCategoriesList);
		});
		test('allowedTypesList is constructed correctly', () => {
			const allowedTypesList = [
				'stylesheet',
				'image',
				'font',
			];
			return expect(policySmartBrowse.allowedTypesList).toEqual(allowedTypesList);
		});
	});

	describe('PolicySmartBrowse isFirstPartyRequest tests', () => {
		beforeAll(() => {
			PolicySmartBrowse.shouldCheck = jest.fn(() => true);
		});

		afterAll(() => {
			policySmartBrowse.mockClear();
		});

		test('PolicySmartBrowse isFirstPartyRequest truthy assertion', () => {
			expect(PolicySmartBrowse.isFirstPartyRequest('tabId', 'example.com', 'example.com')).toBeTruthy();
			// isFirstPartyRequest() expects pre-parsed domains, so we should parse the test urls
			const parsedPage = processUrl('https://checkout.ghostery.com/insights');
			const parsedRequest = processUrl('https://analytics.ghostery.com/piwik.js');
			expect(PolicySmartBrowse.isFirstPartyRequest('tabId', parsedPage.generalDomain, parsedRequest.generalDomain)).toBeTruthy();
		});

		test('PolicySmartBrowse isFirstPartyRequest falsy assertion', () => {
			expect(PolicySmartBrowse.isFirstPartyRequest('tabId', 'www.example.com', 'example.com')).toBeFalsy();
			expect(PolicySmartBrowse.isFirstPartyRequest('tabId', 'sub.example.com', 'example.com')).toBeFalsy();
			expect(PolicySmartBrowse.isFirstPartyRequest('tabId', 'example.com', 'test.com')).toBeFalsy();
			expect(PolicySmartBrowse.isFirstPartyRequest('tabId', 'www.example.com', 'www.test.com')).toBeFalsy();
		});
	});
});
