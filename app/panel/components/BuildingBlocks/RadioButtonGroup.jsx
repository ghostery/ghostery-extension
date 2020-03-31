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
			buttonState: []
		};
	}

	componentDidMount() {
		const buttonState = new Array(this.props.labels.length).fill(false);
		buttonState[this.props.selectedIndex] = true;
		this.setState({ buttonState });
	}

	handleClick(indexClicked) {
		const { buttonState } = this.state;
		const updatedButtonState = buttonState.map((button, index) => (index === indexClicked));
		this.setState({ buttonState: updatedButtonState });
		this.props.handleItemClick(indexClicked);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Toggle Slider used throughout the extension
	 */
	render() {
		const { buttonState } = this.state;
		return (
			this.props.labels.map((label, index) => (
				<div className="flex-container align-justify RadioButtonGroup__container" key={label}>
					<span className="RadioButtonGroup__label">
						{t(label)}
					</span>
					<div>
						<RadioButton checked={buttonState[index]} handleClick={() => this.handleClick(index)} />
					</div>
				</div>
			))
		);
	}
}

// PropTypes ensure we pass required props of the correct type
RadioButtonGroup.propTypes = {
	labels: PropTypes.arrayOf(PropTypes.string).isRequired,
	handleItemClick: PropTypes.func.isRequired,
	selectedIndex: PropTypes.number.isRequired
};


export default RadioButtonGroup;
