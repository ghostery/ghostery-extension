/**
 * Performance Component
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
 * @class Implement Perfprmance view which opens from a button in
 * the footer of the detailed view. See DetailMenu.jsx.
 * @memberof PanelClasses
 */
class Performance extends React.Component {
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
		sendMessage('ping', 'performance_learn');
		window.close();
	}
	/**
	 * Render Performance view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="performance-panel" className="coming-soon">
				<div className="detail-header">{ t('panel_detail_performance_title') }</div>
				<div className="row align-center">
					<div className="small-10 columns text-center">
						<div className="detail-icon">
							<svg width="39" height="26" viewBox="0 0 39 26">
								<g className="no-fill" fillRule="evenodd">
									<path className="fill" d="M30.364 5.828V3.635C30.364 1.627 31.996 0 34 0c2.008 0 3.636 1.634 3.636 3.635v2.193h.37c.548 0 .994.448.994.997v5.178c0 .55-.456.997-.995.997h-8.01c-.55 0-.995-.45-.995-.997V6.825c0-.55.456-.997.995-.997h.37zm.606.026l6.06.025V3.586c0-1.65-1.356-2.99-3.03-2.99-1.674 0-3.03 1.34-3.03 2.992v2.264z" />
									<path d="M13.92 11.723c-6.738 0-12.198 5.46-12.198 12.195 0 .262.023.517.04.774h24.315c.016-.257.04-.512.04-.774 0-6.735-5.46-12.195-12.198-12.195" />
									<path className="stroke" d="M13.92 11.723c-6.738 0-12.198 5.46-12.198 12.195 0 .262.023.517.04.774h24.315c.016-.257.04-.512.04-.774 0-6.735-5.46-12.195-12.198-12.195z" strokeWidth="1.5" />
									<path className="stroke" d="M12.244 19.434c.422.156.667-.14.942-.362 1.056-.847 2.11-1.695 3.167-2.54.662-.528 1.556-.254 1.75.544.088.35-.006.66-.232.943-.917 1.143-1.832 2.29-2.755 3.43-.125.157-.174.304-.167.505.053 1.535-1.157 2.767-2.674 2.737C10.94 24.665 9.8 23.59 9.71 22.27c-.098-1.377.87-2.605 2.212-2.808.107-.016.215-.02.322-.028zM2.292 18.516l3.07 1.147M22.246 19.663l3.07-1.147M13.92 11.723v2.95" strokeWidth="1.5" />
								</g>
							</svg>
						</div>
						<div className="row align-center">
							<div className="small-8 columns">
								<div className="detail-text">{ t('panel_detail_performance_text') }</div>
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

export default Performance;
