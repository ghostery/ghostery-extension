/**
 * Tabs Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

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

	renderTabsNav = () => React.Children.map(this.props.children, (child, index) => React.cloneElement(child, {
		onClick: this.handleTabClick,
		tabIndex: index,
		isActive: index === this.state.activeTabIndex
	}));

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
			<div className="tabs-wrapper">
				<ul className="tabs-nav">
					{this.renderTabsNav()}
				</ul>
				<div className="tabs-active-content">
					{this.renderActiveTabContent()}
				</div>
			</div>
		);
	}
}
