/**
 * Tab Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class Tab extends React.Component {
	handleTabClick = (event) => {
		event.preventDefault();
		this.props.onClick(this.props.tabIndex);
	}

	render() {
		return (
			<li className="tab-item">
				<a
					className={`tab-link ${this.props.linkClassName} ${this.props.isActive ? 'active' : ''}`}
					onClick={this.handleTabClick}
				>
					{this.props.tabLabel}
				</a>
			</li>
		);
	}
}

Tab.propTypes = {
	onClick: PropTypes.func,
	tabIndex: PropTypes.number,
	isActive: PropTypes.bool,
	tabLabel: PropTypes.string.isRequired,
	linkClassName: PropTypes.string.isRequired
};

Tab.defaultProps = {
	onClick: () => null,
	tabIndex: -1,
};

Tab.defaultProps = {
	isActive: false,
};
