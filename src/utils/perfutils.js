/**
 * Performance utils
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
import globals from '../classes/Globals';

let PORT;
// perfReady message will come from ghostery-perf
chrome.runtime.onMessageExternal.addListener(
	(request, sender) => {
		if (sender.id === globals.GHOSTERY_PERF_ID) {
			const { name } = request;
			if (name === 'perfReady') {
				PORT = chrome.runtime.connect(globals.GHOSTERY_PERF_ID);
				return true;
			}
		}

		return false;
	});

/**
 * Send perf data unit to ghostery-perf
 * @param  	{object} perfEntry performance data
 * @param 	{object} data data passed to perfEnd. In our case - request data
 */
function _report(perfEntry, data) {
	if (PORT) {
		const report = {
			name: 'perfData', startTime: perfEntry.startTime, duration: perfEntry.duration, handler: data.handler, page_url: data.page_url, url: data.url, type: data.type
		};
		PORT.postMessage(report);
	}
}

/**
 * Set the start mark
 * @param  {string} name name of the mark, should be unique
 */
export function perfBegin(name) {
	// console.log('PERF BEGIN CALLED FOR', name);
	window.performance.mark(`BEGIN_${name}`);
}

/**
 * Set the end mark and measure the duration and clear the marks.
 * @param  {string} name name of the mark
 * @return {number}      duration
 */
export function perfEnd(name, data) {
	let entry = { name: `BEGIN_${name}`, startTime: 0, duration: 0 };
	const p = window.performance.getEntriesByName(`BEGIN_${name}`, 'mark') || [];
	if (p && p.length) {
		// console.log('BEGIN MARK WAS FOUND FOR', name);
		window.performance.mark(`END_${name}`);
		window.performance.measure(name, `BEGIN_${name}`, `END_${name}`);

		const measures = window.performance.getEntriesByName(name, 'measure') || [];
		if (measures && measures.length) {
			[entry] = measures;
			if (entry && data) {
				data.handler = name;
				_report(entry, data);
			}
		} else {
			// console.log('BAD MEASURE');
		}
	} else {
		// console.log('BEGIN MARK WAS NOT FOUND FOR', name);
	}
	window.performance.clearMarks(`BEGIN_${name}`);
	window.performance.clearMarks(`END_${name}`);

	window.performance.clearMeasures(name);
	return entry;
}

