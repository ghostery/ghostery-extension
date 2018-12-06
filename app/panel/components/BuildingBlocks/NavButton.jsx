/**
 * StatsView Component
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
import ReactSVG from 'react-svg';
import { NavLink } from 'react-router-dom';

/**
 * A Functional React component for rendering the button which navigates to specified view
 * @return {JSX} JSX for rendering the the button
 * @memberof PanelClasses
 */
const NavButton = (props) => {
	/**
	 * Render stats view
	 * @return {ReactComponent}   ReactComponent instance
	 */
	const {
		path,
		params,
		imagePath,
		classNames
	} = props;

	return (
		<NavLink to={{ pathname: path, params }} className={classNames} >
			<ReactSVG path={imagePath} />
		</NavLink>
	);
};

export default NavButton;
