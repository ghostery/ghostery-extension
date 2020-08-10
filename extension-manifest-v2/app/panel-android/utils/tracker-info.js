/**
 *  Tracker Info Utilities
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
/**
 * @namespace  PanelAndroidUtils
 */

import { apps } from '../../../cliqz/core/tracker_db_v2.json';

/**
 * Look up WhoTracksMe url slug
 * @param  {Int} id 	Ghostery tracker ID
 * @return {String}    	WTM slug
 */
export default function getSlugFromTrackerId(id) {
	const trackerName = apps[id] && apps[id].name;
	const trackerWtm = (Object.values(apps).find(app => app.wtm && app.name === trackerName) || {}).wtm;
	return trackerWtm || '../tracker-not-found';
}
