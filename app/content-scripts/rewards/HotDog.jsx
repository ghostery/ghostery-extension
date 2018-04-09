import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
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
		this.navigate = this.navigate.bind(this);
	}

	navigate() {
		this.props.history.push('/offercard');
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
					<div>
						<div onClick={this.navigate} className={`hot-dog-container`}>
							<div className={`ghostery-reward-text`}>
								1 {t('rewards_new_text')}!
							</div>
						</div>
						<div className="ghostery-reward-close" onClick={this.close} />
					</div>
				}
			</div>
		);
	}
}

export default withRouter(HotDog);
