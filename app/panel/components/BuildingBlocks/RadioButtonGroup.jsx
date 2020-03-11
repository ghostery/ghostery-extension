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
class RadioButtonGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buttons: []
		};
	}

	componentDidMount() {
		const buttons = new Array(this.props.items.length).fill(false);
		buttons[this.props.selectedIndex] = true;
		this.setState({ buttons });
	}

	handleClick(indexClicked) {
		const { buttons } = this.state;
		const updatedButtons = buttons.map((button, index) => (index === indexClicked));
		this.setState({ buttons: updatedButtons });
		this.props.handleItemClick(indexClicked);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Toggle Slider used throughout the extension
	 */
	render() {
		const { buttons } = this.state;
		return (
			this.props.items.map((item, index) => (
				<div className="flex-container align-middle align-justify RadioButtonGroup__container">
					<span className="RadioButtonGroup__label">
						{t(item.text)}
					</span>
					<div>
						<RadioButton key={buttons[index]} checked={buttons[index]} handleClick={() => this.handleClick(index)} />
					</div>
				</div>
			))
		);
	}
}

// PropTypes ensure we pass required props of the correct type
RadioButtonGroup.propTypes = {
	items: PropTypes.arrayOf(PropTypes.object).isRequired, // Number of objects in array is the number of radio buttons
	handleItemClick: PropTypes.func.isRequired,
	selectedIndex: PropTypes.number.isRequired
};


export default RadioButtonGroup;
