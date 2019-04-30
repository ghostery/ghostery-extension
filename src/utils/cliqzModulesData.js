/**
 * Methods for retrieving antitracking and adblocking data from Cliqz modules
 * Used by BrowserButton and PanelData
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019  Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import conf from '../classes/Conf';
import cliqz from '../classes/Cliqz';

const { adblocker, antitracking } = cliqz.modules;

export function getCliqzAntitrackingData(tabId) {
	return new Promise((resolve) => {
		if (!conf.enable_anti_tracking || !antitracking.background) {
			resolve({
				totalUnsafeCount: 0
			});
		}

		// antitracking.background.actions.aggregatedBlockingStats(tabId).then((antitrackingData) => {
		antitracking.background.actions.getGhosteryStats(tabId).then((antitrackingData) => {
		let totalUnsafeCount = 0;
			for (const category in antitrackingData) {
				if (antitrackingData.hasOwnProperty(category)) {
					for (const app in antitrackingData[category]) {
						if (antitrackingData[category][app] === 'unsafe') {
							totalUnsafeCount++;
						}
					}
				}
			}
			antitrackingData.totalUnsafeCount = totalUnsafeCount;

			console.error('Object returned by Cliqz antitracking.background.actions.getGhosteryStats(tabId)');
			console.error(antitrackingData);

			resolve(antitrackingData);
		}).catch(() => {
			resolve({
				totalUnsafeCount: 0
			});
		});
	});
}

export function getCliqzAdblockingData(tabId) {
	if (!conf.enable_ad_block || !adblocker.background) {
		return {
			totalCount: 0
		};
	}

	const adBlocking = adblocker.background.actions.getAdBlockInfoForTab(tabId);
	return adBlocking || { totalCount: 0 };
}

export function sendCliqzModulesData(tabId, callback) {
	const modules = { adblock: {}, antitracking: {} };

	modules.adblock = getCliqzAdblockingData(tabId);
	// TODO convert to use finally to avoid duplication (does our Babel transpile it?)
	getCliqzAntitrackingData(tabId).then((antitrackingData) => {
		modules.antitracking = antitrackingData;
		callback(modules);
	}).catch(() => {
		callback(modules);
	});
}
