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
	const { menuItems, bottomItems, user } = props;
	return (
		<div className="SideNavigation flex-container flex-dir-column">
			<NavLink to="/" className="SideNavigation__top" />
			<div className="SideNavigation__menu flex-child-grow flex-container flex-dir-column">
				{menuItems.map(item => (
					<div key={`menu-item-${item.href.substring(1)}`} className="SideNavigation__item SideNavigation__menuItem  flex-container align-middle">
						<NavLink to={item.href} exact={item.href === '/'} className="flex-container align-middle">
							<div className={`SideNavigation__menuIcon ${item.icon}`} />
							<div className="SideNavigation__menuText">{item.text}</div>
						</NavLink>
					</div>
				))}
			</div>
			{ user ? (
				<div className="SideNavigation__bottom flex-container flex-dir-column">
					{bottomItems.map(item => (
						<div key={item.id} className="SideNavigation__item SideNavigation__bottomItem flex-container align-middle">
							<span className="logged-in" onClick={item.clickHandler} >{item.text}</span>
						</div>
					))}
				</div>
			) : (
				<div className="SideNavigation__bottom flex-container flex-dir-column">
					{bottomItems.map(item => (
						<div key={`bottom-item-${item.href.substring(1)}`} className="SideNavigation__item SideNavigation__bottomItem flex-container align-middle">
							<NavLink to={item.href}>
								{item.text}
							</NavLink>
						</div>
					))}
				</div>
			)}
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
		href: PropTypes.string,
		id: PropTypes.string,
		clickHandler: PropTypes.func,
		text: PropTypes.string.isRequired,
	})).isRequired,
};

export default SideNavigationView;
