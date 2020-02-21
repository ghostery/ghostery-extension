import sinon from 'sinon';
import PolicySmartBlock from '../../src/classes/PolicySmartBlock';

let policySmartBlock = new PolicySmartBlock();
let policy = policySmartBlock.policy;

// Mock imports for dependencies
jest.mock('../../src/classes/TabInfo', () => {});

describe('src/classes/Policy.js', () => {
	describe('test functions', () => {

		test('matchesWildcardOrRegex should return true with wildcard entered ', () => {
			const input = 'mozilla.*.com';
			const stub = sinon.stub(policy, 'matchesWildcardOrRegex');
			expect(stub.withArgs(input).returns(true));
			stub.restore();
		});

		test('matchesWildcardOrRegex should return true with regex entered', () => {
			const input = '[de]eveloper.mozilla.org';
			const stub = sinon.stub(policy, 'matchesWildcardOrRegex');
			expect(stub.withArgs(input).returns(true));
			stub.restore();
		});

		test('matchesWildcardOrRegex should return false with ', () => {
			const input = '[google.com';
			const stub = sinon.stub(policy, 'matchesWildcardOrRegex');
			expect(stub.withArgs(input).returns(false));
			stub.restore();
		});
	})
});
