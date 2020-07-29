/**
 * Ghostery React App Init
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo:
 *   - [ ] Add a Close & Reload notification above blue navbar.
 *   - [ ] Add tests for PanelAndroid Settings and Panel Settings sub-components
 *   - [ ] Add tests for PanelAndroid Menu and Panel Menu Sub-Components
 *   - [ ] Replace hidden tooltips on the OverviewTab with a Help Screen
 *   - [ ] Make a landscape mode: OverviewTab on left, Site/Global Blocking on right.
 *
 * @namespace  PanelAndroidClasses
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PanelAndroid from './components/PanelAndroid';

ReactDOM.render(
	(
		<PanelAndroid />
	), document.getElementById('ghostery-content'),
);
