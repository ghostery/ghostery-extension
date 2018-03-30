import React, { Component } from 'react';
import msgModule from '../utils/msg';
import { log } from '../../../src/utils/common';
import '../../scss/rewards.scss';

const msg = msgModule('hotdog');
const { sendMessage } = msg;
const { onMessage } = chrome.runtime;

class HotDog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rewardsCount: 1
		};
	}

	render() {
		return (
			<div className="ghostery-rewards-container ghostery-top ghostery-right ghostery-collapsed">
				<div className="ghostery-box">
					<div className={`ghostery-reward-text ${this.state.rewardsCount > 0 ? 'show' : 'hide'}`}>
						{`${this.state.rewardsCount} ${this.state.rewardsCount > 1 ? t('rewards_text_plural') : t('rewards_text_single')}`}
					</div>
					<div className="ghostery-reward-close" />
				</div>
			</div>
		);
	}
}

export default HotDog;
