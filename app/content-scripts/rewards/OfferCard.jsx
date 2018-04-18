import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import msgModule from '../utils/msg';
import { log } from '../../../src/utils/common';
import Notification from './Notification';

const msg = msgModule('rewards');
const { sendMessage } = msg;
const { onMessage } = chrome.runtime;

class OfferCard extends Component {
	constructor(props) {
		super(props);
		console.log('constructor props:', props);
		this.state = {
			closed: false,
			copyText: t('rewards_copy_code'),
			showNotification: false
		};

		this.iframeEl = parent.document.getElementById('ghostery-iframe-container');
		if (this.iframeEl) {
			this.iframeEl.classList = '';
			this.iframeEl.classList.add('offer-card');
		}

		this.betaLogo = `url(${chrome.extension.getURL('app/images/rewards/ghostery-rewards-beta.png')})`;
		this.closeIcon = `url(${chrome.extension.getURL('app/images/drawer/x.svg')})`;
		this.ghostyGrey = `url(${chrome.extension.getURL('app/images/rewards/ghosty-grey.svg')})`;
		this.kebabIcon = `url(${chrome.extension.getURL('app/images/rewards/settings-kebab.svg')})`;

		this.close = this.close.bind(this);
		this.copyCode = this.copyCode.bind(this);
		this.disableRewards = this.disableRewards.bind(this);
	}

	copyCode() {
		ReactDOM.findDOMNode(this).querySelector('.reward-code-input').select();
		document.execCommand('copy');

		// 'copied' feedback for user
		this.setState({
			copyText: `${t('rewards_code_copied')}!`
		});

		// prevent multiple clicks
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.setState({
				copyText: t('rewards_copy_code')
			});
		}, 3000);
	}

	disableRewards() {
		this.setState({
			showNotification: true
		});
	}

	close() {
		if (this.iframeEl) {
			this.iframeEl.classList = '';
		}
		this.setState({
			closed: true
		});
	}

	render() {
		console.log('render props:', this.props);
		console.log('render state:', this.state);
		return (
			<div className="ghostery-rewards-component">
				{ this.state.closed !== true &&
				<div className="ghostery-reward-card">
					{ this.state.showNotification &&
						<Notification closeCallback={this.close} />
					}
					<div className="reward-card-header">
						<div className="rewards-logo-beta" style={{backgroundImage: this.betaLogo}} />
						<div className="reward-card-close" onClick={this.close} style={{backgroundImage: this.closeIcon}} />
					</div>
					<div className="reward-content">
						<div className="reward-content-header">
							<div className="flex-grow" />
							<div className="reward-company-logo">
								<img src={this.props.reward.companyLogo} />
							</div>
							<div className="reward-settings-kebab" style={{backgroundImage: this.kebabIcon}} />
						</div>
						<div className="reward-content-img">
							<div className="flex-grow" />
							<img src={this.props.reward.contentImg} />
							<div className="flex-grow" />
						</div>
						<div className="reward-content-detail">
							<span className="reward-benefit">
								{ this.props.reward.benefit }
							</span>
							<span className="reward-headline">
								{this.props.reward.headline}
							</span>
							<span className="reward-description">
								{ this.props.reward.description }
							</span>
						</div>
						<div className="reward-code">
							<div>
								{this.props.reward.rewardCode}
								<input readOnly className="reward-code-input" value={this.props.reward.rewardCode} type="text" />
							</div>
							<a onClick={this.copyCode}>{this.state.copyText}</a>
						</div>
						<div className="reward-content-footer">
							<span> {t('rewards_expire')} { this.props.reward.expireTime } </span>
							<a target="_blank" href={this.props.reward.termsLink}> { t('rewards_terms_conditions') } </a>
						</div>
						<a target="_blank" href={this.props.reward.redeemLink} className="reward-redeem">
							{t('rewards_redeem_now')}
						</a>
					</div>
					<div className="reward-footer">
						<div className="reward-feedback">
							<div className="reward-smile" />
							<a onClick={this.disableRewards}>{t('rewards_disable')}</a>
							<div className="reward-arrow" />
						</div>
						<div className="reward-ghosty" style={{backgroundImage: this.ghostyGrey}} />
					</div>
				</div>}
			</div>
		);
	}
}

export default OfferCard;
