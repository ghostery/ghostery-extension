/**
 * NotScanned Component
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

import React, { Component } from 'react';
/**
 * @class Implement Not Scanned component to be displayed in main panel
 * when a site is not scannable or has not been scanned.
 * @memberof PanelClasses
 */
const NotScanned = (props) => ( // eslint-disable-line arrow-parens
	<div className="row not-scanned-wrapper">
		<div className="columns text-center">
			<div className="title">
				{t('summary_page_not_scanned') }
			</div>
			<div className="text">
				{ t('summary_description_not_scanned_1') }
				<br /><br />
				{ t('summary_description_not_scanned_2') }
			</div>
		</div>
	</div>
);

export default NotScanned;
