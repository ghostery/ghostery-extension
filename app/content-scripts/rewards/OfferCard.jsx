import React, { Component } from 'react';
import { Link } from "react-router-dom";
import msgModule from '../utils/msg';
import { log } from '../../../src/utils/common';
import '../../scss/rewards.scss';

const msg = msgModule('rewards');
const { sendMessage } = msg;
const { onMessage } = chrome.runtime;

class OfferCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			closed: false,
			rewardCode: 'SDF75DSUI90'
		};
		this.close = this.close.bind(this);
		this.copyCode = this.copyCode.bind(this);
	}

	copyCode() {
		console.log('copy code func')
		document.querySelector('.reward-code-input').select();
		document.execCommand('copy');
	}

	close() {
		this.setState({
			closed: true
		});
	}

	render() {
		return (
			<div>
				{ this.state.closed !== true &&
				<div className="ghostery-reward-card">
					<div className="reward-card-header">
						<img className="rewards-logo-beta" />
						<div className="reward-card-close" onClick={this.close} />
					</div>
					<div className="reward-card-content">
						<div className="reward-content-header">
							content header
						</div>
						<div className="reward-content-img">
							reward image
						</div>
						<div className="flex-grow" />
						<div className="reward-content-detail">
							<span className="reward-title">
								{ this.state.rewardTitle }
							</span>
							<p className="reward-description">
								{/* Description of the offer. There is a lot of exciting stuff going on. */}
							</p>
							<div className="reward-code">
								<input readOnly className="reward-code-input" value={this.state.rewardCode} type="text" />
								<a onClick={this.copyCode}>{t('rewards_copy_code')}</a>
							</div>
							<div className="reward-footer">
								reward detail footer
							</div>
						</div>
						<button className="reward-redeem">
							{t('rewards_redeem_now')}
						</button>
					</div>
				</div>}
			</div>
		);
	}
}

export default OfferCard;
