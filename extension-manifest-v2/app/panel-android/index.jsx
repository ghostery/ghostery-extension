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
 */

/**
 * @namespace  PanelAndroidClasses
 */

import React from 'react';
import ReactDOM from 'react-dom';

import PanelAndroid from './components/PanelAndroid';
import '../panel/elements/onboarding-state';

import '../scss/panel_android.scss';

ReactDOM.render(
	(
		<PanelAndroid />
	), document.getElementById('ghostery-content'),
);
