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
class NotScanned extends React.Component {
	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Not Scanned text on the Summary View
	 */
	render() {
		const notScannedClassNames = ClassNames('sub-component', 'not-scanned', {
			small: this.props.isSmall,
		});

		return (
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
	}
}

export default NotScanned;
