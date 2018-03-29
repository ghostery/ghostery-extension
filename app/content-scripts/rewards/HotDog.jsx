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
		}
		this.test();
	}

	test() {
		setInterval(() => {
			this.setState({
				rewardsCount: ++this.state.rewardsCount
			});
		}, 3000);
	}

	render() {
		return (
			<div className="ghostery-rewards-container ghostery-top ghostery-right ghostery-collapsed">
				<div className="ghostery-box">
					{ this.state.rewardsCount } new Rewards were discovered!
				</div>
			</div>
		);
	}
}

export default HotDog;
