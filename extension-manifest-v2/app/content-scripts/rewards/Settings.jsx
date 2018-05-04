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
		return (
			<div>
				{!this.state.closed &&
					<div className="rewards-settings-container rewards-popup-container">
						<div className="rewards-settings">
							<div className="close" onClick={this.close} style={{ backgroundImage: this.closeIcon }} />
							<a onClick={this.props.signal} href="https://www.ghostery.com/faqs" target="_blank" rel="noopener noreferrer" className="about">{t('rewards_about')}</a>
							<div className="disable" onClick={() => { this.close(); this.props.disable(); }}>
								{t('rewards_disable')}
							</div>
							<div className="flex-grow" />
							{/* <div className="settings">{t('rewards_settings')}</div>
							<div className="delete">{t('rewards_delete')}</div> */}
						</div>
					</div>}
			</div>
		);
	}
}

export default Settings;
