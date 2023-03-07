import { BugDb } from '../../src/classes/BugDb';

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

	describe('init', () => {
		describe('on every run', () => {
			test('adds categories', () => {
				bugDb.engine = createEngineMock({
					categories: [{
						key: 'advertising'
					}],
				});
				expect(bugDb.db.categories).toHaveLength(0);
				bugDb.init();
				expect(bugDb.db.categories).toEqual([{
					description: 'category_advertising_desc',
					id: 'advertising',
					img_name: 'adv',
					name: 'category_advertising',
					num_blocked: 0,
					num_total: 0,
					trackers: [],
				}]);
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
						}],
					});
				});

				test('adds apps', () => {
					expect(bugDb.db.apps).toEqual({});
					bugDb.init();
					expect(bugDb.db.apps).toEqual({
						1: {
							cat: 'advertising',
							name: 'Google Ads',
							trackerID: 'google_ads',
							wtm: 'google_ads',
						},
					});
				});

				test('adds bugs', () => {
					expect(bugDb.db.bugs).toEqual({});
					bugDb.init();
					expect(bugDb.db.bugs).toEqual({
						1: {
							aid: '1',
						},
					});
				});

				test('adds tracker to category', () => {
					expect(bugDb.db.categories).toEqual([]);
					bugDb.init();
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

				test('adds tracker to category and mark as blocked', () => {
					expect(bugDb.db.categories).toEqual([]);

					bugDb.conf.selected_app_ids = {
						1: 1,
					};

					bugDb.init();
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
					}, {
						category: 'advertising',
						ghostery_id: '2',
						name: 'Facebook Ads',
						key: 'facebook_ads',
					}, {
						category: 'essential',
						ghostery_id: '3',
						name: 'Google Tag Manager',
						key: 'google_tag_manager',
					}],
				});
			});

			test('updates conf with new_app_ids', () => {
				bugDb.conf.selected_app_ids = {};
				bugDb.conf.known_app_ids = ['1'];

				bugDb.init(true);

				expect(bugDb.conf.new_app_ids).toEqual(['2', '3']);
			});

			test('updates conf with known_app_ids', () => {
				bugDb.conf.selected_app_ids = {};
				bugDb.conf.known_app_ids = ['1'];

				bugDb.init(true);

				expect(bugDb.conf.known_app_ids).toEqual(['1', '2', '3']);
			});

			test('updates conf with selected_app_ids', () => {
				bugDb.conf.selected_app_ids = {
					1: 1,
				};
				bugDb.conf.known_app_ids = [];

				bugDb.init(true);

				expect(bugDb.conf.selected_app_ids).toEqual({
					1: 1,
					2: 1,
				});
			});

			test('blocks new trackers if category is mostly blocking', () => {
				bugDb.conf.selected_app_ids = {
					1: 1,
				};
				bugDb.conf.known_app_ids = [];

				bugDb.init(true);

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
