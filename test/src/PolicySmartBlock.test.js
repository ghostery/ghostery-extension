/**
 * PolicySmartBlock.js Unit Tests
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

import PolicySmartBlock from '../../src/classes/PolicySmartBlock';
import { processUrl } from '../../src/utils/utils';

let policySmartBlock = new PolicySmartBlock();

// Mock imports for dependencies
jest.mock('../../src/classes/TabInfo', () => {});

describe('src/classes/PolicySmartBlock.js', () => {
	describe('PolicySmartBlock constructor tests', () => {
		test('allowedCategoriesList is constructed correctly', () => {
			const allowedCategoriesList = [
				'essential',
				'audio_video_player',
				'comments',
			];
			return expect(policySmartBlock.allowedCategoriesList).toEqual(allowedCategoriesList);
		});
		test('allowedTypesList is constructed correctly', () => {
			const allowedTypesList = [
				'stylesheet',
				'image',
				'font',
			];
			return expect(policySmartBlock.allowedTypesList).toEqual(allowedTypesList);
		});
	});
});
