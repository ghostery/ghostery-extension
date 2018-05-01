import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import msgModule from '../utils/msg';
import { log } from '../../../src/utils/common';

const msg = msgModule('hotdog');
const { sendMessage } = msg;

class HotDog extends Component {
	constructor(props) {
		super(props);
		console.log('constructor props:', props);
		this.state = {
			closed: false
		};

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
		if (nextProps.reward) {
			this.sendSignal('offer_notification_hotdog', nextProps);
		}
	}

	sendSignal(actionId, props) {
		props = props || this.props;

		// Cliqz metrics
		const offerId = props.reward.offer_id;
		const message = {
			offerId,
			actionId
		};
		if (props.port) {
			props.port.postMessage({
				name: 'rewardSignal',
				message
			});
		} else {
			sendMessage('rewardSignal', message);
		}
	}

	navigate() {
		this.sendSignal('offer_click_hotdog');
		if (this.iframeEl) {
			this.iframeEl.classList.add('offer-card');
		}
		this.props.history.push('/offercard');
	}

	close() {
		this.sendSignal('offer_closed_hotdog');
		if (this.iframeEl) {
			this.iframeEl.classList = '';
		}
		this.setState({
			closed: true
		});
	}

	render() {
		console.log('render props', this.props);
		return (
			<div className="ghostery-rewards-component">
				{ this.state.closed !== true &&
					<div>
						<div onClick={this.navigate} className="hot-dog-container" style={{ backgroundImage: this.ghostyStar }} >
							<div className="ghostery-reward-text">
								1 {t('rewards_new_text')}!
							</div>
						</div>
						<div className="hot-dog-close" onClick={this.close} style={{ backgroundImage: this.closeIcon }} />
					</div>
				}
			</div>
		);
	}
}

export default withRouter(HotDog);
