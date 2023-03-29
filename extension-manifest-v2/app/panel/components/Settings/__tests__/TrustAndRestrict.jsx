/**
 * Trust/Restrict Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import TrustAndRestrict from '../TrustAndRestrict';

describe('app/panel/components/Settings/TrustAndRestrict', () => {
	describe('Snapshot test with react-test-renderer', () => {
		test('Testing TrustAndRestrict is rendering', () => {
			const wrapper = renderer.create(
				<TrustAndRestrict
					actions={{ updateSitePolicy: () => {} }}
					site_whitelist={[]}
					site_blacklist={[]}
				/>
			).toJSON();
			expect(wrapper).toMatchSnapshot();
		});
	});
});

describe('app/panel/components/Settings/', () => {
	test('isValidUrlorWildcard should return true with url entered', () => {
		expect(TrustAndRestrict.isValidUrlorWildcard('ghostery.com')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('localhost:3000')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('linux.home')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('hassio:8123')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('127.0.0.1')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('127.0.0.1:80')).toBe(true);
	});

	test('isValidUrlorWildcard should return true with wildcard URL entered', () => {
		expect(TrustAndRestrict.isValidUrlorWildcard('developer.*.org')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('*.com')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('*')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('developer.*')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('****')).toBe(true);
		expect(TrustAndRestrict.isValidUrlorWildcard('αράδειγμα.δοκιμ.*')).toBe(true);
	});

	test('isValidUrlorWildcard should return false with wildcard URL entered', () => {
		expect(TrustAndRestrict.isValidUrlorWildcard('<script>*</script>')).toBe(false);
		expect(TrustAndRestrict.isValidUrlorWildcard('+$@@#$*')).toBe(false);
		expect(TrustAndRestrict.isValidUrlorWildcard('SELECT * FROM USERS')).toBe(false);
	});

	test('isValidUrlorWildcard should return false with regex entered', () => {
		expect(TrustAndRestrict.isValidUrlorWildcard(')')).toBe(false);
		expect(TrustAndRestrict.isValidUrlorWildcard('++')).toBe(false);
		expect(TrustAndRestrict.isValidUrlorWildcard('/foo(?)/')).toBe(false);
	});

	test('isValidUrlorWildcard should return false with unsafe test entered', () => {
		// eslint-disable-next-line no-useless-escape
		expect(TrustAndRestrict.isValidUrlorWildcard('/^(\w+\s?)*$/')).toBe(false);
		expect(TrustAndRestrict.isValidUrlorWildcard('/^([0-9]+)*$/')).toBe(false);
		// eslint-disable-next-line no-useless-escape
		expect(TrustAndRestrict.isValidUrlorWildcard('(x\w{1,10})+y')).toBe(false);
	});
});
