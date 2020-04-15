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
const RadioButtonGroup = (props) => {
	const { indexClicked, handleItemClick } = props;
	return (
		props.items.map((item, index) => (
			<div className="flex-container align-justify RadioButtonGroup__container" key={`${index * 2}`}>
				<span className="RadioButtonGroup__label">
					{t(item.text)}
				</span>
				<div>
					<RadioButton
						checked={index === indexClicked}
						handleClick={() => handleItemClick(index)}
					/>
				</div>
			</div>
		))
	);
};

// PropTypes ensure we pass required props of the correct type
RadioButtonGroup.propTypes = {
	items: PropTypes.arrayOf(PropTypes.object).isRequired, // Number of objects in array is the number of radio buttons
	handleItemClick: PropTypes.func.isRequired,
	indexClicked: PropTypes.number.isRequired
};


export default RadioButtonGroup;
