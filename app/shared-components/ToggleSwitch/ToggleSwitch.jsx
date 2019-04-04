/**
 * Toggle Switch Component
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
import ClassNames from 'classnames';

/**
 * A Functional React component for a Toggle Switch
 * @return {JSX} JSX for rendering a Toggle Switch
 * @memberof SharedComponents
 */
const ToggleSwitch = (props) => {
	const switchClassNames = ClassNames('ToggleSwitch', {
		'ToggleSwitch--active': props.checked,
	});

	return (
		<div className={switchClassNames} onClick={props.onChange}>
			<div className="ToggleSwitch__bar" />
			<span className="ToggleSwitch__circle" />
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
ToggleSwitch.propTypes = {
	checked: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default ToggleSwitch;
