/**
 * Latency Class
 *
 * Generates tracker latency data
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

import _ from 'underscore';
import foundBugs from './FoundBugs';
/**
 * Class for handling request latency data.
 * @memberOf  BackgroundClasses
 */
class Latency {
	constructor() {
		// tracker latencies (unblocked requests belonging to trackers).
		this.latencies = {}; // { request_id: { start_time: string, bug_id: int } }
	}

	/**
	 * Log tracker data pass to ghostrank.recordStats.
	 * @param  {Object} details - data from webRequest event.
	 */
	logLatency(details) {
		const request_id = details.requestId;
		const tab_id = details.tabId;

		if (!this.latencies.hasOwnProperty(request_id)) {
			return 0;
		}
		// If the latencies object for this request id is empty then this is
		// not a tracker. Safe to delete object and return.
		if (_.isEmpty(this.latencies[request_id])) {
			delete this.latencies[request_id];
			return 0;
		}

		// TRACKER1 --> NON-TRACKER --> TRACKER2
		// TRACKER2's onBeforeRequest sync callback could maybe fire before
		// NON-TRACKER's onBeforeRedirect async callback
		if (!this.latencies[request_id].hasOwnProperty(details.url)) {
			return 0;
		}

		const {
			start_time, bug_id
		} = this.latencies[request_id][details.url];

		delete this.latencies[request_id][details.url];
		if (_.isEmpty(this.latencies[request_id])) {
			delete this.latencies[request_id];
		}

		const blocked = details.error === 'net::ERR_BLOCKED_BY_CLIENT' || (details.redirectUrl && !details.redirectUrl.startsWith('http'));
		let latency = Math.round(details.timeStamp - start_time);

		// check for slow tracker issue
		const appWithLatencyId = foundBugs.checkLatencyIssue(tab_id, bug_id, latency);

		// special case for blocked by another extension, treat as blocked normally
		// if they want, they can look at 'bl' to see if blocked by Ghostery
		if (blocked) {
			latency = -1;
		}

		return appWithLatencyId;
	}
}

// return the class as a singleton
export default new Latency();
