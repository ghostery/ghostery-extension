/**
 * Rewards Component
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
 * @class Implement Rewards view which opens from a button in
 * the footer of the detailed view. See DetailMenu.jsx.
 * @memberof PanelClasses
 */
class Rewards extends React.Component {
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
		sendMessage('ping', 'rewards_learn');
		window.close();
	}
	/**
	 * Render Rewards view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="rewards-panel" className="coming-soon">
				<div className="detail-header">{ t('panel_detail_rewards_title') }</div>
				<div className="row align-center">
					<div className="small-10 columns text-center">
						<div className="detail-icon">
							<svg width="31" height="27" viewBox="0 0 31 27">
								<g className="fill" fillRule="evenodd">
									<path d="M6.7 15.905h2.62v-3.172H6.7v3.172zm2.378-4.408l.038.1c1.064-.072 2.145-.05 3.188-.242 1.234-.226 1.7-1.528 1.036-2.585-.575-.912-2.043-1.098-2.632-.276-.502.7-.9 1.48-1.324 2.237-.133.24-.206.51-.306.767zm-2.102.078c-.16-.53-1.05-2.256-1.413-2.753-.043-.06-.088-.122-.136-.18-.837-1.04-2.424-.81-2.932.422-.38.918.16 2.087 1.054 2.282 1.122.244 2.266.158 3.426.23zm3.41 4.313h4.58v-3.16h-4.58v3.16zm-9.317.02h4.59v-3.183H1.07v3.182zm5.623 9.526H9.31V16.96H6.693v8.474zm3.7.044H14.2v-8.523h-3.807v8.523zm-8.56-.044h3.823V16.95H1.833v8.484zM.805 17.01c-.675-.178-.813-.087-.805-1.052.01-1.183.002-2.366.003-3.55 0-.555.15-.703.707-.703h1.167c.08 0 .16-.01.216-.014-.198-.346-.433-.662-.566-1.015-.483-1.285.086-2.736 1.28-3.358 1.243-.646 2.71-.282 3.52.89.616.893 1.09 1.864 1.52 2.858.04.097.09.194.16.346.1-.21.182-.372.253-.536.39-.89.802-1.767 1.362-2.567.487-.695 1.107-1.168 1.975-1.28 1.41-.182 2.77.826 3.004 2.235.137.824-.07 1.554-.548 2.223l-.153.21c.082.012.14.03.2.03.45-.004.898-.006 1.345-.013.335-.006.55.184.552.518.005 1.395.003 2.79 0 4.184 0 .283-.175.468-.464.508-.1.015-.2.017-.326.028v8.703c0 .102.002.204-.005.304-.027.346-.15.48-.493.533-.11.016-.22.016-.33.016H1.624c-.07 0-.137.002-.204-.002-.464-.027-.615-.182-.615-.65V17.01zM22.364 5.91V3.626C22.364 1.624 23.996 0 26 0c2.008 0 3.636 1.634 3.636 3.627V5.91h.37c.548 0 .994.454.994.995v5.28c0 .55-.456.997-.995.997h-8.01c-.55 0-.995-.455-.995-.996v-5.28c0-.55.456-.997.995-.997h.37zm.606.026l6.06.026V3.637c0-1.674-1.356-3.03-3.03-3.03-1.674 0-3.03 1.357-3.03 3.032v2.296z" />
								</g>
							</svg>
						</div>
						<div className="row align-center">
							<div className="small-8 columns">
								<div className="detail-text">{ t('panel_detail_rewards_text') }</div>
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

export default Rewards;
