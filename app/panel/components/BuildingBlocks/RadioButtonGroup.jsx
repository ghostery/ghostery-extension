/**
 * Radio Button Group Component
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

/* eslint jsx-a11y/label-has-associated-control: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import RadioButton from './RadioButton';

/**
 * @class Implements a radio button group
 * @memberof PanelBuildingBlocks
 */
const RadioButtonGroup = ({ indexClicked, handleItemClick, labels }) => {
	const labelsEl = labels.map(label => (
		<div key={label} className="RadioButtonGroup__label">
			{t(label)}
		</div>
	));

	const buttons = labels.map((label, index) => (
		<div key={label} className="RadioButtonGroup__button">
			<RadioButton
				checked={index === indexClicked}
				handleClick={() => handleItemClick(index)}
			/>
		</div>
	));

	return (
		<div className="RadioButtonGroup__container">
			<div className="flex-container align-justify RadioButtonGroup__labelContainer">
				{labelsEl}
			</div>
			<div className="flex-container align-justify RadioButtonGroup__buttonsContainer">
				{buttons}
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
RadioButtonGroup.propTypes = {
	labels: PropTypes.arrayOf(PropTypes.string).isRequired,
	handleItemClick: PropTypes.func.isRequired,
	indexClicked: PropTypes.number.isRequired
};


export default RadioButtonGroup;
