/**
 * Software Licenses App
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
import ReactDOM from 'react-dom';
import Markdown from 'react-remarkable';
import licenses from '../../tools/licenses/licenses.json';
import License from './License';

const licensesArray = [];
Object.keys(licenses).forEach((key) => {
	licensesArray.push(licenses[key]);
});
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
	createFooterMarkup() {
		return { __html: t('setup_footer_license') };
	}
	/**
	 * Render page.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const list = licensesArray.map((license, index) => (
			<License index={index} key={license.name} license={license} />
		));
		return (
			<div id="licenses-page">
				<div id="header" className="row padded-content expanded valign-middle">
					<div className="column medium-2">
						<img className="logo" src="/app/images/setup/logo-title-white.svg" />
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
					<div className="columns copyright text-center" dangerouslySetInnerHTML={this.createFooterMarkup()} />
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<Licenses />,
	document.getElementById('root')
);
