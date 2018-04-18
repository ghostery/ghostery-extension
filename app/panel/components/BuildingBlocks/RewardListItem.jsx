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
import { Link } from 'react-router-dom';
import ClassNames from 'classnames';
import { computeTimeDelta } from '../../utils/utils';

/**
 * @class Implements a single reward in a list for the Rewards Panel
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
	 * @param  {Object} event the click event
	 */
	clickCloseButton(event) {
		// Prevent the event from propagating and linking to the Reward Detail
		event.preventDefault();

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
		const { unread, text, id } = this.props;
		const itemClassName = ClassNames('RewardListItem', 'row', {
			'RewardListItem--unread': unread,
			clickable: true,
		});
		const buttonContainerClassNames = ClassNames('flex-container flex-dir-column align-justify full-height', {
			'RewardsPanel--more-right': true,
		});
		const closeButtonClassNames = ClassNames({
			RewardListItem__close_button: true,
			'RewardListItem--add-padding': true,
			clickable: true,
		});
		const detailsButtonClassNames = ClassNames({
			RewardListItem__details_link: true,
			'RewardListItem--add-padding': true,
		});

		return (
			<Link to={`/detail/rewards/detail/${id}`} className={itemClassName}>
				<div className="small-12 columns">
					<div className="flex-container align-middle full-height">
						<div className="RewardListItem__image_container flex-container align-center">
							<svg height="50" width="95" fill="none" stroke="#4a4a4a" strokeWidth="2">
								<path d="M0,0L95,50M95,0L0,50" />
							</svg>
						</div>
						<div className="flex-child-grow">
							<div>{ text }</div>
							<div>{ this.renderExpiresText() }</div>
						</div>
						<div className={buttonContainerClassNames}>
							<div className={closeButtonClassNames} onClick={this.clickCloseButton}>
								<svg height="12" width="12">
									<path d="M2,2L10,10M2,10L10,2" />
								</svg>
							</div>
							<div className={detailsButtonClassNames}>
								<svg height="18" width="12">
									<path d="M2,2L10,9L2,16" />
								</svg>
							</div>
						</div>
					</div>
				</div>
			</Link>
		);
	}
}

export default RewardListItem;
