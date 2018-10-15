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
import ClassNames from 'classnames';
import { NavLink } from 'react-router-dom';

/**
 * Helper render function for rendering a list item for the Navigation Main section
 * @param  {Object} item the menu list item
 * @return {JSX} JSX of the Navigation Menu Item
 */
function _renderMenuItem(item, disableNav) {
	const linkClassNames = ClassNames('flex-container align-middle', {
		disabled: disableNav,
	});

	return (
		<div key={`menu-item-${item.href.substring(1)}`} className="SideNavigation__item SideNavigation__menuItem flex-container align-middle">
			<NavLink to={item.href} exact={item.href === '/'} className={linkClassNames}>
				<div className={`SideNavigation__menuIcon ${item.icon}`} />
				<div className="SideNavigation__menuText">{item.text}</div>
			</NavLink>
		</div>
	);
}

/**
 * Helper render function for rendering a list item for the Navigation Bottom
 * @param  {Object} item the bottom menu list item
 * @return {JSX} JSX of the Navigation Bottom Item
 */
function _renderBottomItem(item, disableNav) {
	const linkClassNames = ClassNames({
		disabled: disableNav,
	});
	const logoutClassNames = ClassNames('clickable', {
		disabled: disableNav,
	});

	if (item.id === 'email') {
		return (
			<div key={`bottom-item-${item.id}`} className="SideNavigation__item SideNavigation__bottomItem flex-container align-middle">
				<a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClassNames}>
					{item.text}
				</a>
			</div>
		);
	} else if (item.id === 'logout') {
		return (
			<div key={`bottom-item-${item.id}`} className="SideNavigation__item SideNavigation__bottomItem flex-container align-middle">
				<div className={logoutClassNames} onClick={item.clickHandler}>
					{item.text}
				</div>
			</div>
		);
	}

	return (
		<div key={`bottom-item-${item.id}`} className="SideNavigation__item SideNavigation__bottomItem flex-container align-middle">
			<NavLink to={item.href} className={linkClassNames}>
				{item.text}
			</NavLink>
		</div>
	);
}

/**
 * A Functional React component for rendering the Side Navigation View
 * @return {JSX} JSX for rendering the Side Navigation View of the Hub app
 * @memberof HubComponents
 */
const SideNavigationView = (props) => {
	const {
		menuItems, bottomItems, disableNav, toggleNav, expandOrCompress
	} = props;
	const topClassNamesSmall = ClassNames('SideNavigation__top small-logo hide-for-medium', {
		disabled: disableNav,
	});
	const topClassNamesMedium = ClassNames('SideNavigation__top medium-logo hide-for-small-only', {
		disabled: disableNav,
	});

	return (
		<div
			className={`SideNavigation flex-container flex-dir-column ${expandOrCompress}`}
			onMouseEnter={() => toggleNav('SideNavigation--expanded')}
			onMouseLeave={() => toggleNav('SideNavigation--compressed')}
		>
			<NavLink to="/" className={topClassNamesSmall} />
			<NavLink to="/" className={topClassNamesMedium} />
			<div className="SideNavigation__menu flex-child-grow flex-container flex-dir-column">
				{menuItems.map(item => _renderMenuItem(item, disableNav))}
			</div>
			<div className="SideNavigation__bottom flex-container flex-dir-column">
				{bottomItems.map(item => _renderBottomItem(item, disableNav))}
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
		id: PropTypes.string.isRequired,
		text: PropTypes.string.isRequired,
		href: PropTypes.string,
		clickHandler: PropTypes.func,
	})).isRequired,
	disableNav: PropTypes.bool.isRequired,
};

export default SideNavigationView;
