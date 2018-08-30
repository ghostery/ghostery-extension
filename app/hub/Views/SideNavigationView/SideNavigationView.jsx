/**
 * Side Navigation Component
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
import { NavLink } from 'react-router-dom';

const SideNavigationView = (props) => {
	const { menuItems, bottomItems } = props;

	return (
		<div className="SideNavigation flex-container flex-dir-column">
			<div className="SideNavigation__top" />
			<div className="SideNavigation__menu flex-child-grow flex-container flex-dir-column">
				{menuItems.map(item => (
					<div key={`menu-item-${item.href.substring(1)}`} className="SideNavigation__item SideNavigation__menuItem  flex-container align-middle">
						<NavLink to={item.href} exact={item.href === '/'} className="flex-container align-middle">
							<div className={`SideNavigation__menuIcon ${item.icon}`} />
							<div>{item.text}</div>
						</NavLink>
					</div>
				))}
			</div>
			<div className="SideNavigation__bottom flex-container flex-dir-column">
				{bottomItems.map(item => (
					<NavLink key={`bottom-item-${item.href.substring(1)}`} to={item.href} className="SideNavigation__item SideNavigation__bottomItem flex-container align-middle">
						{item.text}
					</NavLink>
				))}
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
SideNavigationView.propTypes = {
	menuItems: PropTypes.arrayOf(PropTypes.shape({
		href: PropTypes.string.isRequired,
		icon: PropTypes.string.isRequired,
		text: PropTypes.string.isRequired,
	})).isRequired,
	bottomItems: PropTypes.arrayOf(PropTypes.shape({
		href: PropTypes.string.isRequired,
		text: PropTypes.string.isRequired,
	})).isRequired,
};

export default SideNavigationView;
