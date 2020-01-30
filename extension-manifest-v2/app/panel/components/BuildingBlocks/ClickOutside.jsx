/**
 * Click Outside Component
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
/**
 * @class Implement Click Outside component which handles
 * clicks outside of designated component
 * @memberOf PanelBuildingBlocks
 */
class ClickOutside extends React.Component {
	constructor(props) {
		super(props);

		// event bindings
		this.getContainer = this.getContainer.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
		this.listenerEl = this.props.offsetParent || document;
	}

	/**
	 * Lifecycle event. Set 'click' event listener
	 */
	componentDidMount() {
		this.listenerEl.addEventListener('click', this.clickHandler, true);
	}

	/**
	 * Lifecycle event. Remove 'click' event listener
	 */
	componentWillUnmount() {
		this.listenerEl.removeEventListener('click', this.clickHandler, true);
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
		// Simple polyfill for Event.composedPath
		if (!('composedPath' in Event.prototype)) {
			Event.prototype.composedPath = function() {
				const path = [];
				let el = this.target;
				while (el) {
					path.push(el);
					if (el.tagName === 'HTML') {
						path.push(document);
						path.push(window);
						break;
					}
					el = el.parentElement;
				}
				return path;
			};
		}
		const el = this.container;
		const ePath = e.path || (e.composedPath && e.composedPath());
		if (
			!el.contains(e.target)
			&& e.target !== this.props.excludeEl
			&& !el.contains(ePath[0])
			&& ePath[0] !== this.props.excludeEl
		) {
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
