/**
 * Click Outside Component
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
/**
 * @namespace  PanelComponentHelpers
 */
import React, { Component } from 'react';
/**
 * @class Implement Click Outside component which handles
 * clicks outside of designated component
 * @memberOf PanelComponentHelpers
 */
class ClickOutside extends React.Component {
	constructor(props) {
		super(props);

		// event bindings
		this.getContainer = this.getContainer.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
	}
	/**
	 * Lifecycle event. Set 'click' event listener
	 */
	componentDidMount() {
		document.addEventListener('click', this.clickHandler, true);
	}
	/**
	 * Lifecycle event. Remove 'click' event listener
	 */
	componentWillUnmount() {
		document.removeEventListener('click', this.clickHandler, true);
	}
	/**
	 * Set designated component which has ref attribute
	 * @param {Object} ref  	DOM element being referenced
	 */
	getContainer(ref) {
		this.container = ref;
	}
	/**
	 * Implement handler for mouseclick. Trigger onClickOutside action
	 * which is supplied by component which uses Click Outside Component
	 * @param  {Object} e    mouseclick event
	 */
	clickHandler(e) {
		const el = this.container;
		if (!el.contains(e.target)
			&& !el.contains(e.path[0])
			&& e.target !== this.props.excludeEl
			&& e.path[0] !== this.props.excludeEl) {
			console.log('call the click handler');
			this.props.onClickOutside(e);
		}
	}
	/**
	* Render Click Outside Component
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		return <div ref={this.getContainer}>{ this.props.children }</div>;
	}
}

export default ClickOutside;
