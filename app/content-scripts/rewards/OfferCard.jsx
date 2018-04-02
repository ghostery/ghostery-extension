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
			<div className="ghostery-offer-card">
				offer card
			</div>
		);
	}
}

export default OfferCard;
