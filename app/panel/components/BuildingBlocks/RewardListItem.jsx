/**
 * Reward List Item Component
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
import ClassNames from 'classnames';
import { computeTimeDelta } from '../../utils/utils';

/**
 * @class Implements a single reward for the Rewards Panel
 * @memberof PanelClasses
 */
class RewardListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		// Event Bindings
		this.clickCloseButton = this.clickCloseButton.bind(this);
	}

	/**
	 * Handle clicking on the close button
	 */
	clickCloseButton() {
		const { id } = this.props;
		this.props.clickCloseButton(id);
	}

	/**
	 * Helper render function for the expires text.
	 * @return {JSX} JSX for the Rewards Items List
	 */
	renderExpiresText() {
		const { expires } = this.props;
		const delta = computeTimeDelta(new Date(expires), new Date());

		return `Expires in ${delta.count} ${delta.type}`;
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering a Reward within the Rewards List
	 */
	render() {
		const { unread, text } = this.props;
		const itemClassName = ClassNames('RewardListItem', 'row', {
			'RewardListItem--unread': unread,
			clickable: true,
		});
		const closeButtonClassNames = ClassNames({
			'RewardsPanel--send-right': true,
			'RewardListItem--add-padding': true,
			'align-self-top': true,
			clickable: true,
		});

		return (
			<div className={itemClassName}>
				<div className="small-12 columns">
					<div className="flex-container align-middle full-height">
						<div className="RewardListItem__image_container flex-container align-center">
							<svg height="50" width="95" fill="none" stroke="#4a4a4a" strokeWidth="2">
								<path d="M0,0L95,50M95,0L0,50" />
							</svg>
						</div>
						<div>
							<div>{ text }</div>
							<div>{ this.renderExpiresText() }</div>
						</div>
						<div className={closeButtonClassNames} onClick={this.clickCloseButton}>
							<svg height="12" width="12" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round">
								<path d="M2,2L10,10M2,10L10,2" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default RewardListItem;
