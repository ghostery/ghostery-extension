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
			closed: false
		};
		this.close = this.close.bind(this);
	}

	close() {
		this.setState({
			closed: true
		});
	}

	render() {
		return (
			<div className="ghostery-reward-card">
				<div className="reward-card-header">
					Ghostery Rewards Beta Logo
				</div>
				<div className="reward-card-content">
					<div className="reward-content-header">
						content header
					</div>
					<div className="reward-content-img">
						reward image
					</div>
					<div className="reward-content-detail">
						reward details
					</div>
					<button className="reward-redeem">
						{t('rewards_redeem_now')}
					</button>
				</div>
			</div>
		);
	}
}

export default OfferCard;
