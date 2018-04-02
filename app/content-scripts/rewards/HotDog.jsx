import React, { Component } from 'react';
import { Link } from "react-router-dom";
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
			closed: false,
			rewardsCount: 1
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
			<div>
				{ this.state.closed !== true &&
					<div className="hot-dog-container">
						<Link to="/offercard">
							<div className="ghostery-box">
								<div className={`ghostery-reward-text ${this.state.rewardsCount > 0 ? 'show' : 'hide'}`}>
									{`${this.state.rewardsCount} ${this.state.rewardsCount > 1 ? t('rewards_text_plural') : t('rewards_text_single')}!`}
								</div>
							</div>
						</Link>
						<div className="ghostery-reward-close" onClick={this.close} />
					</div>}
			</div>
		);
	}
}

export default HotDog;
