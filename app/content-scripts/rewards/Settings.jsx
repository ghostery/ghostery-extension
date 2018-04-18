import React, { Component } from 'react';

class Settings extends Component {
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
				{!this.state.closed && <div className="rewards-settings-container rewards-popup-container">
					<div className="rewards-settings">
						<div className="close" onClick={this.close} style={{backgroundImage: this.closeIcon}} />
						<div className="settings-text"></div>
					</div>
				</div>}
			</div>
		);
	}
}

export default Settings;
