/**
 * Blocking View Component
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

/**
 * @class Implement the #blocking part of the Setup flow.
 * Offers choices to choose what should get blocked: everything, nothing,
 * ad trackers, or a custom choice.
 * @extends Component
 * @memberof SetupViews
 */
class BlockingView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			policy: this.props.policy,
		};
	}

	/**
	 * Lifecycle event
	 */
	componentWillMount() {
		this.props.actions.updateTopContentData({
			image: '/app/images/setup/circles/ghostery-block-all.svg',
			title: t('setup_blocking_view_title'),
		});
		this.props.actions.resetNavigationNextButton();
	}

	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		this._save(this.state.policy);
	}

	/**
	 * Function to respond to the onChange property
	 * @param  {Object} event The event created by onChange
	 */
	_handleChange = (event) => {
		const policy = event.target.value;
		this.setState({
			policy
		});
		let blockValue = 1;
		switch (policy) {
			case 'none':
				blockValue = 1;
				break;
			case 'ads':
				blockValue = 2;
				break;
			case 'all':
				blockValue = 3;
				break;
			case 'custom':
				blockValue = 4;
				break;
			default: break;
		}
		this.props.actions.setupStep({ key: 'setup_block', value: blockValue });
	}

	/**
	 * Function to handle saving when choosing between blocking modes
	 * @param  {string} value The type of blocking: none, ads, all, custom
	 */
	_save(value) {
		let blockValue = 1;
		switch (value) {
			case 'none':
				this.props.actions.blockNone();
				blockValue = 1;
				break;
			case 'ads':
				this.props.actions.blockAds();
				blockValue = 2;
				break;
			case 'all':
				this.props.actions.blockAll();
				blockValue = 3;
				break;
			case 'custom':
				this.props.actions.blockCustom();
				blockValue = 4;
				break;
			default: break;
		}
		this.props.actions.setupStep({ key: 'setup_block', value: blockValue });
	}

	/**
	 * Shows the custom blocking menu
	 */
	_showCustomBlock = () => {
		this.props.history.push('/blocking/custom');
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the #blocking step of the setup flow
	 */
	render() {
		return (
			<div id="blocking-view" className="row small-up-2 medium-up-4">
				<div className="columns">
					<label
						htmlFor="block-none-input"
						className={`${this.state.policy === 'none' ? 'selected' : ''} box-link selectable`}
					>
						<img src="/app/images/setup/circles/block-none.svg" />
						<span className="text">{ t('setup_blocking_view_block_nothing') }</span>
					</label>
					<input type="radio" name="blocking" value="none" id="block-none-input" checked={this.state.policy === 'none'} onChange={this._handleChange} />
				</div>
				<div className="columns">
					<label
						htmlFor="block-ads-input"
						className={`${this.state.policy === 'ads' ? 'selected' : ''} box-link selectable`}
					>
						<img src="/app/images/setup/circles/block-ads.svg" />
						<span className="text">{ t('setup_blocking_view_block_ads') }</span>
					</label>
					<input type="radio" name="blocking" value="ads" id="block-ads-input" checked={this.state.policy === 'ads'} onChange={this._handleChange} />
				</div>
				<div className="columns">
					<label
						htmlFor="block-all-input"
						className={`${this.state.policy === 'all' ? 'selected' : ''} box-link selectable`}
					>
						<img src="/app/images/setup/circles/block-all.svg" />
						<span className="text">{ t('setup_blocking_view_block_everything') }</span>
					</label>
					<input type="radio" name="blocking" value="all" id="block-all-input" checked={this.state.policy === 'all'} onChange={this._handleChange} />
				</div>
				<div className="columns">
					<label
						htmlFor="block-custom-input"
						className={`${this.state.policy === 'custom' ? 'selected' : ''} box-link selectable`}
					>
						<img src="/app/images/setup/circles/block-custom.svg" />
						<span className="text">{ t('setup_blocking_view_block_custom') }</span>
					</label>
					<input type="radio" name="blocking" value="custom" id="block-custom-input" checked={this.state.policy === 'custom'} onChange={this._handleChange} onClick={this._showCustomBlock} />
				</div>
			</div>
		);
	}
}

export default BlockingView;
