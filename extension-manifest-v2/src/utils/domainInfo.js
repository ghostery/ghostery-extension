/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2023 Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { parse } from 'tldts-experimental';
import bugDb, { getPatternId } from '../classes/BugDb';
import conf from '../classes/Conf';

export default async () => {
	await bugDb.loadingPromise;
	const db = conf.bugs;
	const domains = {};

	bugDb.engine.metadata.getPatterns().forEach((pattern) => {
		pattern.domains.forEach((domain) => {
			domains[domain] = getPatternId(pattern);
		});
	});

	function _getDomainOwner(dom) {
		if (dom in domains) {
			return db.apps[domains[dom]];
		}
		if (dom.indexOf('.') === -1) {
			return false;
		}
		return _getDomainOwner(dom.substring(dom.indexOf('.') + 1));
	}

	return {
		domains,

		getAppOwner(appId) {
			return db.apps[appId] || { name: 'Unknown', cat: 'unindentified' };
		},

		getBugOwner(bugId) {
			const appId = this.getAppForBug(bugId);
			return this.getAppOwner(appId);
		},

		getAppForBug(bugId) {
			return db.bugs[bugId]?.aid;
		},

		getDomainOwner(domain) {
			return _getDomainOwner(domain) || {
				name: parse(domain).domain,
				cat: 'unindentified',
			};
		},

		getTrackerDetails(wtmOrAppId) {
			if (db.apps[wtmOrAppId]) {
				return db.apps[wtmOrAppId];
			}
			return Object.values(db.apps).find(app => app.wtm === wtmOrAppId);
		},
	};
};
