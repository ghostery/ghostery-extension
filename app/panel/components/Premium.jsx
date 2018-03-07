/**
 * Premium Component
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
 * @class Implement Premium view which opens from a button in
 * the footer of the detailed view. See DetailMenu.jsx.
 * @memberof PanelClasses
 */
class Premium extends React.Component {
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
		sendMessage('ping', 'premium_learn');
		window.close();
	}
	/**
	 * Render Premium view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="premium-panel" className="coming-soon">
				<div className="detail-header">{ t('panel_detail_premium_title') }</div>
				<div className="row align-center">
					<div className="small-10 columns text-center">
						<div className="detail-icon">
							<svg width="35" height="29" viewBox="0 0 35 29">
								<g className="fill" fillRule="evenodd">
									<path d="M26.364 5.91V3.626C26.364 1.624 27.996 0 30 0c2.008 0 3.636 1.634 3.636 3.627V5.91h.37c.548 0 .994.454.994.995v5.28c0 .55-.456.997-.995.997h-8.01c-.55 0-.995-.455-.995-.996v-5.28c0-.55.456-.997.995-.997h.37zm.606.026l6.06.026V3.637c0-1.674-1.356-3.03-3.03-3.03-1.674 0-3.03 1.357-3.03 3.032v2.296z" />
									<path className="stroke" d="M8.4 11.663H5.788l.95 3.93 1.662-3.93zm9.813.003H15.6l1.656 3.91c.015 0 .03-.004.044-.007l.913-3.904zm.345.236l-.973 4.16h4.49l-3.517-4.16zM5.445 11.9l-3.518 4.16H6.45c-.334-1.385-.663-2.75-1.005-4.16zm9.764-.165l-2.842 4.326h4.67c-.61-1.445-1.213-2.87-1.83-4.325zm-6.42 0l-1.826 4.322h4.666l-2.84-4.322zm.414-.076L12 15.913l2.794-4.255h-5.59zm12.858 4.81c-.077-.008-.108-.012-.14-.012-1.434 0-2.87.002-4.306-.004-.14 0-.182.07-.23.176-1.47 3.337-2.944 6.674-4.417 10.01-.022.05-.04.1-.06.15l.03.01c3.03-3.433 6.063-6.867 9.122-10.33zm-11 10.33l.03-.014-.068-.163c-1.47-3.33-2.942-6.66-4.408-9.993-.06-.134-.13-.177-.273-.176-1.394.006-2.79.003-4.183.003h-.232c3.07 3.475 6.1 6.91 9.133 10.343zm.733-10.326H7.013c1.59 3.63 3.168 7.237 4.746 10.844l.035-.014v-10.83zm.42-.007v10.846c.01 0 .02.003.03.005l4.79-10.85h-4.82zm-.193-5.462c2.11 0 4.22.002 6.33-.004.21 0 .353.07.488.23 1.32 1.568 2.643 3.13 3.966 4.694.262.31.26.387-.012.695L12.4 28.387c-.036.04-.07.082-.108.122-.203.22-.385.223-.584-.002-.565-.636-1.127-1.275-1.69-1.913l-8.8-9.962c-.29-.33-.29-.395-.01-.726 1.31-1.55 2.623-3.095 3.926-4.65.155-.184.317-.258.557-.257 2.112.008 4.222.005 6.332.005z" strokeWidth=".5" />
								</g>
							</svg>
						</div>
						<div className="row align-center">
							<div className="small-8 columns">
								<div className="detail-text">{ t('panel_detail_premium_text') }</div>
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

export default Premium;
