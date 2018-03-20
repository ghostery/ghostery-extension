/**
 * Pause Button Component
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
import ClassNames from 'classnames';
import Tooltip from '../Tooltip';

/**
 * @class Implements the Pause button on the Summary view.
 * @memberof PanelClasses
 */
class PauseButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showDropdown: false,
		};

		// Event Bindings
		this.clickDropdownCaret = this.clickDropdownCaret.bind(this);
		this.clickDropdownPause = this.clickDropdownPause.bind(this);
		this.clickOutside = this.clickOutside.bind(this);
	}

	/**
	 * Handles the click event for the Dropdown Caret
	 */
	clickDropdownCaret() {
		if (!this.state.showDropdown) {
			this.setState({ showDropdown: true });
			document.body.addEventListener('click', this.clickOutside);
		} else {
			this.setState({ showDropdown: false });
			document.body.removeEventListener('click', this.clickOutside);
		}
	}

	/**
	 * Handles clicking outside the dropdown menu when the menu is exposed
	 * @param  {Object} event the click event
	 */
	clickOutside(event) {
		const classes = event.target.className || '';
		if (classes && typeof classes === 'string' && (classes.indexOf('button-caret') !== -1 || classes.indexOf('dropdown-clickable') !== -1)) {
			return;
		}
		document.body.removeEventListener('click', this.clickOutside);
		this.setState({ showDropdown: false });
	}

	/**
	 * Handles the click event for timed pause in the dropdown list
	 */
	/**
	 * Handles the click event for timed pause in the dropdown list
	 * @param  {int} time The time in minutes that Ghostery should be paused`
	 */
	clickDropdownPause(time) {
		this.setState({ showDropdown: false });
		document.body.removeEventListener('click', this.clickOutside);
		this.props.clickPause(time);
	}

	/**
	 * Helper render function for the dropdown list
	 * @return {JSX} JSX for the dropdown list
	 */
	renderDropdown() {
		const { isPausedTimeout } = this.props;

		function dropdownItemClassName(value) {
			return ClassNames('dropdown-item', 'clickable', 'dropdown-clickable', {
				selected: value === isPausedTimeout / 60000,
			});
		}

		return (
			<div className="dropdown">
				{this.props.dropdownItems.map(item => (
					<div className={dropdownItemClassName(item.val)} key={item.name} onClick={() => { this.clickDropdownPause(item.val); }}>
						<span className="dropdown-clickable">{item.name}</span>
					</div>
				))}
			</div>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Pause Button on the Summary View
	 */
	render() {
		const pauseButtonClassNames = ClassNames('button', 'button-left', 'button-pause', {
			active: this.props.isPaused,
			'dropdown-open': this.state.showDropdown,
		});
		const dropdownButtonClassNames = ClassNames('button', 'button-right', 'button-caret', {
			active: this.state.showDropdown,
			'dropdown-open': this.state.showDropdown,
		});
		const dropdownContainerClassNames = ClassNames('button-group', 'dropdown-container', {
			centered: this.props.isCentered,
		});

		return (
			<div className="sub-component pause-button">
				<div className="button-group">
					<div className={pauseButtonClassNames} onClick={this.props.clickPause}>
						<span>
							{this.props.isPaused ? t('summary_resume_ghostery') : t('summary_pause_ghostery')}
						</span>
					</div>
					<div className={dropdownButtonClassNames} onClick={this.clickDropdownCaret}>
						<span className="show-for-sr">
							{t('summary_show_menu')}
						</span>
					</div>
				</div>
				<div className={dropdownContainerClassNames}>
					{this.state.showDropdown && this.renderDropdown()}
				</div>
			</div>
		);
	}
}

export default PauseButton;
