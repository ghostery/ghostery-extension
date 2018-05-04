import React, { Component } from 'react';

class Notification extends Component {
	constructor(props) {
		super(props);
		this.closeIcon = `url(${chrome.extension.getURL('app/images/rewards/white-x.svg')})`;
		this.state = {
			closed: false
		};

		this.closeNotification = this.closeNotification.bind(this);
	}

	closeNotification(confirm = null) {
		this.setState({
			closed: true
		});
		if (typeof this.props.data.closeCallback === 'function' && confirm !== null) {
			this.props.data.closeCallback(confirm);
		}
	}

	render() {
		return (
			<div>
				{!this.state.closed &&
					<div className="rewards-notification-container rewards-popup-container">
						<div className={`rewards-notification ${this.props.data.type}`}>
							<div className="close" onClick={() => { this.closeNotification(); }} style={{ backgroundImage: this.closeIcon }} />
							<div className="notification-text">
								{this.props.data.message}
							</div>
							{this.props.data.buttons &&
								<div className="notification-buttons">
									<div onClick={(e) => { this.closeNotification(true); }}>
										Yes
									</div>
									<div onClick={(e) => { this.closeNotification(false); }}>
										No
									</div>
								</div>
							}
							{this.props.data.textLink
								&& <a className="notification-text" href={this.props.data.textLink.href} target="_blank" onClick={this.props.data.textLink.callback || this.props.data.closeCallback}>{this.props.data.textLink.text}</a>
							}
						</div>
					</div>
				}
			</div>
		);
	}
}

export default Notification;
