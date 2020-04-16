/**
 * Radio Button Component
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
 * @class Implements a single radio button to be used inside the RadioButtonGroup component
 * @memberof PanelBuildingBlocks
 */

const RadioButton = (props) => {
	const { checked, handleClick } = props;
	const OuterCircleClassNames = ClassNames('RadioButton__outerCircle', {
		checked,
	});
	const InnerCircleClassNames = ClassNames('RadioButton__innerCircle', {
		checked,
	});
	return (
		<span>
			<span className={OuterCircleClassNames} onClick={handleClick}>
				<span className={InnerCircleClassNames} />
			</span>
		</span>
	);
};

// PropTypes ensure we pass required props of the correct type
RadioButton.propTypes = {
	checked: PropTypes.bool.isRequired,
	handleClick: PropTypes.func.isRequired,
};

export default RadioButton;
