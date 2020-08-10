/**
 * Tooltip Component
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
		this.parentNode = this.node.parentNode;
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
	 * Implements mouseenter. Sets a delay for showing the tooltip with a default of 1 second.
	 */
	delayHover() {
		const { delay } = this.props;
		const delayType = typeof delay;
		const timerDelay = (delayType === 'number' || delayType === 'string') ? +delay : 1000;
		this.delay = setTimeout(() => {
			this.enter();
		}, timerDelay);
	}

	/**
	 * Sets the state for Show.
	 */
	enter() {
		const { disabled, showNotification, alertText } = this.props;
		this.setState({ show: true });
		if (disabled && showNotification && alertText) {
			showNotification({ text: alertText, classes: 'warning', filter: 'tooltip' });
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
		const {
			theme, position, header, body
		} = this.props;
		const { show } = this.state;
		const compClassNames = ClassNames({
			'dark-theme': theme === 'dark',
		});

		return (
			<span ref={(node) => { this.node = node; }} className={compClassNames}>
				{show && (
					<span className={`tooltip-content ${position}`}>
						{header &&
						<div className="tooltip-header">{header}</div>
						}
						{body &&
						<div className="tooltip-body">{body}</div>
						}
					</span>
				)}
			</span>
		);
	}
}

export default Tooltip;
