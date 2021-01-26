/**
 * Step Navigator Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * A React class component for rendering the StepNavigator, a container for all the views in a setup step
 * @return {JSX} JSX for rendering the Step Progress bar of the ghostery-browser-intro-hub app
 * @memberof GhosteryBrowserHubContainers
 */
class StepNavigator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			screen: 0,
		};
	}

	next = () => {
		const { components } = this.props;
		this.setState(state => ({ screen: (state.screen + 1) % components.length }));
	}

	prev = () => {
		const { components } = this.props;
		this.setState(state => ({ screen: ((state.screen - 1) + components.length) % components.length }));
	}

	render() {
		const { components, step } = this.props;
		const { screen } = this.state;

		const Screen = components[screen];

		return (
			<Screen step={step} next={this.next} prev={this.prev} />
		);
	}
}

// PropTypes ensure we pass required props of the correct type
StepNavigator.propTypes = {
	step: PropTypes.number.isRequired,
	components: PropTypes.arrayOf(PropTypes.elementType.isRequired).isRequired,
};

export default StepNavigator;
