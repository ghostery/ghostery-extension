/**
 * Ghostery React App Init
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
 * @namespace  PanelAndroidUIClasses
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Panel from './components/Panel';

ReactDOM.render(
	(
		<Panel />
	), document.getElementById('ghostery-content'),
);
