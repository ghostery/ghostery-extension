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
/**
 * @class Implements tooltip component used throughout the views.
 * @memberof PanelClasses
 */
class Tooltip extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false,
		};
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
	 * Set 1 sec delay for showing the tooltip.
	 */
	delayHover = (e) => {
		this.delay = setTimeout(() => {
			this.enter();
		}, 1000);
	}
	/**
	 * Set tooltip show state.
	 */
	enter = () => {
		this.setState({ show: true });
	}
	/**
	 * Implement handler for mouseleave event and hide the tooltip.
	 */
	leave = (e) => {
		clearTimeout(this.delay);
		this.setState({ show: false });
	}
	/**
	 * Render Tooltip component.
	 * @return {ReactComponent} 	ReactComponent instance
	 */
	render() {
		return (
			<span>
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
