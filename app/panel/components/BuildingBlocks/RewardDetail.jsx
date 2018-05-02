/**
 * Reward Detail Component
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
import { sendMessage } from '../../utils/msg';
import Tooltip from '../Tooltip';

/**
 * @class Implements the details for a single reward for for the Rewards Panel
 * @memberof PanelClasses
 */
class RewardDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			copyText: 'copy code',
		};

		// Event Bindings
		this.handleCopyClick = this.handleCopyClick.bind(this);
		this.handleRedeemClick = this.handleRedeemClick.bind(this);
	}

	/**
	 * Lifecycle event
	 */
	componentWillMount() {
		this.props.actions.setOfferRead(this.props.id);
	}

	/**
	 * Handles clicking the copy button
	 */
	handleCopyClick() {
		// Copy the reward code
		this.copyNode.querySelector('input').select();
		document.execCommand('copy');

		// Show a toast notification
		this.props.actions.showNotification({
			text: 'Rewards code copied!',
			classes: 'purple',
		});

		// Update and reset Copy Code text
		this.setState({ copyText: 'code copied' });
		setTimeout(() => {
			this.setState({ copyText: 'copy code' });
		}, 3000);

		// Send a signal to the offers black box
		this.props.actions.sendSignal('code_copied', this.props.id);
	}

	/**
	 * Handles clicking the redeem button
	 * @param  {Object} event the event object
	 */
	handleRedeemClick(event) {
		event.preventDefault();
		this.props.actions.sendSignal('offer_ca_action', this.props.id);
		sendMessage('openNewTab', {
			url: this.props.redeemUrl,
			become_active: true,
		});
		window.close();
	}

	/**
	 * Helper render function for the expires text.
	 * @return {JSX} JSX for the Rewards Detail
	 */
	renderExpiresText() {
		const { expires } = this.props;
		const delta = computeTimeDelta(new Date(expires), new Date());

		return `Expires in ${delta.count} ${delta.type}`;
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the details for a Reward
	 */
	render() {
		const {
			code,
			text,
			description,
			conditions,
			logoUrl,
			pictureUrl
		} = this.props;

		return (
			<div className="RewardDetail flex-container flex-dir-column align-justify">
				<div className="RewardDetail__image_container">
					<img className="RewardDetail__logo" src={logoUrl} />
					<img className="RewardDetail__picture" src={pictureUrl} />
				</div>
				<div className="RewardDetail__title">
					{ text }
				</div>
				<div className="RewardDetail__description">
					{ description }
				</div>
				<div className="RewardDetail__code_container flex-container align-middle align-justify">
					<span className="RewardDetail__code" ref={(node) => { this.copyNode = node; }}>
						<span>{ code }</span>
						<input readOnly type="text" value={code} />
					</span>
					<span className="RewardDetail__copy clickable" onClick={this.handleCopyClick}>
						{this.state.copyText}
					</span>
				</div>
				<div className="RewardDetail__details_container flex-container align-justify align-middle">
					<div className="RewardDetail__expires">
						{ this.renderExpiresText() }
					</div>
					{conditions && (
						<div className="RewardDetail__terms g-tooltip clickable">
							Terms and Conditions
							<Tooltip header={conditions} position="top" delay="0" theme="dark" />
						</div>
					)}
				</div>
				<div className="RewardDetail__redeem_button clickable" onClick={this.handleRedeemClick}>
					Redeem Now
				</div>
			</div>
		);
	}
}

export default RewardDetail;
