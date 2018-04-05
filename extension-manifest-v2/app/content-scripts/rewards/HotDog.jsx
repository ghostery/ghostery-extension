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
		console.log('constructor props:', props)
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
			<div>
				{ this.state.closed !== true &&
					<div className={`hot-dog-container`}>
						<Link to="/offercard">
							<div className="ghostery-box">
								<div className={`ghostery-reward-text`}>
									1 {t('rewards_new_text')}!
								</div>
							</div>
						</Link>
						<div className="ghostery-reward-close" onClick={this.close} />
					</div> }
			</div>
		);
	}
}

export default HotDog;
