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
 *   - [next] Move Settings Icon to OverviewTab Header, change icon to a Hamburger,
 *         have it open the Menu with settings as a menu item, and make all
 *         menu sub-views mobile friendly.
 *   - [ ] Add tests for PanelAndroid Settings and Panel Settings sub-components
 *   - [ ] Add tests for PanelAndroid Menu and Panel Menu Sub-Components
 *   - [ ] See if Tino is OK with the react-window List library for rendering lists
 *   - [ ] See if Vinny likes what I did with SmartBlock & CliqzFeatures
 *   - [ ] Move Account Icon to OverviewTab Header and add Account Views
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
