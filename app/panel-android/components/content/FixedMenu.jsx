import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';

export default class FixedMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			currentMenuItemText: this.defaultHeaderText,
		};
	}

	get defaultHeaderText() {
		return 'Enhanced Options';
	}

	get cliqzModuleData() {
		return this.props.cliqzModuleData || {};
	}

	get antiTrackingData() {
		return this.cliqzModuleData.antitracking || {};
	}

	get adBlockData() {
		return this.cliqzModuleData.adblock || {};
	}

	get smartBlockData() {
		return this.props.panel.smartBlock || {};
	}

	getCount = (type) => {
		let total = 0;
		switch (type) {
			case 'enable_anti_tracking':
				for (const category in this.antiTrackingData) {
					if (this.antiTrackingData.hasOwnProperty(category)) {
						for (const app in this.antiTrackingData[category]) {
							if (this.antiTrackingData[category][app] === 'unsafe') {
								total++;
							}
						}
					}
				}
				return total;
			case 'enable_ad_block':
				return this.adBlockData && this.adBlockData.totalCount || 0;
			case 'enable_smart_block':
				Object.keys(this.smartBlockData.blocked || {}).forEach((key) => {
					total++;
				});
				Object.keys(this.smartBlockData.unblocked || {}).forEach((key) => {
					total++;
				});
				return total;
			default:
				return 0;
		}
	}

	toggleMenu = () => {
		const currentState = this.state.open;
		this.setState({
			open: !currentState,
		});
	}

	updateHeadeText = (text) => {
		const textToShow = text || this.defaultHeaderText;

		this.setState({
			currentMenuItemText: textToShow,
		});
	}

	render() {
		return (
			<div className={`fixed-menu ${this.state.open ? 'opened' : ''}`}>
				<div onClick={this.toggleMenu} className="menuHeader">
					<p>{this.state.currentMenuItemText}</p>
				</div>
				<ul className="menuContent">
					<li className="menuItem">
						<MenuItem
							active={this.props.panel.enable_anti_tracking}
							updateHeadeText={this.updateHeadeText}
							type="anti_tracking"
							title="Enhanced Anti-Tracking"
							numData={this.getCount('enable_anti_tracking')}
							headline="Personal data points anonymized"
							description="Anonymize unblocked and unknown trackers for greater browsing protection."
						/>
					</li>
					<li className="menuItem">
						<MenuItem
							active={this.props.panel.enable_ad_block}
							updateHeadeText={this.updateHeadeText}
							type="ad_block"
							title="Enhanced Ad Blocking"
							numData={this.getCount('enable_ad_block')}
							headline="Advertisements blocked"
							description="Block all advertisements on websites you visit."
						/>
					</li>
					<li className="menuItem">
						<MenuItem
							active={this.props.panel.enable_smart_block}
							updateHeadeText={this.updateHeadeText}
							type="smart_block"
							title="Smart Blocking"
							numData={this.getCount('enable_smart_block')}
							headline="Smart Blocking"
							description="Automatically block and unblock trackers to optimize page performance."
						/>
					</li>
				</ul>
			</div>
		);
	}
}

FixedMenu.propTypes = {
	panel: PropTypes.object, // eslint-disable-line react/forbid-prop-types
	cliqzModuleData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

FixedMenu.defaultProps = {
	panel: {},
	cliqzModuleData: {},
};
