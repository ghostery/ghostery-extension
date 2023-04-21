import { BugDb } from '../../src/classes/BugDb';
import globals from '../../src/classes/Globals';

const { CATEGORIES_BLOCKED_BY_DEFAULT } = globals;

const createEngineMock = ({ categories = [], patterns = [] }) => ({
	metadata: {
		getCategories: () => categories,
		getPatterns: () => patterns,
	},
});

describe('src/classes/BugDb.js', () => {
	let bugDb;

	beforeEach(() => {
		bugDb = new BugDb();
	});

	afterEach(() => {
		globals.CATEGORIES_BLOCKED_BY_DEFAULT = CATEGORIES_BLOCKED_BY_DEFAULT;
	});

	describe('init', () => {
		describe('on every run', () => {
			test('does not add empty category', async () => {
				bugDb.engine = createEngineMock({
					categories: [{
						key: 'advertising'
					}],
				});
				expect(bugDb.db.categories).toHaveLength(0);
				await bugDb.init();
				expect(bugDb.db.categories).toEqual([]);
			});

			describe('with patterns', () => {
				beforeEach(() => {
					bugDb.engine = createEngineMock({
						categories: [{
							key: 'advertising'
						}],
						patterns: [{
							category: 'advertising',
							ghostery_id: '1',
							name: 'Google Ads',
							key: 'google_ads',
							filters: ['test']
						}],
					});
				});

				test('adds apps', async () => {
					expect(bugDb.db.apps).toEqual({});
					await bugDb.init();
					expect(bugDb.db.apps).toEqual({
						1: {
							cat: 'advertising',
							name: 'Google Ads',
							trackerID: 'google_ads',
							wtm: 'google_ads',
						},
					});
				});

				test('adds bugs', async () => {
					expect(bugDb.db.bugs).toEqual({});
					await bugDb.init();
					expect(bugDb.db.bugs).toEqual({
						1: {
							aid: '1',
						},
					});
				});

				test('adds tracker to category', async () => {
					expect(bugDb.db.categories).toEqual([]);
					await bugDb.init();
					expect(bugDb.db.categories).toEqual([{
						description: 'category_advertising_desc',
						id: 'advertising',
						img_name: 'adv',
						name: 'category_advertising',
						num_blocked: 0,
						num_total: 1,
						trackers: [{
							blocked: false,
							catId: 'advertising',
							description: '',
							id: '1',
							name: 'Google Ads',
							shouldShow: true,
							trackerID: 'google_ads',
						}],
					}]);
				});

				test('adds tracker to category and mark as blocked', async () => {
					expect(bugDb.db.categories).toEqual([]);

					bugDb.conf.selected_app_ids = {
						1: 1,
					};

					await bugDb.init();
					expect(bugDb.db.categories).toEqual([{
						description: 'category_advertising_desc',
						id: 'advertising',
						img_name: 'adv',
						name: 'category_advertising',
						num_blocked: 1,
						num_total: 1,
						trackers: [{
							blocked: true,
							catId: 'advertising',
							description: '',
							id: '1',
							name: 'Google Ads',
							shouldShow: true,
							trackerID: 'google_ads',
						}],
					}]);
				});
			});
		});

		describe('on upgrade', () => {
			beforeEach(() => {
				bugDb.engine = createEngineMock({
					categories: [{
						key: 'advertising'
					}, {
						key: 'essential',
					}],
					patterns: [{
						category: 'advertising',
						ghostery_id: '1',
						name: 'Google Ads',
						key: 'google_ads',
						filters: ['test']
					}, {
						category: 'advertising',
						ghostery_id: '2',
						name: 'Facebook Ads',
						key: 'facebook_ads',
						filters: ['test']
					}, {
						category: 'essential',
						ghostery_id: '3',
						name: 'Google Tag Manager',
						key: 'google_tag_manager',
						filters: ['test']
					}],
				});
			});

			test('updates conf with new_app_ids', async () => {
				bugDb.conf.selected_app_ids = {};
				bugDb.conf.known_app_ids = ['1'];

				await bugDb.init(true);

				expect(bugDb.conf.new_app_ids).toEqual(['2', '3']);
			});

			test('updates conf with known_app_ids', async () => {
				bugDb.conf.selected_app_ids = {};
				bugDb.conf.known_app_ids = ['1'];

				await bugDb.init(true);

				expect(bugDb.conf.known_app_ids).toEqual(['1', '2', '3']);
			});

			test('updates conf with selected_app_ids', async () => {
				bugDb.conf.selected_app_ids = {
					1: 1,
				};
				bugDb.conf.known_app_ids = [];

				await bugDb.init(true);

				expect(bugDb.conf.selected_app_ids).toEqual({
					1: 1,
					2: 1,
				});
			});

			test('blocks trackers in new non-blocking category', async () => {
				bugDb.conf.selected_app_ids = {};
				bugDb.conf.known_app_ids = [];

				bugDb.engine = createEngineMock({
					categories: [{
						key: 'xxx'
					}],
					patterns: [{
						category: 'xxx',
						ghostery_id: '1',
						name: 'Google Ads',
						key: 'google_ads',
						filters: ['test']
					}],
				});

				await bugDb.init(true);

				expect(bugDb.db.categories).toEqual([{
					description: 'category_xxx_desc',
					id: 'xxx',
					img_name: 'xxx',
					name: 'category_xxx',
					num_blocked: 0,
					num_total: 1,
					trackers: [{
						blocked: false,
						catId: 'xxx',
						description: '',
						id: '1',
						name: 'Google Ads',
						shouldShow: true,
						trackerID: 'google_ads',
					}],
				}]);
			});

			test('blocks trackers in new blocking category', async () => {
				bugDb.conf.selected_app_ids = {};
				bugDb.conf.known_app_ids = [];
				globals.CATEGORIES_BLOCKED_BY_DEFAULT = ['xxx'];

				bugDb.engine = createEngineMock({
					categories: [{
						key: 'xxx'
					}],
					patterns: [{
						category: 'xxx',
						ghostery_id: '1',
						name: 'Google Ads',
						key: 'google_ads',
						filters: ['test']
					}],
				});

				await bugDb.init(true);

				expect(bugDb.db.categories).toEqual([{
					description: 'category_xxx_desc',
					id: 'xxx',
					img_name: 'xxx',
					name: 'category_xxx',
					num_blocked: 1,
					num_total: 1,
					trackers: [{
						blocked: true,
						catId: 'xxx',
						description: '',
						id: '1',
						name: 'Google Ads',
						shouldShow: true,
						trackerID: 'google_ads',
					}],
				}]);
			});

			test('blocks new trackers if category is mostly blocking', async () => {
				bugDb.conf.selected_app_ids = {
					1: 1,
				};
				bugDb.conf.known_app_ids = ['1'];

				await bugDb.init(true);

				expect(bugDb.db.categories).toEqual([{
					description: 'category_advertising_desc',
					id: 'advertising',
					img_name: 'adv',
					name: 'category_advertising',
					num_blocked: 2,
					num_total: 2,
					trackers: [{
						blocked: true,
						catId: 'advertising',
						description: '',
						id: '1',
						name: 'Google Ads',
						shouldShow: true,
						trackerID: 'google_ads',
					}, {
						blocked: true,
						catId: 'advertising',
						description: '',
						id: '2',
						name: 'Facebook Ads',
						shouldShow: true,
						trackerID: 'facebook_ads',
					}],
				}, {
					description: 'category_essential_desc',
					id: 'essential',
					img_name: 'essential',
					name: 'category_essential',
					num_blocked: 0,
					num_total: 1,
					trackers: [{
						blocked: false,
						catId: 'essential',
						description: '',
						id: '3',
						name: 'Google Tag Manager',
						shouldShow: true,
						trackerID: 'google_tag_manager',
					}]
				}]);
			});
		});
	});
});
