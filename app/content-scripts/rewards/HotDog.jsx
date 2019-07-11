/**
 * HotDog Component
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

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

/**
 * @class Create the Rewards "HotDog", aka UI element
 * @memberOf RewardsContentScript
 */
class HotDog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			closed: false
		};
		this.shownSignal = false;
		this.iframeEl = window.parent.document.getElementById('ghostery-iframe-container');

		if (this.iframeEl) {
			this.iframeEl.classList = '';
			this.iframeEl.classList.add('hot-dog');
		}

		this.ghostyStar = `url(${chrome.extension.getURL('app/images/rewards/ghosty-star.svg')})`;
		this.closeIcon = `url(${chrome.extension.getURL('app/images/rewards/light-x.svg')})`;
		this.close = this.close.bind(this);
		this.navigate = this.navigate.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.reward && nextProps.reward !== null && !this.shownSignal) {
			this.props.actions.sendSignal('offer_notification_hotdog');
			this.shownSignal = true;
		}
	}

	navigate() {
		this.props.actions.sendSignal('offer_click_hotdog');
		if (this.iframeEl) {
			this.iframeEl.classList.add('offer-card');
		}
		this.props.history.push('/offercard');
	}

	close() {
		this.props.actions.sendSignal('offer_closed_hotdog');
		if (this.iframeEl) {
			this.iframeEl.classList = '';
		}
		this.setState({
			closed: true
		});
	}

	render() {
		return (
			<div className="ghostery-rewards-component">
				{ this.state.closed !== true && (
					<div>
						<div onClick={this.navigate} className="hot-dog-container" style={{ backgroundImage: this.ghostyStar }}>
							<div className="ghostery-reward-text">
								{t('rewards_new_text')}
							</div>
						</div>
						<div className="hot-dog-close" onClick={this.close} style={{ backgroundImage: this.closeIcon }} />
					</div>
				)}
			</div>
		);
	}
}

export default withRouter(HotDog);
