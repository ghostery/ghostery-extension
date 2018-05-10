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
 * @memberof PanelBuildingBlocks
 */
class RewardListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		// Event Bindings
		this.handleClick = this.handleClick.bind(this);
		this.clickCloseButton = this.clickCloseButton.bind(this);
	}

	/**
	 * Handle the click event: everything normal unless it is disabled
	 * @param  {Object} event the click event
	 */
	handleClick(event) {
		const { disabled, unread, id } = this.props;
		if (disabled) {
			event.preventDefault();
		} else {
			if (unread) {
				this.props.actions.sendSignal('offer_click_specific_new', id);
			}
			this.props.actions.sendSignal('offer_click_specific', id);
		}
	}

	/**
	 * Handle clicking on the close button
	 * @param  {Object} event the click event
	 */
	clickCloseButton(event) {
		// Prevent the event from propagating and linking to the Reward Detail
		event.preventDefault();

		const { id } = this.props;
		this.props.actions.removeOffer(id);
		this.props.actions.sendSignal('remove_offer_link', id);
	}

	/**
	 * Helper render function for the expires text.
	 * @return {JSX} JSX for the Rewards Items List
	 */
	renderExpiresText() {
		const { expires } = this.props;
		const delta = computeTimeDelta(new Date(expires), new Date());
		return t('rewards_expires_in', [delta.count, t(`rewards_expires_in_${delta.type}`)]);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering a Reward within the Rewards List
	 */
	render() {
		const {
			id,
			isLong,
			text,
			unread,
			disabled,
			logoUrl,
			pictureUrl
		} = this.props;
		const itemClassName = ClassNames('RewardListItem', 'row', {
			'RewardListItem--greyscale': disabled,
			'RewardListItem--unread': unread,
			'RewardListItem--elongated': isLong,
			'not-clickable': disabled,
			clickable: !disabled,
		});

		return (
			<Link to={`/detail/rewards/detail/${id}`} className={itemClassName} onClick={this.handleClick}>
				<div className="flex-container align-middle full-height full-width">
					<div className="RewardListItem__image_container">
						<img className="RewardListItem__image" src={logoUrl} />
					</div>
					<div className="flex-child-grow">
						<div className="RewardListItem__text">{ text }</div>
						<div className="RewardListItem__expires">{ this.renderExpiresText() }</div>
					</div>
					<div className="flex-container align-justify flex-dir-column full-height">
						<div className="RewardListItem__close_button clickable" onClick={this.clickCloseButton}>
							<svg height="10" width="10" fillRule="evenodd">
								<path d="M6.719 5l2.923-2.924A1.216 1.216 0 0 0 7.924.356L5 3.281 2.076.356a1.216 1.216 0 1 0-1.72 1.72L3.28 5 .356 7.924a1.216 1.216 0 0 0 1.719 1.72L5 6.719l2.924 2.923a1.216 1.216 0 1 0 1.72-1.719L6.719 5z" />
							</svg>
						</div>
						<div className="RewardListItem__details_link">
							<svg height="16" width="10" fillRule="evenodd">
								<path d="M0 13.881l1.892 1.833L10 7.857 1.892 0 0 1.833l6.216 6.024z" />
							</svg>
						</div>
					</div>
				</div>
			</Link>
		);
	}
}

export default RewardListItem;
