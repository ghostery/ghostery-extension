import sinon from 'sinon';

import Policy from '../../src/classes/Policy';
let policy = new Policy();

// Mock imports for dependencies
jest.mock('../../src/classes/TabInfo', () => {});

describe('src/classes/Policy.js', () => {
	describe('test matchesWildcardOrRegex', () => {
		test('matchesWildcardOrRegex should return true with wildcard entered ', () => {
			let url = 'developer.mozilla.org';
			let input = 'developer.*.org';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();

			url = 'ghostery.com';
			input = '*.com';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();

			url = 'ghostery.com'
			input = '*';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();

			url = 'developer.mozilla.org';
			input = 'developer.*';
			expect(policy.matchesWildcardOrRegex(url , input)).toBeTruthy();

			url = 'developer.mozilla.org';
			input = '****';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();
		});

		test('matchesWildcardOrRegex should return false with wildcard entered ', () => {
			let url = 'developer.mozilla.org';
			let input = '<script>*</script>';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeFalsy();

			url = 'ghostery.com';
			input = '+$@@#$*';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeFalsy();

			url = 'ghostery.com'
			input = 'αράδειγμα.δοκιμ.*';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeFalsy();

			url = 'SELECT * FROM USERS';
			input = 'developer.*';
			expect(policy.matchesWildcardOrRegex(url , input)).toBeFalsy();
		});

		test('matchesWildcardOrRegex should return true with regex entered', () => {
			let url = 'developer.mozilla.org';
			let input = '[de]eveloper.mozilla.org';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();

			url = 'regex101.com';
			input = '\\d{3}';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();

			url = 'microsoft.com';
			input = 'mi.....ft';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();

			url = 'petfinder.com';
			input = '^pet';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();

			url = 'buzzfeed.com';
			input = '[lu]z{2,6}';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeTruthy();
		});

		test('matchesWildcardOrRegex should return false with regex entered', () => {
			let url = 'foo.com';
			let input = '/foo)]/';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeFalsy();

			url = 'foo.com';
			input = 'test\\';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '/(?<=x*)foo/';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '/foo(?)/';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '<script></script>';
			expect(policy.matchesWildcardOrRegex(url, input)).toBeFalsy();
		});
	})
});
