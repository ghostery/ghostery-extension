/**
 * Not Scanned Component
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
import ClassNames from 'classnames';

/**
 * @class Implements the Not Scanned component displayed in the Summary view
 * when a site is not scannable or has not yet been scanned.
 * @memberof PanelClasses
 */
const NotScanned = (props) => {
	const notScannedClassNames = ClassNames('sub-component', 'not-scanned', {
		small: props.isSmall,
	});

	return ( // eslint-disable-line arrow-parens
		<div className={notScannedClassNames}>
			<div className="not-scanned-header">
				{t('summary_page_not_scanned') }
			</div>
			<div className="not-scanned-text">
				{ t('summary_description_not_scanned_1') }
			</div>
			<div className="not-scanned-text">
				{ t('summary_description_not_scanned_2') }
			</div>
		</div>
	);
};

export default NotScanned;
