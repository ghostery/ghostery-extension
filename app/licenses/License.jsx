/**
 * Software License Component
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
 * @namespace LicenseClasses
 */
import React, { Component } from 'react';
import Markdown from 'react-remarkable';
/**
 * @class Handles license entry on internal licenses.html page
 * which displays licenses for all third-party packages used by Ghostery
 * @memberOf  LicenseClasses
 */
class License extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			expanded: false
		};
		this.toggleLicenseText = this.toggleLicenseText.bind(this);
	}
	/**
	 * Toggle expansion of a license full text.
	 */
	toggleLicenseText() {
		this.setState({ expanded: !this.state.expanded });
	}
	/**
	 * Render single license entry.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const { license } = this.props;
		return (
			<div className="license">
				<div>{`${t('license_module')}: ${license.name}`}</div>
				<a href={license.repository} target="_blank" rel="noopener noreferrer"><span style={{ color: '#4A4A4A' }}>{`${t('license_repository')}:`}</span>{` ${license.repository || t('license_information_missing')}`}</a>
				<div>{`${t('license_type')}: ${license.licenses}`}</div>
				<div>{`${t('license_publisher')}: ${license.publisher || t('license_unknown')}`}</div>
				<div>{`${t('license_url')}: ${license.url || t('license_unknown')}`}</div>
				<div>{`${t('license_email')}: ${license.email || t('license_unknown')}`}</div>
				<div style={{ cursor: 'pointer', fontWeight: '700' }} onClick={this.toggleLicenseText}>
					{t('license_text')}
					{
						this.state.expanded &&
						<div className="license-text">
							<Markdown source={license.licenseText || t('license_generic')} />
						</div>
					}
				</div>
			</div>
		);
	}
}

export default License;
