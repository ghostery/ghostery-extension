/**
 * Help Component
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
import { sendMessage, openSupportPage } from '../utils/msg';
/**
 * @class Implement Help view which opens from the main drop-down menu.
 * @memberof PanelClasses
 */
class Help extends React.Component {
	/**
	 * Handle click on 'Set Up Ghostery' menu item
	 */
	openHubTab = (e) => {
		e.preventDefault();
		sendMessage('openNewTab', {
			url: chrome.runtime.getURL('./app/templates/hub.html'),
			become_active: true,
		});
		window.close();
	}

	/**
	 * Handle click on 'Support' menu item
	 */
	openSupportTab = (e) => {
		e.preventDefault();
		openSupportPage();
		window.close();
	}

	/**
	 * Render Help view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="content-help">
				<div className="row">
					<div className="small-12 columns">
						<h1>{ t('panel_help_panel_header') }</h1>
						<div className="support-section">
							<a href="#" onClick={this.openHubTab}>{ t('panel_help_setup') }</a>
						</div>
						<div className="support-section">
							<h3>{ t('panel_help_questions_header') }</h3>
							<a href="https://www.ghostery.com/faqs/" target="_blank" rel="noopener noreferrer">{ t('panel_help_faq') }</a>
							<a href="https://www.ghostery.com/survey/in-app" target="_blank" rel="noopener noreferrer">{ t('panel_help_feedback') }</a>
							<a href="#" onClick={this.openSupportTab}>{ t('panel_help_support') }</a>
						</div>
						<div className="support-section">
							<h3>{ t('panel_help_contact_header') }</h3>
							<a className="info" href="mailto:info@ghostery.com">info@ghostery.com</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Help;
