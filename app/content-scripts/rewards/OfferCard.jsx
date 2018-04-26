import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import msgModule from '../utils/msg';
import { log } from '../../../src/utils/common';
import Notification from './Notification';
import Settings from './Settings';
import ClickOutside from '../../panel/components/helpers/ClickOutside';

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
			showNotification: false,
			showSettings: false,
			rewardUI: props.reward && props.reward.offer_data && props.reward.offer_data.ui_info.template_data || {},
			// rewardUI: mockData,
			imageLoads: {
				logo: false,
				content: false,
			}
		};

		// @TODO sendMessage to add "seen" flag to reward object
		if (this.props.port) {
			this.props.port.postMessage({ name: 'rewardSeen', message: {data: 'test'} });
		} else {
			sendMessage('rewardSeen', {data: 'test'});
		}

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
		this.toggleSettings = this.toggleSettings.bind(this);
		this.handleImageLoaded = this.handleImageLoaded.bind(this);

		// Cliqz metrics
		this.sendSignal('offer_shown');
	}

	sendSignal(type) {
		// @param type = ['offer_shown', 'offer_ca_action', 'offer_closed']
		if (this.props.port) {
			this.props.port.postMessage({ name: 'rewardsSignal', message: {
				id: this.props.reward.offer_id,
				type
			}});
		} else {
			sendMessage('rewardsSignal', {
				id: this.props.reward.offer_id,
				type
			});
		}
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

	toggleSettings(e) {
		console.log('toggle settings')
		this.setState({
			showSettings: !this.state.showSettings
		});
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

	handleImageLoaded(e) {
		e.target.classList.remove('hide');
	}

	render() {
		console.log('render props:', this.props);
		console.log('render title:', this.state);
		return (
			// @TODO condition for hide class
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
								<img src={this.state.rewardUI.logo_url} className="hide" onLoad={this.handleImageLoaded} />
							</div>
								<div
									onClick={this.toggleSettings}
									className="reward-settings-kebab"
									style={{backgroundImage: this.kebabIcon}}
									ref={(node) => { this.kebab = node; }}
								/>
								{ this.state.showSettings &&
									<div className="rewards-settings-container">
										<ClickOutside excludeEl={this.kebab} onClickOutside={this.toggleSettings}>
											<Settings disable={this.disableRewards} />
										</ClickOutside>
									</div>
								}
						</div>
						<div className="reward-content-img">
							<div className="flex-grow" />
							<img src={this.state.rewardUI.picture_url} className="hide" onLoad={this.handleImageLoaded} />
							<div className="flex-grow" />
						</div>
						<div className="reward-content-detail">
							<span className="reward-benefit">
								{ this.state.rewardUI.benefit }
							</span>
							<span className="reward-headline">
								{ this.state.rewardUI.headline }
							</span>
							<span className="reward-description">
								{ this.state.rewardUI.desc }
							</span>
						</div>
						<div className="reward-code">
							<div>
								{this.state.rewardUI.code}
								<input readOnly className="reward-code-input" value={this.state.rewardUI.code} type="text" />
							</div>
							<a onClick={this.copyCode}>{this.state.copyText}</a>
						</div>
						<div className="reward-content-footer">
							{/* <span> {t('rewards_expire')} { this.props.reward.expireTime } </span> */}
							{/* <a target="_blank" href={this.props.reward.termsLink}> { t('rewards_terms_conditions') } </a> */}
						</div>
						<a target="_blank" href={this.state.rewardUI.call_to_action && this.state.rewardUI.call_to_action.url} className="reward-redeem">
							{this.state.rewardUI.call_to_action.text}
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
