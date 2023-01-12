/**
 * Software Licenses App
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
import React from 'react';
import ReactDOM from 'react-dom';
import License from './License';

/**
 * @class Handles a list of licenses on internal licenses.html page
 * which displays licenses for all third-party packages used by Ghostery.
 * This page is invoked form Ghostery About panel.
 * @memberOf  LicenseClasses
 */
class Licenses extends React.Component {
	/**
	 * Create page footer element.
	 * Wrapper function for dangerouslySetInnerHTML. Provides extra security
	 * @return {Object}
	 */
	static createFooterMarkup() {
		return { __html: t('license_footer') };
	}

	constructor(props) {
		super(props);
		this.state = {
			licenses: [],
		};
		fetch('/dist/licenses.json').then(async (response) => {
			const licenses = await response.json();
			this.setState({
				licenses: Object.values(licenses),
			});
		});
	}

	/**
	 * Render page.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const list = this.state.licenses.map((license, index) => (
			<License index={index} key={license.name} license={license} />
		));
		return (
			<div id="licenses-page">
				<div id="header" className="row padded-content expanded valign-middle">
					<div className="column medium-2">
						<img className="logo" src="/app/images/licenses/logo-title-white.svg" />
					</div>
					<div className="column" />
					<div className="column medium-6 text-right">
						<span style={{ fontSize: '18px', marginRight: '40px' }}>
							{ t('license_licenses') }
						</span>
					</div>
				</div>
				<div id="content">
					<div className="license-list">{ list }</div>
				</div>
				<div id="footer">
					<div className="columns copyright text-center" dangerouslySetInnerHTML={Licenses.createFooterMarkup()} />
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<Licenses />,
	document.getElementById('root')
);
