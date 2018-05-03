import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import msgModule from '../utils/msg';
import { computeTimeDelta } from '../../panel/utils/utils';
import { log } from '../../../src/utils/common';
import Notification from './Notification';
import Settings from './Settings';
import ClickOutside from '../../panel/components/helpers/ClickOutside';
import Tooltip from '../../panel/components/Tooltip';

const msg = msgModule('rewards');
const { sendMessage } = msg;

class OfferCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			closed: false,
			copyText: t('rewards_copy_code'),
			showPrompt: this.props.conf.rewardsPromptAccepted ? false : 1,
			showSettings: false,
			rewardUI: props.reward && props.reward.offer_data && props.reward.offer_data.ui_info.template_data || {},
		};

		this.iframeEl = window.parent.document.getElementById('ghostery-iframe-container');
		if (this.iframeEl) {
			this.iframeEl.classList = '';
			this.iframeEl.classList.add('offer-card');
		}

		this.betaLogo = `url(${chrome.extension.getURL('app/images/rewards/ghostery-rewards-beta.png')})`;
		this.closeIcon = `url(${chrome.extension.getURL('app/images/drawer/x.svg')})`;
		this.ghostyGrey = `url(${chrome.extension.getURL('app/images/rewards/ghosty-grey.svg')})`;
		this.kebabIcon = `url(${chrome.extension.getURL('app/images/rewards/settings-kebab.svg')})`;

		this.closeOfferCard = this.closeOfferCard.bind(this);
		this.copyCode = this.copyCode.bind(this);
		this.disableRewards = this.disableRewards.bind(this);
		this.disableRewardsNotification = this.disableRewardsNotification.bind(this);
		this.toggleSettings = this.toggleSettings.bind(this);
		this.handleImageLoaded = this.handleImageLoaded.bind(this);
		this.handlePrompt = this.handlePrompt.bind(this);

		this.notifications = [
			{
				type: 'first-prompt',
				buttons: true,
				message: t('rewards_first_prompt'),
				textLink: {
					href: 'https://www.ghostery.com/faqs',
					text: 'Learn More'
				},
				closeCallback: (option) => { this.handlePrompt(1, option); },
			},
			{
				type: 'second-prompt',
				buttons: true,
				message: t('rewards_second_prompt'),
				textLink: {},
				closeCallback: (option) => { this.handlePrompt(2, option); },
			},
			{
				type: 'disabled-message',
				buttons: false,
				message: t('rewards_disable_notification'),
				textLink: {
					text: t('rewards_disable_confirm')
				},
				closeCallback: this.closeOfferCard,
			}
		];
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.reward) {
			this.sendSignal('offer_shown', nextProps);
			this.sendSignal('offer_dsp_session', nextProps);
		}
	}

	messageBackground(name, message) {
		if (this.props.port) {
			this.props.port.postMessage({
				name,
				message
			});
		} else {
			sendMessage(name, message);
		}
	}

	sendSignal(actionId, props = this.props) {
		// Cliqz metrics
		const offerId = props.reward.offer_id;
		const message = {
			offerId,
			actionId
		};
		this.messageBackground('rewardSignal', message);
	}

	copyCode() {
		this.sendSignal('code_copied');
		this.offerCardRef.querySelector('.reward-code-input').select();
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
		if (!this.state.showSettings) {
			this.sendSignal('offer_settings');
		}
		this.setState({
			showSettings: !this.state.showSettings
		});
	}

	disableRewards() {
		this.sendSignal('rewards_off');
		this.messageBackground('rewardsDisabled');
	}

	disableRewardsNotification() {
		this.disableRewards();
		this.setState({
			showPrompt: 3
		});
	}

	handlePrompt(promptNumber, option) {
		// @TODO update user settings
		if (promptNumber === 1) {
			if (!option) {
				this.setState({
					showPrompt: 2
				});
				return;
			}
		} else if (promptNumber === 2) {
			if (option) {
				this.disableRewards();
				this.closeOfferCard();
				return;
			}
		}
		this.setState({
			showPrompt: false
		});
		this.messageBackground('rewardsPromptAccepted');
	}

	closeOfferCard() {
		if (this.iframeEl) {
			this.iframeEl.classList = '';
		}
		this.setState({
			closed: true
		});
	}

	redeem() {
		this.sendSignal('offer_ca_action');
	}

	handleImageLoaded(e) {
		e.target.classList.remove('hide');
	}

	renderNotification(type) {
		const notificationProps = this.notifications[type];
		return (
			<Notification data={notificationProps} />
		);
	}

	renderExpiresText() {
		const { expirationMs } = this.props.reward.offer_data;
		const expireDays = Math.round((new Date()).setDate(new Date().getDate() + expirationMs / 60 / 60 / 24));
		const delta = computeTimeDelta(new Date(expireDays), new Date());
		return t('rewards_expires_in', [delta.count, t(`rewards_expires_in_${delta.type}`)]);
	}

	render() {
		return (
			// @TODO condition for hide class
			<div ref={(ref) => { this.offerCardRef = ref; }} className="ghostery-rewards-component">
				{ this.state.closed !== true &&
				<div className="ghostery-reward-card">
					{ this.state.showPrompt === 1 &&
						this.renderNotification(0)
					}
					{ this.state.showPrompt === 2 &&
						this.renderNotification(1)
					}
					{ this.state.showPrompt === 3 &&
						this.renderNotification(2)
					}
					<div className="reward-card-header">
						<div className="rewards-logo-beta" style={{ backgroundImage: this.betaLogo }} />
						<div
							className="reward-card-close"
							onClick={(e) => { this.sendSignal('offer_closed_card'); this.closeOfferCard(); }}
							style={{ backgroundImage: this.closeIcon }}
						/>
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
								style={{ backgroundImage: this.kebabIcon }}
								ref={(node) => { this.kebabRef = node; }}
							/>
							{ this.state.showSettings &&
							<div className="rewards-settings-container">
								<ClickOutside excludeEl={this.kebabRef} onClickOutside={this.toggleSettings}>
									<Settings disable={this.disableRewardsNotification} />
								</ClickOutside>
							</div>
							}
						</div>
						<div className="reward-content-img">
							<div className="flex-grow" />
							<img src={this.state.rewardUI.picture_url} className="hide" onLoad={this.handleImageLoaded} />
							<div className="flex-grow" />
						</div>
						<div className="flex-grow" />
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
						<div className="flex-grow" />
						<div className="reward-code">
							<div>
								{this.state.rewardUI.code}
								<input readOnly className="reward-code-input" value={this.state.rewardUI.code} type="text" />
							</div>
							<a onClick={this.copyCode}>{this.state.copyText}</a>
						</div>
						<div className="reward-content-footer">
							<span>
								{ this.renderExpiresText() }
							</span>
							{this.state.rewardUI.conditions &&
								<div className="reward-terms g-tooltip">
									{ t('rewards_terms_conditions') }
									<Tooltip header={this.state.rewardUI.conditions} position="top" delay="0" theme="dark" />
								</div>
							}
						</div>
						<a target="_blank" onClick={this.redeem} href={this.state.rewardUI.call_to_action && this.state.rewardUI.call_to_action.url} className="reward-redeem">
							{this.state.rewardUI.call_to_action.text}
						</a>
					</div>
					<div className="reward-footer">
						<div className="reward-feedback">
							<div className="reward-smile" />
							<a onClick={this.disableRewardsNotification}>{t('rewards_disable')}</a>
							<div className="reward-arrow" />
						</div>
						<div className="reward-ghosty" style={{ backgroundImage: this.ghostyGrey }} />
					</div>
				</div>}
			</div>
		);
	}
}

export default OfferCard;
