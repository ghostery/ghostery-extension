import React from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab';

export default class Tabs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTabIndex: 0
		};
	}

	handleTabClick = (tabIndex) => {
		if (tabIndex === this.state.activeTabIndex) {
			return;
		}

		this.setState({
			activeTabIndex: tabIndex
		});
	}

	// Encapsulate <Tabs/> component API as props for <Tab/> children
	renderChildrenWithTabsApiAsProps() {
		return React.Children.map(this.props.children, (child, index) => React.cloneElement(child, {
			onClick: this.handleTabClick,
			tabIndex: index,
			isActive: index === this.state.activeTabIndex
		}));
	}

	// Render current active tab content
	renderActiveTabContent() {
		const { children } = this.props;
		const { activeTabIndex } = this.state;
		if (children[activeTabIndex]) {
			return children[activeTabIndex].props.children;
		}
		return null;
	}

	render() {
		return (
			<div className="tabs-wrapper">
				<ul className="tabs-nav">
					{this.renderChildrenWithTabsApiAsProps()}
				</ul>
				<div className="tabs-active-content">
					{this.renderActiveTabContent()}
				</div>
			</div>
		);
	}
}
