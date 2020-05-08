/**
 * Toggle Slider Component
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
import ClassNames from 'classnames';

/**
 * @class Implements an on/off button as a slider component.
 * Is used throughout the extension: Rewards Panel, (todo: more)
 * @memberof PanelBuildingBlocks
 */
class ToggleSlider extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			checked: this.props.isChecked,
		};

		// Event Bindings
		this._handleChange = this._handleChange.bind(this);
	}

	/**
	 * Lifecycle event
	 */
	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			checked: nextProps.isChecked,
		});
	}

	/**
	 * Handles a change to the the slider. This will update the slider in one
	 * of two ways.  It can use the `onChange` property to update the isChecked
	 * property in the parent.  Or it can just set the state directly.
	 */
	_handleChange(event) {
		if (typeof this.props.onChange === 'function') {
			this.props.onChange(event);
		} else {
			this.setState(prevState => ({ checked: !prevState.checked }));
		}
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Toggle Slider used throughout the extension
	 */
	render() {
		const compClassNames = ClassNames('ToggleSlider', this.props.className);
		const labelClassNames = ClassNames('ToggleSlider__switch', {
			disabled: this.props.isDisabled,
		});
		return (
			<div className={compClassNames}>
				<label className={labelClassNames}>
					<input
						type="checkbox"
						onChange={this._handleChange}
						checked={this.state.checked}
					/>
					<span className="ToggleSlider__slider" />
					<span className="ToggleSlider__slider_circle" />
				</label>
			</div>
		);
	}
}

export default ToggleSlider;
