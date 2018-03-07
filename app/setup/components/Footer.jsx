/**
 * Footer Component
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

import React from 'react';

/**
 * @class Footer for the Setup flow
 * @extends React.Component
 * @memberof SetupViews
 */
class Footer extends React.Component {
	/**
	 * Wrapper function for dangerouslySetInnerHTML. Provides extra security
	 * @return {Object}
	 */
	createFooterMarkup() {
		return { __html: t('setup_footer_license') };
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Footer view
	 */
	render() {
		return (
			<div id="footer" className="row">
				<div
					className="columns small-12 text-center copyright"
					dangerouslySetInnerHTML={this.createFooterMarkup()}
				/>
			</div>
		);
	}
}

export default Footer;
