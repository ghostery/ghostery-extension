/**
 * About Component
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
import globals from '../../../src/classes/Globals';
import { sendMessage } from '../utils/msg';

const { BROWSER_INFO, EXTENSION_VERSION } = globals;
/**
 * @class Implement About view which opens from the main drop-down menu.
 * @memberof PanelClasses
 */
class About extends React.Component {
	/**
	 * Open internal Licenses page with licenses of
	 * all third-party packages used by Ghostery.
	 * @static
	 */
	static openNewTab() {
		sendMessage('openNewTab', {
			url: chrome.runtime.getURL('./app/templates/licenses.html'),
			become_active: true,
		});
		window.close();
	}
	/**
	 * Render About panel.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="content-about">
				<div className="row">
					<div className="small-12 columns">
						<h1>{ t('panel_about_panel_header') }</h1>
						<div className="support-section">
							<h3>{ t('panel_about_version_header', [BROWSER_INFO.displayName, EXTENSION_VERSION]) }</h3>
							<a href="https://github.com/ghostery/ghostery-extension/releases" target="_blank" rel="noopener noreferrer">
								{ t('panel_about_release_notes') }
							</a>
							<a href="https://www.mozilla.org/en-US/MPL/2.0/" target="_blank" rel="noopener noreferrer">
								{ t('panel_about_license') }
							</a>
							<a href="https://www.ghostery.com/about-ghostery/browser-extension-privacy-policy/" target="_blank" rel="noopener noreferrer">
								{ t('panel_about_privacy_statement') }
							</a>
							<div onClick={About.openNewTab}>
								{ t('panel_about_licenses') }
							</div>
							<a href="https://www.ghostery.com/" target="_blank" rel="noopener noreferrer">Ghostery.com</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default About;
