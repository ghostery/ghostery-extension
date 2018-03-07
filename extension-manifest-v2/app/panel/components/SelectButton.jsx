/**
 * Select Button Component
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
/**
 * @class Implement generic split button component
 * used currently in Pause Ghostery button on Summary view.
 * @memberof PanelClasses
 */
class SelectButton extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isOpen: false,
		};
	}
	/**
	 * Handler for mouse clicks outside of the Select Button.
	 * @param {Object} e  	mouseclick event
	 */
	clickOutside = (e) => {
		// skip if clicking on right button or select menu to avoid
		// click event conflicts
		if (this.rightButton.contains(e.target) || this.selectMenu.contains(e.target)) {
			return;
		}
		this.setState({ isOpen: false });
	}
	/**
	 * Toogle showing of the menu
	 * @return {Object}  		iOpen as its property
	 */
	toggleMenu = () => {
		this.setState((prevState, props) => {
			if (!prevState.isOpen) {
				document.body.addEventListener('click', this.clickOutside);
			} else {
				document.body.removeEventListener('click', this.clickOutside);
			}
			return { isOpen: !prevState.isOpen };
		});
	}
	/**
	 * Handle click on a menu item
	 */
	listClickHandler = (item) => {
		this.toggleMenu();
		this.props.callback(item.val);
	}
	/**
	 * Handle click on the button itself
	 */
	buttonClickHandler = () => {
		if (this.state.isOpen) {
			this.toggleMenu();
		}
		this.props.callback();
	}
	/**
	 * Render Select Button component.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const listItems = this.props.menuItems.map((item, idx) => (
			<li className={this.props.selectedItemValue === item.val ? 'selected' : ''} key={item.name} onClick={() => { this.listClickHandler(item); }}>
				<div className="item-wrapper">
					<div className="bullet" />
					{item.name}
				</div>
			</li>
		));

		return (
			<div className="select-button-wrapper g-tooltip">
				<div>
					<button
						disabled={this.props.disabled}
						className={`blocking-controls controls-pause select-button button left-button ${(this.props.active ? 'active' : '')} ${(this.props.disabled ? 'disabled' : '')}`}
						onClick={this.buttonClickHandler}
					>
						{ (this.props.iconClass) &&
							<div className={`${this.props.iconClass} ${(this.props.active ? 'resume' : 'pause')}`} />
						}
						<span className="select-title">{this.props.active ? this.props.altLabel : this.props.label}</span>
					</button>
					<button
						disabled={this.props.disabled}
						ref={(ref) => { this.rightButton = ref; }}
						className={`blocking-controls select-button right-button button ${this.state.isOpen ? 'rotate' : ''}`}
						onClick={this.toggleMenu}
					/>
					{ this.props.children }
				</div>
				{this.state.isOpen ?
					<div className="select-menu" ref={(ref) => { this.selectMenu = ref; }}>
						<ul>
							{listItems}
						</ul>
					</div>
					:
					null
				}
			</div>
		);
	}
}

export default SelectButton;
