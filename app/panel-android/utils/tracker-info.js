/**
 *  Tracker Info Utilities
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
/**
 * @namespace  PanelAndroidUtils
 */

import { apps } from '../../../cliqz/antitracking/tracker_db_v2.json';

// Link to whotracks.me website
export default function getUrlFromTrackerId(id) {
	const trackerName = apps[id].name;
	const trackerWtm = (Object.values(apps).find(app => app.wtm && app.name === trackerName) || {}).wtm;
	const slug = trackerWtm || '../tracker-not-found';
	return `https://whotracks.me/trackers/${slug}.html`;
}
