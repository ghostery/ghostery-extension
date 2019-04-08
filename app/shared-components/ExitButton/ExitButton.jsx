/**
 * Exit Button Component
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
import { NavLink } from 'react-router-dom';

/**
 * A Functional React component for a Exit Button
 * @return {JSX} JSX for rendering a Exit Button
 * @memberof SharedComponents
 */
const ExitButton = (props) => {
	const {
		hrefExit,
		textExit,
	} = props;

	return (
		<NavLink to={hrefExit} className="ExitButton__exit flex-container align-middle">
			{textExit && (
				<span className="ExitButton__exitText">{textExit}</span>
			)}
			<span className="ExitButton__exitIcon" />
		</NavLink>
	);
};

// PropTypes ensure we pass required props of the correct type
ExitButton.propTypes = {
	hrefExit: PropTypes.string.isRequired,
	textExit: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.string,
	]).isRequired,
};

export default ExitButton;
