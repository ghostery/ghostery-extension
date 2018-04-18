import React, { Component } from 'react';

class Notification extends Component {
	constructor(props) {
		super(props);
		this.closeIcon = `url(${chrome.extension.getURL('app/images/rewards/white-x.svg')})`;
		this.state = {
			closed: false
		};

		this.close = this.close.bind(this);
	}

	close() {
		this.setState({
			closed: true
		});
		if (typeof this.props.closeCallback === 'function') {
			this.props.closeCallback();
		}
	}

	render() {
		return(
			<div>
				{!this.state.closed && <div className="rewards-notification-container">
					<div className="rewards-notification">
						<div className="close" onClick={this.close} style={{backgroundImage: this.closeIcon}} />
						<div className="notification-text">{t('rewards_disable_notification')}</div>
						<a className="notification-text" onClick={this.close}>{t('rewards_disable_confirm')}</a>
					</div>
				</div>}
			</div>
		);
	}
}

export default Notification;
