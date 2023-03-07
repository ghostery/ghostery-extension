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
		if (just_upgraded) {
			const newKnownAppIds = patterns.map(getPatternId);
			const oldKnownAppIds = this.conf.known_app_ids;
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
			Object.values(categoriesMeta).forEach((meta) => {
				if (meta.blockedTrackersCount >= (meta.trackers.length / 2)) {
					let newlyBlockedCount = 0;
					meta.trackers.forEach((tracker) => {
						if (!tracker.blocked && !selectedApps.hasOwnProperty(tracker.id)) {
							selectedApps[tracker.id] = 1;
							tracker.blocked = true;
							newlyBlockedCount += 1;
						}
					});
					meta.blockedTrackersCount += newlyBlockedCount;
				}
			});
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
