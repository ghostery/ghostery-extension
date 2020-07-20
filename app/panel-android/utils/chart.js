/**
 * Chart Utilities
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
/**
 * @namespace  PanelAndroidUtils
 */

export default function fromTrackersToChartData(trackers) {
	if (trackers.length < 1) {
		return {
			sum: 0,
			arcs: [],
		};
	}

	const arcs = [];
	let startAngle = 0;

	const sum = trackers.map(tracker => tracker.numTotal).reduce((a, b) => a + b, 0);

	for (let i = 0; i < trackers.length; i += 1) {
		const endAngle = startAngle + (trackers[i].numTotal * (360 / sum));

		arcs.push({
			start: startAngle,
			end: endAngle,
			category: trackers[i].id,
		});

		startAngle = endAngle;
	}

	return {
		sum,
		arcs,
	};
}
