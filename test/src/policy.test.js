import Policy from '../../src/classes/Policy';
let policy = new Policy();

// Mock imports for dependencies
jest.mock('../../src/classes/TabInfo', () => {});

describe('src/classes/Policy.js', () => {
	describe('test matchesWildcard', () => {
		test('matchesWildcard should return true with wildcard entered ', () => {
			let url = 'developer.mozilla.org';
			let input = 'developer.*.org';
			expect(policy.matchesWildcard(url, input)).toBeTruthy();

			url = 'ghostery.com';
			input = '*.com';
			expect(policy.matchesWildcard(url, input)).toBeTruthy();

			url = 'ghostery.com'
			input = '*';
			expect(policy.matchesWildcard(url, input)).toBeTruthy();

			url = 'developer.mozilla.org';
			input = 'developer.*';
			expect(policy.matchesWildcard(url , input)).toBeTruthy();

			url = 'developer.mozilla.org';
			input = '****';
			expect(policy.matchesWildcard(url, input)).toBeTruthy();
		});

		test('matchesWildcard should return false with wildcard entered ', () => {
			let url = 'developer.mozilla.org';
			let input = '<script>*</script>';
			expect(policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'ghostery.com';
			input = '+$@@#$*';
			expect(policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'ghostery.com'
			input = 'αράδειγμα.δοκιμ.*';
			expect(policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'SELECT * FROM USERS';
			input = 'developer.*';
			expect(policy.matchesWildcard(url , input)).toBeFalsy();
		});

		test('matchesWildcard should return false with regex entered', () => {
			let url = 'foo.com';
			let input = '/foo)]/';
			expect(policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'foo.com';
			input = 'test\\';
			expect(policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '/(?<=x*)foo/';
			expect(policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '/foo(?)/';
			expect(policy.matchesWildcard(url, input)).toBeFalsy();

			url = 'foo.com';
			input = '<script></script>';
			expect(policy.matchesWildcard(url, input)).toBeFalsy();
		});
	})
});
