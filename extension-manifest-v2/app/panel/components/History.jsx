/**
 * History Component
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
import { sendMessage } from '../utils/msg';
/**
 * @class Implement History view which opens from a button in
 * the footer of the detailed view. See DetailMenu.jsx.
 * @memberof PanelClasses
 */
class History extends React.Component {
	constructor(props) {
		super(props);

		// event bindings
		this.openNewTab = this.openNewTab.bind(this);
	}
	/**
	 * Open informational page from 'Learn More' button on the view.
	 */
	openNewTab() {
		sendMessage('openNewTab', {
			url: 'https:\/\/www.ghostery.com/faqs/what-new-ghostery-features-can-we-expect-in-the-future/',
			become_active: true,
		});
		sendMessage('ping', 'history_learn');
		window.close();
	}
	/**
	 * Render History view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="history-panel" className="coming-soon">
				<div className="detail-header">{ t('panel_detail_history_title') }</div>
				<div className="row align-center">
					<div className="small-10 columns text-center">
						<div className="detail-icon">
							<svg viewBox="0 0 26 28" width="26" height="28">
								<g className="fill" transform="translate(0 4)">
									<circle cx="2.21" cy="12.694" r="1.404" />
									<path d="M13.253 11.842v-6.4h-1.786v7.338h.172l5.192 4.844 1.22-1.307-4.8-4.475z" />
									<path d="M3.688 4.864C5.81 1.918 9.272 0 13.18 0c6.46 0 11.694 5.235 11.694 11.694 0 6.458-5.235 11.693-11.693 11.693-4.83 0-8.977-2.93-10.76-7.11H4.2c1.668 3.263 5.064 5.497 8.98 5.497 5.568 0 10.08-4.513 10.08-10.08 0-5.568-4.512-10.08-10.08-10.08-3.3 0-6.23 1.586-8.07 4.038l2.676 1.484-5.872 2.277-1.18-6.187 2.954 1.638z" />
								</g>
							</svg>
						</div>
						<div className="row align-center">
							<div className="small-8 columns">
								<div className="detail-text">{ t('panel_detail_history_text') }</div>
							</div>
						</div>
						<hr />
						<div className="button small hollow" onClick={this.openNewTab}>
							{ t('panel_detail_learn_more') }
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default History;
