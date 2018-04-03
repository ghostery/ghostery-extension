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
			rewardCode: 'SDF75DSUI90',
			copyText: t('rewards_copy_code'),
			expireTime: '14 days',
			termsLink: 'https://www.ghostery.com/about-ghostery/browser-extension-privacy-policy/'
		};
		this.close = this.close.bind(this);
		this.copyCode = this.copyCode.bind(this);
	}

	copyCode() {
		document.querySelector('.reward-code-input').select();
		document.execCommand('copy');
		this.setState({
			copyText: `${t('rewards_code_copied')}!`
		});
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.setState({
				copyText: t('rewards_copy_code')
			});
		}, 3000);
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
								<a onClick={this.copyCode}>{this.state.copyText}</a>
							</div>
							<div className="reward-footer">
								<span> {t('rewards_expire')} { this.state.expireTime } </span>
								<a target="_blank" href={ this.state.termsLink }> { t('rewards_terms_conditions') } </a>
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
