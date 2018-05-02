/**
 * Tooltip Component
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

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ClassNames from 'classnames';

/**
 * @class Implements a Tooltip component that is used in many panel views.
 * @memberof PanelClasses
 */
class Tooltip extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false,
		};

		// Event Bindings
		this.delayHover = this.delayHover.bind(this);
		this.enter = this.enter.bind(this);
		this.leave = this.leave.bind(this);
	}

	/**
	 * Lifecycle event. Set listeners.
	 */
	componentDidMount() {
		// eslint-disable-next-line react/no-find-dom-node
		this.parentNode = ReactDOM.findDOMNode(this).parentNode;
		this.parentNode.addEventListener('mouseenter', this.delayHover);
		this.parentNode.addEventListener('mouseleave', this.leave);
		this.parentNode.addEventListener('click', this.leave);
	}

	/**
	 * Lifecycle event. Remove listeners.
	 */
	componentWillUnmount() {
		this.parentNode.removeEventListener('mouseenter', this.delayHover);
		this.parentNode.removeEventListener('mouseleave', this.leave);
		this.parentNode.removeEventListener('click', this.leave);
	}

	/**
	 * Implements mouseenter. Sets adelay for showing the tooltip with a default of 1 second.
	 */
	delayHover() {
		const delayType = typeof this.props.delay;
		const delay = (delayType === 'number' || delayType === 'string') ? +this.props.delay : 1000;
		this.delay = setTimeout(() => {
			this.enter();
		}, delay);
	}

	/**
	 * Sets the state for Show.
	 */
	enter() {
		this.setState({ show: true });
		if (this.props.disabled && this.props.showNotification && this.props.alertText) {
			this.props.showNotification({ text: this.props.alertText, classes: 'warning', filter: 'tooltip' });
		}
	}

	/**
	 * Implements mouseleave.
	 */
	leave() {
		clearTimeout(this.delay);
		this.setState({ show: false });
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Tooltip component
	 */
	render() {
		const compClassNames = ClassNames({
			'dark-theme': this.props.theme === 'dark',
		});

		return (
			<span className={compClassNames}>
				{this.state.show &&
					<span className={`tooltip-content ${this.props.position}`}>
						{this.props.header &&
							<div className="tooltip-header">{this.props.header}</div>
						}
						{this.props.body &&
							<div className="tooltip-body">{this.props.body}</div>
						}
					</span>
				}
			</span>
		);
	}
}

export default Tooltip;
