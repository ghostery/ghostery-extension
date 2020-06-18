/**
 * Tabs Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';

class Tabs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTabIndex: 0,
		};
	}

	handleTabClick = (tabIndex) => {
		const { activeTabIndex } = this.state;
		if (tabIndex === activeTabIndex) {
			return;
		}

		this.setState({
			activeTabIndex: tabIndex,
		});
	}

	renderTabsNavigation = () => {
		const { children } = this.props;
		const { activeTabIndex } = this.state;
		return React.Children.map(children, (child, index) => React.cloneElement(child, {
			onClick: this.handleTabClick,
			tabIndex: index,
			isActive: index === activeTabIndex,
		}));
	}

	renderActiveTabContent = () => {
		const { children } = this.props;
		const { activeTabIndex } = this.state;
		if (children[activeTabIndex]) {
			return children[activeTabIndex].props.children;
		}
		return null;
	}

	render() {
		return (
			<div className="Tabs__component">
				<ul className="Tabs__navigation flex-container">
					{this.renderTabsNavigation()}
				</ul>
				<div className="Tabs__active_content">
					{this.renderActiveTabContent()}
				</div>
			</div>
		);
	}
}

// ToDo: Validate that Tabs Children is Tab.
//       Tried:
//				children: PropTypes.oneOfType([
//					PropTypes.shape({
//						type: Tab
//					}),
//					PropTypes.arrayOf(
//						PropTypes.shape({
//							type: Tab
//						})
//					)
//				]).isRequired,
//       But failed because of this: https://github.com/vadimdemedes/ink/issues/37
Tabs.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Tabs;
