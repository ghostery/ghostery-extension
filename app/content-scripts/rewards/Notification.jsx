/**
 * Notification Component
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

/**
 * @class Handles notifications for Rewards
 * @memberOf RewardsContentScript
 */
class Notification extends Component {
	constructor(props) {
		super(props);
		this.closeIcon = `url(${chrome.extension.getURL('app/images/rewards/white-x.svg')})`;
		this.state = {
			closed: false
		};

		this.closeNotification = this.closeNotification.bind(this);
	}

	closeNotification(confirm) {
		this.setState({
			closed: true
		});
		if (typeof this.props.data.closeCallback === 'function') {
			this.props.data.closeCallback(confirm);
		}
	}

	render() {
		return (
			<div>
				{!this.state.closed && (
					<div className="rewards-notification-container">
						<div className="rewards-notification-overlay" />
						<div className="rewards-popup-container">
							<div className={`rewards-notification ${this.props.data.type}`}>
								<div className="close" onClick={() => { this.closeNotification(); }} style={{ backgroundImage: this.closeIcon }} />
								<div className="notification-text">
									{this.props.data.message}
								</div>
								{this.props.data.buttons && (
									<div className="notification-buttons">
										<button type="button" className="btn" onClick={() => { this.closeNotification(true); }}>
											{t('rewards_yes')}
										</button>
										<button type="button" className="btn" onClick={() => { this.closeNotification(false); }}>
											{t('rewards_no')}
										</button>
									</div>
								)}
								{this.props.data.textLink
									&& (
										<a
											className="notification-text"
											href={this.props.data.textLink.href}
											target="_blank"
											rel="noopener noreferrer"
											onClick={() => {
												if (this.props.data.textLink.callback) {
													this.props.data.textLink.callback();
												}
											}}
										>
											{this.props.data.textLink.text}
										</a>
									)
								}
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default Notification;
