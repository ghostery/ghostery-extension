/**
 * Tab Component
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
import ClassNames from 'classnames';

class Tab extends React.Component {
	handleTabClick = (event) => {
		event.preventDefault();
		const { onClick, tabIndex } = this.props;
		onClick(tabIndex);
	}

	render() {
		const { isActive, tabLabel, linkClassName } = this.props;
		const tabClassNames = ClassNames('Tab__navigation_item flex-container align-center-middle', {
			'Tab--active': isActive,
		});
		const tabLinkClassNames = ClassNames('Tab__navigation_link', linkClassName, {
			'Tab--active': isActive,
		});

		return (
			<li className={tabClassNames} onClick={this.handleTabClick}>
				<a className={tabLinkClassNames}>
					{tabLabel}
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
	linkClassName: PropTypes.string.isRequired,
};

Tab.defaultProps = {
	onClick: () => null,
	tabIndex: -1,
	isActive: false,
};

export default Tab;
