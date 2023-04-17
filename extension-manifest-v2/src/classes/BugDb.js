/**
 * BugDb Class
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
import { FiltersEngine } from '@cliqz/adblocker';
import { sortCategories } from '@ghostery/ui/categories';
import globals from './Globals';

import conf from './Conf';

export function getPatternId(pattern) {
	return String(pattern.ghostery_id) || pattern.key;
}

async function getEngine() {
	const response = await fetch(
		chrome.runtime.getURL('databases/trackerdb.engine.bytes'),
	);
	const rawTrackerDB = await response.arrayBuffer();
	return FiltersEngine.deserialize(new Uint8Array(rawTrackerDB));
}

/**
 * Class for handling the main Ghostery trackers database
 */
export class BugDb {
	constructor() {
		this.db = {
			categories: [],
			apps: {},
			bugs: {},
			version: 0,
		};
		/* keep conf as property for sake of testing */
		this.conf = conf;
		this.engine = null;
		this.loadingPromise = new Promise((resolve) => {
			this.loadingPromiseResolver = resolve;
		});
	}

	async init(just_upgraded) {
		if (!this.engine) {
			this.engine = await getEngine();
		}

		const selectedApps = this.conf.selected_app_ids || {};

		const categories = this.engine.metadata.getCategories()
			.map(({ key: category }) => category)
			.sort(sortCategories);

		const patterns = this.engine.metadata.getPatterns();

		/* Mark new trackers */
		let oldKnownAppIds;
		if (just_upgraded) {
			const newKnownAppIds = patterns.map(getPatternId);
			oldKnownAppIds = this.conf.known_app_ids;
			const new_app_ids = newKnownAppIds.filter(id => !oldKnownAppIds.includes(id));
			this.conf.new_app_ids = new_app_ids;
			this.conf.known_app_ids = newKnownAppIds;
		}

		const categoriesMeta = categories.reduce((all, category) => ({
			...all,
			[category]: {
				trackers: [],
				blockedTrackersCount: 0,
			},
		}), {});

		patterns.forEach((pattern) => {
			const id = getPatternId(pattern);

			categoriesMeta[pattern.category].trackers.push({
				id,
				name: pattern.name,
				description: '',
				blocked: selectedApps.hasOwnProperty(id),
				shouldShow: true,
				catId: pattern.category,
				trackerID: pattern.key,
			});

			if (selectedApps.hasOwnProperty(id)) {
				categoriesMeta[pattern.category].blockedTrackersCount += 1;
			}

			this.db.apps[id] = {
				name: pattern.name,
				trackerID: pattern.key,
				get wtm() {
					return this.trackerID;
				},
				cat: pattern.category,
			};

			this.db.bugs[id] = {
				aid: id,
			};
		});

		/* block new trackers if in mostly blocked category */
		if (just_upgraded) {
			// Bias in favor of blocking if the category will be
			// blocked by default in a new installtion. This is
			// mostly relevant if new categories were introduced.
			const majority = globals.CATEGORIES_BLOCKED_BY_DEFAULT.reduce((all, current) => ({
				...all,
				[current]: 0.5,
			}), {});

			oldKnownAppIds.forEach((app_id) => {
				const category = this.db.apps[app_id].cat;
				const vote = selectedApps.hasOwnProperty(app_id) ? 1 : -1;
				majority[category] = (majority[category] || 0) + vote;
			});

			this.conf.new_app_ids.forEach((app_id) => {
				const { cat: category } = this.db.apps[app_id];
				if (majority[category] && majority[category] > 0) {
					categoriesMeta[category].blockedTrackersCount += 1;
					categoriesMeta[category].trackers.find(t => t.id === app_id).blocked = true;
					selectedApps[app_id] = 1;
				}
			});

			// triggers a persist
			this.conf.selected_app_ids = selectedApps;
		}

		this.db.categories = categories.map(category => ({
			id: category,
			name: t(`category_${category}`),
			description: t(`category_${category}_desc`),
			img_name: (category === 'advertising') ? 'adv' : // Because AdBlock blocks images with 'advertising' in the name.
				(category === 'social_media') ? 'smed' : category, // Because AdBlock blocks images with 'social' in the name.
			num_total: categoriesMeta[category].trackers.length,
			num_blocked: categoriesMeta[category].blockedTrackersCount,
			trackers: categoriesMeta[category].trackers,
		}));

		this.conf.bugs = this.db;
		this.loadingPromiseResolver();
	}
}

export default new BugDb();
