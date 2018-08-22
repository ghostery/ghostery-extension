/**
 * Toggle Checkbox Component
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

/**
 * A Functional React component for a Toggle Checkbox
 * @return {JSX} JSX for rendering a Toggle Checkbox
 * @memberof SharedComponents
 */
const ToggleCheckbox = (props) => {
	const checkboxClassNames = ClassNames('ToggleCheckbox', {
		'ToggleCheckbox--active': props.checked,
	});

	return (
		<div className={checkboxClassNames} onClick={props.onChange}>
			<svg viewBox="0 0 24 24">
				{props.checked ? (
					<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
				) : (
					<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
				)}
			</svg>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
ToggleCheckbox.propTypes = {
	checked: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default ToggleCheckbox;
