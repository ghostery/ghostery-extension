/**
 * React Router History
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

import createMemoryHistory from 'history/createMemoryHistory';
/**
 * @var {Object} history object to be used by React Routerfor navigation within the Ghostery panel.
 * @memberOf PanelUtils
 */
const history = createMemoryHistory({
	initialEntries: ['/'],
	initialIndex: 0
});

export default history;
